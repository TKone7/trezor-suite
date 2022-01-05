import { useEffect, useState, useCallback, useMemo } from 'react';
import { CardanoStaking, StakingPool } from '@wallet-types/cardanoStaking';
import { SUITE } from '@suite-actions/constants';
import trezorConnect, {
    CardanoCertificate,
    CardanoCertificateType,
    CardanoTxSigningMode,
} from 'trezor-connect';
import { useActions, useSelector } from '@suite-hooks';
import * as notificationActions from '@suite-actions/notificationActions';
import * as cardanoStakingActions from '@wallet-actions/cardanoStakingActions';
import {
    getStakingPath,
    prepareCertificates,
    transformUtxos,
    getProtocolMagic,
    getNetworkId,
    getChangeAddressParameters,
} from '@wallet-utils/cardanoUtils';
import { coinSelection, trezorUtils, CoinSelectionError } from '@fivebinaries/coin-selection';
import { getNetwork, isTestnet } from '@wallet-utils/accountUtils';
import { AppState } from '@suite-types';
import { CARDANO_STAKE_POOL_TESTNET, CARDANO_STAKE_POOL_MAINNET } from '@suite-constants/urls';

const getDeviceAvailability = (
    device: AppState['suite']['device'],
    locks: AppState['suite']['locks'],
) => {
    // Handle all external cases where it is not possible to make delegate or withdrawal action
    if (!device?.connected) {
        return {
            status: false,
            reason: 'DEVICE_DISCONNECTED',
        } as const;
    }
    if (locks.includes(SUITE.LOCK_TYPE.DEVICE)) {
        return {
            status: false,
            reason: 'DEVICE_LOCK',
        } as const;
    }

    return {
        status: true,
    };
};

export const getReasonForDisabledAction = (reason: CardanoStaking['actionAvailable']['reason']) => {
    switch (reason) {
        case 'POOL_ID_FETCH_FAIL':
            return 'TR_STAKING_TREZOR_POOL_FAIL';
        case 'UTXO_BALANCE_INSUFFICIENT':
            return 'TR_STAKING_NOT_ENOUGH_FUNDS';
        default:
            return null;
    }
};

