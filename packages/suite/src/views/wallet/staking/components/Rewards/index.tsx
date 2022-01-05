import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Card } from '@suite-components';
import { Button, variables, H1, Icon, Tooltip } from '@trezor/components';
import { getReasonForDisabledAction, useCardanoStaking } from '@wallet-hooks/useCardanoStaking';
import { formatNetworkAmount } from '@wallet-utils/accountUtils';
import { Translation } from '@suite-components/Translation';
import ActionInProgress from '../ActionInProgress';
import { Account } from '@suite/types/wallet';

const StyledCard = styled(Card)`
    display: flex;
    flex-direction: column;
`;

const StyledH1 = styled(H1)`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 5px;
`;

const Row = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    justify-content: space-between;
    margin-top: 10px;
`;

const Left = styled.div`
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    margin-top: 40px;
`;

const Title = styled.div`
    display: flex;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
`;

const TitleSecond = styled.div`
    display: flex;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
    margin-top: 30px;
`;

const Heading = styled.div`
    padding-left: 5px;
`;

const Value = styled.div`
    display: flex;
    margin-top: 10px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.H2};
`;

const ValueSmall = styled.div`
    margin-top: 10px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.BIG};
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Text = styled.div`
    color: ${props => props.theme.TYPE_LIGHT_GREY};
    margin-bottom: 12px;
    margin-top: 12px;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};

    &:last-child {
        margin-bottom: 0px;
    }
`;

const Rewards = (props: { account: Account }) => {
    const {
        address,
        rewards,
        withdraw,
        calculateFeeAndDeposit,
        loading,
        actionAvailable,
        deviceAvailable,
        pendingStakeTx,
    } = useCardanoStaking();
    const { account } = props;

    useEffect(() => {
        calculateFeeAndDeposit('withdrawal');
    }, [calculateFeeAndDeposit]);

    const actionButton = (
        <Button
            isLoading={loading}
            isDisabled={
                rewards === '0' ||
                !actionAvailable.status ||
                !deviceAvailable.status ||
                !!pendingStakeTx
            }
            icon="T1"
            onClick={() => withdraw()}
        >
            <Translation id="TR_STAKING_WITHDRAW" />
        </Button>
    );

    const reasonMessageId = getReasonForDisabledAction(actionAvailable?.reason);

    return (
        <StyledCard>
            <StyledH1>
                <Icon icon="CHECK" size={25} />
                <Heading>
                    <Translation id="TR_STAKING_REWARDS_TITLE" />
                </Heading>
            </StyledH1>
            <Text>
                <Translation id="TR_STAKING_REWARDS_DESCRIPTION" />
            </Text>
            <Row>
                <Left>
                    <Title>
                        <Translation id="TR_STAKING_STAKE_ADDRESS" />
                    </Title>
                    <ValueSmall>{address}</ValueSmall>
                    <TitleSecond>
                        <Translation id="TR_STAKING_REWARDS" />
                    </TitleSecond>
                    <Value>
                        {formatNetworkAmount(rewards, account.symbol)}{' '}
                        {account.symbol.toUpperCase()}
                    </Value>
                </Left>
            </Row>
            {pendingStakeTx && (
                <Row>
                    <ActionInProgress />
                </Row>
            )}

            <Right>
                {deviceAvailable.status && actionAvailable.status ? (
                    actionButton
                ) : (
                    <Tooltip
                        maxWidth={285}
                        content={reasonMessageId ? <Translation id={reasonMessageId} /> : undefined}
                    >
                        {actionButton}
                    </Tooltip>
                )}
            </Right>
        </StyledCard>
    );
};

export default Rewards;
