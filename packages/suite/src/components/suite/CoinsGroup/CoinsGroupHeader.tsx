import React from 'react';
import { transparentize } from 'polished';
import styled from 'styled-components';
import { variables, Icon } from '@trezor/components';
import { Translation } from '@suite-components';

const Wrapper = styled.div`
    margin-bottom: 27px;
    align-self: flex-start;
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CoinsCount = styled.div`
    text-transform: lowercase;
`;

const SettingsWrapper = styled.div`
    border-radius: 100%;
    margin: -10px;
    padding: 10px;
    transition: 0.3s ease;
    cursor: pointer;
    &:hover {
        background-color: ${props =>
            transparentize(
                props.theme.HOVER_TRANSPARENTIZE_FILTER,
                props.theme.HOVER_PRIMER_COLOR,
            )};
    }
    @media (hover: hover) {
        display: none;
    }
`;

interface Props {
    active: number;
    total: number;
    label: React.ReactNode;
    settingsMode: boolean;
    toggleSettingsMode?: () => void;
}

const CoinsGroupHeader = ({ active, total, label, settingsMode, toggleSettingsMode }: Props) => (
    <Wrapper>
        {settingsMode ? (
            <Translation id="TR_SELECT_COIN_FOR_SETTINGS" />
        ) : (
            <CoinsCount>
                {total} {label}
                {' • '}
                {active} <Translation id="TR_ACTIVE" />
            </CoinsCount>
        )}
        <SettingsWrapper onClick={toggleSettingsMode}>
            <Icon icon={settingsMode ? 'CROSS' : 'SETTINGS'} />
        </SettingsWrapper>
    </Wrapper>
);

export default CoinsGroupHeader;
