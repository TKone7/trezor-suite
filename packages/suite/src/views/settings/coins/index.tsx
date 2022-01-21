import React from 'react';
import { SettingsLayout } from '@settings-components';
import { Translation } from '@suite-components';
import { DeviceBanner } from '@suite-components/Settings';
import { useSelector, useActions, useDevice } from '@suite-hooks';
import { NETWORKS } from '@wallet-config';
import { Network } from '@wallet-types';
import * as walletSettingsActions from '@settings-actions/walletSettingsActions';
import CoinsGroup from './components/CoinsGroup';

const Settings = () => {
    const { changeCoinVisibility, changeNetworks } = useActions({
        changeCoinVisibility: walletSettingsActions.changeCoinVisibility,
        changeNetworks: walletSettingsActions.changeNetworks,
    });
    const { device, enabledNetworks, debug } = useSelector(state => ({
        device: state.suite.device,
        debug: state.suite.settings.debug,
        enabledNetworks: state.wallet.settings.enabledNetworks,
    }));

    const unavailableCapabilities = device?.unavailableCapabilities ?? {};

    const mainnetNetworksFilterFn = (n: Network) => !n.accountType && !n.testnet;

    const testnetNetworksFilterFn = (n: Network) => {
        if (n.symbol === 'regtest' && !debug.showDebugMenu) {
            return false;
        }
        return !n.accountType && 'testnet' in n && n.testnet === true;
    };

    const unavailableNetworksFilterFn = (symbol: Network['symbol']) =>
        !unavailableCapabilities[symbol];

    const enabledMainnetNetworks: Network['symbol'][] = [];
    const enabledTestnetNetworks: Network['symbol'][] = [];

    const { isLocked } = useDevice();
    const isDeviceLocked = !!device && isLocked();

    enabledNetworks.forEach(symbol => {
        const network = NETWORKS.find(n => n.symbol === symbol);
        if (!network) return;
        if (network.testnet) {
            enabledTestnetNetworks.push(network.symbol);
        } else {
            enabledMainnetNetworks.push(network.symbol);
        }
    });

    return (
        <SettingsLayout>
            {isDeviceLocked && (
                <DeviceBanner
                    title={<Translation id="TR_SETTINGS_DEVICE_BANNER_TITLE_UNAVAILABLE" />}
                    description={
                        <Translation id="TR_SETTINGS_DEVICE_BANNER_DESCRIPTION_UNAVAILABLE" />
                    }
                />
            )}
            <CoinsGroup
                label={<Translation id="TR_COINS" />}
                description={<Translation id="TR_COINS_SETTINGS_ALSO_DEFINES" />}
                enabledNetworks={enabledMainnetNetworks}
                filterFn={mainnetNetworksFilterFn}
                onToggleOneFn={changeCoinVisibility}
                onActivateAll={() =>
                    changeNetworks([
                        ...enabledTestnetNetworks.filter(unavailableNetworksFilterFn),
                        ...NETWORKS.filter(mainnetNetworksFilterFn)
                            .map(n => n.symbol)
                            .filter(unavailableNetworksFilterFn),
                    ])
                }
                onDeactivateAll={() => changeNetworks(enabledTestnetNetworks)}
                type="mainnet"
            />

            <CoinsGroup
                label={<Translation id="TR_TESTNET_COINS" />}
                description={<Translation id="TR_TESTNET_COINS_EXPLAINED" />}
                enabledNetworks={enabledTestnetNetworks}
                filterFn={testnetNetworksFilterFn}
                onToggleOneFn={changeCoinVisibility}
                onActivateAll={() =>
                    changeNetworks([
                        ...enabledMainnetNetworks.filter(unavailableNetworksFilterFn),
                        ...NETWORKS.filter(testnetNetworksFilterFn)
                            .map(n => n.symbol)
                            .filter(unavailableNetworksFilterFn),
                    ])
                }
                onDeactivateAll={() => changeNetworks(enabledMainnetNetworks)}
                type="testnet"
            />
        </SettingsLayout>
    );
};

export default Settings;
