import React from 'react';

import { THEME, SuiteThemeColors } from '@trezor/components';
import {
    ActionButton,
    ActionColumn,
    Row,
    Section,
    SectionItem,
    TextColumn,
} from '@suite-components/Settings';
import * as suiteActions from '@suite-actions/suiteActions';
import { useSelector, useActions } from '@suite-hooks';

export const DarkModePalette = () => {
    const { setTheme, setAutodetect } = useActions({
        setTheme: suiteActions.setTheme,
        setAutodetect: suiteActions.setAutodetect,
    });
    const { theme } = useSelector(state => ({
        theme: state.suite.settings.theme,
    }));

    return (
        <Section title="Dark mode palette">
            <SectionItem>
                <TextColumn title="Reset palette" />
                <ActionColumn>
                    <ActionButton variant="secondary" onClick={() => setTheme('dark', undefined)}>
                        Reset
                    </ActionButton>
                </ActionColumn>
            </SectionItem>
            {Object.entries(THEME.dark).map(kv => {
                const colorName = kv[0] as keyof SuiteThemeColors;
                const defaultColorHex = kv[1];
                return (
                    <Row key={colorName}>
                        {colorName}
                        <input
                            onChange={e => {
                                setAutodetect({ theme: false });
                                const color = e.target.value;
                                setTheme('custom', {
                                    ...THEME.dark,
                                    ...theme.colors,
                                    ...{ [colorName]: color },
                                });
                            }}
                            type="color"
                            value={theme.colors?.[colorName] ?? defaultColorHex}
                        />
                    </Row>
                );
            })}
        </Section>
    );
};