export const useCardanoStaking = (): CardanoStaking => {
    const account = useSelector(state => state.wallet.selectedAccount.account);
    if (!account || account.networkType !== 'cardano') {
        throw Error('useCardanoStaking used for other network');
    }

    const { derivationType, device, locks } = useSelector(state => ({
        derivationType: state.wallet.settings.cardanoDerivationType,
        device: state.suite.device,
        locks: state.suite.locks,
    }));
    const { addToast, setPendingStakeTx } = useActions({
        addToast: notificationActions.addToast,
        setPendingStakeTx: cardanoStakingActions.setPendingStakeTx,
    });
    const [trezorPools, setTrezorPools] = useState<
        | {
              next: StakingPool;
              pools: StakingPool[];
          }
        | undefined
    >(undefined);

    const [deposit, setDeposit] = useState<undefined | string>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [actionAvailable, setActionAvailable] = useState<CardanoStaking['actionAvailable']>({
        status: false,
    });
    const [error, setError] = useState<string | undefined>(undefined);
    const [fee, setFee] = useState<undefined | string>(undefined);

    const network = getNetwork(account.symbol);

    const stakingPath = getStakingPath(account.accountType, account.index);
    const isStakingActive = account.misc.staking.isActive;

    const pendingStakeTxs = useSelector(state => state.wallet.cardanoStaking.pendingTx);
    const pendingStakeTx = pendingStakeTxs.find(tx => tx.accountKey === account.key);

    const rewardsAmount = account.misc.staking.rewards;
    const stakeAddress = account.misc.staking.address;
    const registeredPoolId = account.misc.staking.poolId;

    const isStakingOnTrezorPool =
        registeredPoolId && trezorPools
            ? !!trezorPools?.pools.find(p => p.bech32 === registeredPoolId)
            : null;

    const getDelegationCertificates = useCallback(() => {
        const result: CardanoCertificate[] = [
            {
                type: CardanoCertificateType.STAKE_DELEGATION,
                path: stakingPath,
                pool: trezorPools?.next.hex,
            },
        ];

        if (!isStakingActive) {
            result.unshift({
                type: CardanoCertificateType.STAKE_REGISTRATION,
                path: stakingPath,
            });
        }

        return result;
    }, [isStakingActive, stakingPath, trezorPools?.next.hex]);

    const changeAddress = useMemo(() => getChangeAddressParameters(account), [account]);

    const composeTxPlan = useCallback(
        (action: 'delegate' | 'withdrawal') => {
            if (!changeAddress) return null;
            const certificates = action === 'delegate' ? getDelegationCertificates() : [];
            const withdrawals =
                action === 'withdrawal'
                    ? [
                          {
                              amount: rewardsAmount,
                              path: stakingPath,
                              stakeAddress,
                          },
                      ]
                    : [];
            const txPlan = coinSelection(
                transformUtxos(account.utxo),
                [],
                changeAddress.address,
                prepareCertificates(certificates),
                withdrawals,
                account.descriptor,
            );

            return { txPlan, certificates, withdrawals, changeAddress };
        },
        [
            account.utxo,
            account.descriptor,
            getDelegationCertificates,
            changeAddress,
            rewardsAmount,
            stakeAddress,
            stakingPath,
        ],
    );

    const calculateFeeAndDeposit = useCallback(
        (action: 'delegate' | 'withdrawal') => {
            setLoading(true);
            try {
                const composeRes = composeTxPlan(action);
                if (composeRes) {
                    setFee(composeRes.txPlan.fee);
                    setDeposit(composeRes.txPlan.deposit);
                    setActionAvailable(
                        composeRes.txPlan.type === 'final'
                            ? {
                                  status: true,
                              }
                            : {
                                  status: false,
                                  reason: 'TX_NOT_FINAL',
                              },
                    );
                }
            } catch (err) {
                setActionAvailable({
                    status: false,
                    reason: err instanceof CoinSelectionError ? err.code : err.message,
                });
            }

            setLoading(false);
        },
        [composeTxPlan],
    );

    const signAndPushTransaction = useCallback(
        async (action: 'delegate' | 'withdrawal') => {
            const composeRes = composeTxPlan(action);
            if (!composeRes) return;

            const { txPlan, certificates, withdrawals, changeAddress } = composeRes;

            if (!txPlan || txPlan.type !== 'final') return;

            const res = await trezorConnect.cardanoSignTransaction({
                signingMode: CardanoTxSigningMode.ORDINARY_TRANSACTION,
                device,
                useEmptyPassphrase: device?.useEmptyPassphrase,
                inputs: trezorUtils.transformToTrezorInputs(txPlan.inputs, account.utxo ?? []),
                outputs: trezorUtils.transformToTrezorOutputs(
                    txPlan.outputs,
                    changeAddress.addressParameters,
                ),
                fee: txPlan.fee,
                protocolMagic: getProtocolMagic(account.symbol),
                networkId: getNetworkId(account.symbol),
                derivationType: derivationType.value,
                ...(certificates.length > 0 ? { certificates } : {}),
                ...(withdrawals.length > 0 ? { withdrawals } : {}),
            });

            if (!res.success) {
                if (res.payload.error === 'tx-cancelled') return;
                addToast({
                    type: 'sign-tx-error',
                    error: res.payload.error,
                });
            } else {
                const signedTx = trezorUtils.signTransaction(
                    txPlan.tx.body,
                    res.payload.witnesses,
                    {
                        testnet: isTestnet(account.symbol),
                    },
                );
                const sentTx = await trezorConnect.pushTransaction({
                    tx: signedTx,
                    coin: account.symbol,
                });

                if (sentTx.success) {
                    const { txid } = sentTx.payload;
                    addToast({
                        type: 'raw-tx-sent',
                        txid,
                    });
                    setPendingStakeTx(account, txid);
                } else {
                    addToast({
                        type: 'sign-tx-error',
                        error: sentTx.payload.error,
                    });
                }
            }
        },
        [account, addToast, composeTxPlan, derivationType.value, device, setPendingStakeTx],
    );

    const action = useCallback(
        async (action: 'delegate' | 'withdrawal') => {
            setError(undefined);
            setLoading(true);
            try {
                await signAndPushTransaction(action);
            } catch (error) {
                if (
                    error instanceof CoinSelectionError &&
                    error.code === 'UTXO_BALANCE_INSUFFICIENT'
                ) {
                    setError('AMOUNT_IS_NOT_ENOUGH');
                    addToast({
                        type:
                            action === 'delegate'
                                ? 'cardano-delegate-error'
                                : 'cardano-withdrawal-error',
                        error: error.code,
                    });
                } else {
                    addToast({
                        type: 'sign-tx-error',
                        error: error.message,
                    });
                }
            }
            setLoading(false);
        },
        [addToast, signAndPushTransaction],
    );

    const delegate = useCallback(() => action('delegate'), [action]);
    const withdraw = useCallback(() => action('withdrawal'), [action]);

    useEffect(() => {
        // Fetch ID of Trezor stake pool that will be used in delegation transaction
        const fetchTrezorPoolId = async () => {
            setLoading(true);
            const url = network?.testnet ? CARDANO_STAKE_POOL_TESTNET : CARDANO_STAKE_POOL_MAINNET;
            try {
                const response = await fetch(url, { credentials: 'same-origin' });
                const responseJson = await response.json();

                if (!('next' in responseJson) || !('pools' in responseJson)) {
                    throw Error('Invalid data format');
                }
                setTrezorPools({
                    next: responseJson.next,
                    pools: responseJson.pools ?? [responseJson.pool],
                });
                setLoading(false);
            } catch (err) {
                setActionAvailable({
                    status: false,
                    reason: 'POOL_ID_FETCH_FAIL',
                });
            }
            setLoading(false);
        };

        if (!trezorPools) {
            fetchTrezorPoolId();
        }
    }, [setTrezorPools, network, trezorPools]);

    return {
        deposit,
        fee,
        loading,
        pendingStakeTx,
        deviceAvailable: getDeviceAvailability(device, locks),
        actionAvailable,
        registeredPoolId,
        isActive: isStakingActive,
        rewards: rewardsAmount,
        address: stakeAddress,
        isStakingOnTrezorPool,
        delegate,
        withdraw,
        calculateFeeAndDeposit,
        error,
    };
};
