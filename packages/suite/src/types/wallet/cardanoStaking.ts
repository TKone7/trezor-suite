export interface PendingStakeTx {
    accountKey: string;
    txid: string;
    blockHeight: number;
}

export interface StakingPool {
    hex: string;
    bech32: string;
}

export type CardanoStaking = {
    address: string;
    pendingStakeTx: PendingStakeTx | undefined;
    deviceAvailable: {
        status: boolean;
        reason?: 'DEVICE_LOCK' | 'DEVICE_DISCONNECTED';
    };
    actionAvailable:
        | {
              status: true;
              reason?: undefined;
          }
        | {
              status: false;
              reason: 'POOL_ID_FETCH_FAIL' | 'TX_NOT_FINAL' | 'UTXO_BALANCE_INSUFFICIENT';
          }
        | {
              status: false;
              reason?: string;
          };
    loading: boolean;
    fee?: string;
    deposit?: string;
    registeredPoolId: string | null;
    isStakingOnTrezorPool: boolean | null;
    isActive: boolean;
    rewards: string;
    delegate(): void;
    withdraw(): void;
    calculateFeeAndDeposit(action: 'delegate' | 'withdrawal'): void;
    error?: string;
};
