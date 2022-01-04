import React from 'react';
import styled from 'styled-components';
import { SettingsLayout } from '@settings-components';
import { CoinsGroup, Card } from '@suite-components';
import { useEnabledNetworks } from '@settings-hooks/useEnabledNetworks';

const StyledSettingsLayout = styled(SettingsLayout)`
    & > * + * {
        margin-top: 16px;
    }
`;

const Settings = () => {
    const { mainnets, testnets, enabledNetworks, setEnabled } = useEnabledNetworks();

    return (
        <StyledSettingsLayout>
            <Card>
                <CoinsGroup
                    networks={mainnets}
                    onToggle={setEnabled}
                    selectedNetworks={enabledNetworks}
                />
            </Card>
            <Card>
                <CoinsGroup
                    networks={testnets}
                    onToggle={setEnabled}
                    selectedNetworks={enabledNetworks}
                    testnet
                />
            </Card>
        </StyledSettingsLayout>
    );
};

export default Settings;
