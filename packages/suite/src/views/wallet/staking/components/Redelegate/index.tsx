import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Card } from '@suite-components';
import { Button, variables, Icon, Tooltip } from '@trezor/components';
import { getReasonForDisabledAction, useCardanoStaking } from '@wallet-hooks/useCardanoStaking';
import { Translation } from '@suite-components/Translation';

const StyledCard = styled(Card)`
    display: flex;
    flex-direction: column;
    margin-top: 16px;
`;

const InfoBox = styled.div`
    display: flex;
    flex-direction: column;
    color: ${props => props.theme.TYPE_LIGHT_GREY};
    font-size: ${variables.FONT_SIZE.SMALL};
    border-radius: 6px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const Title = styled.div`
    display: flex;
    color: ${props => props.theme.TYPE_DARK_GREY};
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    margin-bottom: 5px;
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    margin-top: 20px;
`;

const Heading = styled.div`
    padding-left: 5px;
`;

const Text = styled.div`
    color: ${props => props.theme.TYPE_LIGHT_GREY};
    margin-bottom: 8px;
    margin-top: 8px;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};

    &:last-child {
        margin-bottom: 0px;
    }
`;

const Redelegate = () => {
    const {
        delegate,
        calculateFeeAndDeposit,
        loading,
        actionAvailable,
        deviceAvailable,
        pendingStakeTx,
        isStakingOnTrezorPool,
    } = useCardanoStaking();

    useEffect(() => {
        calculateFeeAndDeposit('delegate');
    }, [calculateFeeAndDeposit]);

    if (isStakingOnTrezorPool || isStakingOnTrezorPool === null) return null;

    const actionButton = (
        <Button
            isLoading={loading}
            isDisabled={!actionAvailable.status || !deviceAvailable.status || !!pendingStakeTx}
            icon="T1"
            onClick={() => delegate()}
        >
            <Translation id="TR_STAKING_DELEGATE" />
        </Button>
    );

    const reasonMessageId = getReasonForDisabledAction(actionAvailable?.reason);

    return (
        <StyledCard>
            <InfoBox>
                <Title>
                    <Icon icon="INFO" size={18} />
                    <Heading>
                        <Translation id="TR_STAKING_ON_3RD_PARTY_TITLE" />{' '}
                    </Heading>
                </Title>
                <Text>
                    <Translation id="TR_STAKING_ON_3RD_PARTY_DESCRIPTION" />
                </Text>

                <Right>
                    {deviceAvailable.status && actionAvailable.status ? (
                        actionButton
                    ) : (
                        <Tooltip
                            maxWidth={285}
                            content={
                                reasonMessageId ? <Translation id={reasonMessageId} /> : undefined
                            }
                        >
                            {actionButton}
                        </Tooltip>
                    )}
                </Right>
            </InfoBox>
        </StyledCard>
    );
};

export default Redelegate;
