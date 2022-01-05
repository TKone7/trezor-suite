import React, { useEffect } from 'react';
import styled from 'styled-components';
import { formatNetworkAmount } from '@wallet-utils/accountUtils';
import { Card } from '@suite-components';
import { Button, variables, H1, Icon, Tooltip } from '@trezor/components';
import { Translation } from '@suite-components/Translation';
import { useCardanoStaking, getReasonForDisabledAction } from '@wallet-hooks/useCardanoStaking';
import ActionInProgress from '../ActionInProgress';
import { Account } from '@wallet-types';

const StyledCard = styled(Card)`
    display: flex;
    flex-direction: column;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
`;

const ColumnDeposit = styled(Column)`
    margin-left: 30px;
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

const StyledH1 = styled(H1)`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 5px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 10px;
`;

const RowLong = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-top: 10px;
`;

const Left = styled.div`
    display: flex;
    flex-direction: column;
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    margin-top: 40px;
`;

const Heading = styled.div`
    padding-left: 5px;
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

const ValueSmall = styled.div`
    margin-top: 10px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.BIG};
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Title = styled.div`
    display: flex;
    margin-top: 15px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
`;

const Delegate = (props: { account: Account }) => {
    const {
        address,
        delegate,
        deposit,
        calculateFeeAndDeposit,
        fee,
        loading,
        actionAvailable,
        deviceAvailable,
        pendingStakeTx,
    } = useCardanoStaking();
    const { account } = props;

    useEffect(() => {
        calculateFeeAndDeposit('delegate');
    }, [calculateFeeAndDeposit]);

    const actionButton = (
        <Button
            isDisabled={
                account.availableBalance === '0' ||
                !actionAvailable.status ||
                !deviceAvailable.status ||
                !!pendingStakeTx
            }
            isLoading={loading}
            onClick={() => delegate()}
            icon="T1"
        >
            <Translation id="TR_STAKING_DELEGATE" />
        </Button>
    );

    const reasonMessageId = getReasonForDisabledAction(actionAvailable?.reason);

    return (
        <StyledCard>
            <StyledH1>
                <Icon icon="CROSS" size={25} />
                <Heading>
                    <Translation id="TR_STAKING_STAKE_TITLE" />
                </Heading>
            </StyledH1>
            <Text>
                <Translation id="TR_STAKING_STAKE_DESCRIPTION" values={{ br: <br /> }} />
            </Text>
            <Row>
                <Left>
                    <Title>
                        <Translation id="TR_STAKING_STAKE_ADDRESS" />
                    </Title>
                    <ValueSmall>{address}</ValueSmall>
                </Left>
                <RowLong>
                    {actionAvailable.status && !pendingStakeTx ? (
                        // delegation is allowed
                        <>
                            <Column>
                                <Title>
                                    <Translation id="TR_STAKING_DEPOSIT" />
                                </Title>
                                <ValueSmall>
                                    {formatNetworkAmount(deposit || '0', account.symbol)}{' '}
                                    {account.symbol.toUpperCase()}
                                </ValueSmall>
                            </Column>
                            <ColumnDeposit>
                                <Title>
                                    <Translation id="TR_STAKING_FEE" />
                                </Title>
                                <ValueSmall>
                                    {formatNetworkAmount(fee || '0', account.symbol)}{' '}
                                    {account.symbol.toUpperCase()}
                                </ValueSmall>
                            </ColumnDeposit>
                        </>
                    ) : (
                        // If building a transaction fails we don't have the information about used deposit and fee required
                        <>
                            {!actionAvailable.status &&
                                actionAvailable.reason === 'UTXO_BALANCE_INSUFFICIENT' && (
                                    <Column>
                                        <InfoBox>
                                            <Translation id="TR_STAKING_NOT_ENOUGH_FUNDS" />
                                            <Translation
                                                id="TR_STAKING_DEPOSIT_FEE_DECRIPTION"
                                                values={{ feeAmount: 2 }}
                                            />
                                        </InfoBox>
                                    </Column>
                                )}
                            {pendingStakeTx && <ActionInProgress />}
                        </>
                    )}
                </RowLong>
            </Row>
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

export default Delegate;
