import React from 'react';

import { Switch } from '@trezor/components';
import { ActionColumn, SectionItem, TextColumn } from '@suite-components/Settings';
import * as suiteActions from '@suite-actions/suiteActions';
import { useActions, useSelector } from '@suite-hooks';

export const DevBridge = () => {
    const { setDebugMode } = useActions({
        setDebugMode: suiteActions.setDebugMode,
    });
    const { debug } = useSelector(state => ({
        debug: state.suite.settings.debug,
    }));

    return (
        <SectionItem>
            <TextColumn
                title="Trezor Bridge dev mode (desktop)"
                description="Starts Trezor Bridge on port 21324"
            />
            <ActionColumn>
                <Switch
                    checked={debug.bridgeDevMode}
                    onChange={() =>
                        setDebugMode({
                            bridgeDevMode: !debug.bridgeDevMode,
                        })
                    }
                />
            </ActionColumn>
        </SectionItem>
    );
};
