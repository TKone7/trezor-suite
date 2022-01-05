import React from 'react';
import styled from 'styled-components';
import { variables } from '@trezor/components';
import { Translation } from '@suite-components/Translation';
import { useCardanoStaking } from '@wallet-hooks/useCardanoStaking';

const Column = styled.div`
    display: flex;
    flex-direction: column;
`;

const InfoBox = styled.div`
    display: flex;
    flex-direction: column;
    color: ${props => props.theme.TYPE_LIGHT_GREY};
    background: ${props => props.theme.BG_GREY};
    font-size: ${variables.FONT_SIZE.SMALL};
    padding: 16px;
    border-radius: 6px;
    margin: 16px 0px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const ActionInProgress = () => {
    const { pendingStakeTx } = useCardanoStaking();
    if (!pendingStakeTx) return null;
    return (
        <Column>
            <InfoBox>
                <Translation id="TR_STAKING_TX_PENDING" values={{ txid: pendingStakeTx.txid }} />
            </InfoBox>
        </Column>
    );
};

export default ActionInProgress;
