import React from 'react';
import { lighten } from 'polished';
import styled, { css } from 'styled-components';

import { variables } from '@trezor/components';
import { CARD_PADDING_SIZE } from '@suite-constants/layout';

const Wrapper = styled.div<{ shouldHighlight?: boolean }>`
    padding: 0 ${CARD_PADDING_SIZE};
    display: flex;
    flex-direction: column;

    &:first-of-type {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
    }

    &:last-of-type {
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
    }

    &:not(:first-child) {
        > * {
            border-top: 1px solid ${props => props.theme.STROKE_GREY};
        }
    }

    ${props =>
        props.shouldHighlight &&
        css`
            border: solid 3px ${props => props.theme.TYPE_ORANGE};
            background: ${props => lighten(0.55, props.theme.TYPE_ORANGE)};
        `}
`;

const Content = styled.div`
    display: flex;
    padding: ${CARD_PADDING_SIZE} 0;

    @media all and (max-width: ${variables.SCREEN_SIZE.SM}) {
        flex-direction: column;
    }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    shouldHighlight?: boolean;
}

const SectionItem = React.forwardRef(
    ({ children, shouldHighlight, ...rest }: Props, ref?: React.Ref<HTMLDivElement>) => (
        <Wrapper ref={ref} shouldHighlight={shouldHighlight} {...rest}>
            <Content>{children}</Content>
        </Wrapper>
    ),
);

export default SectionItem;
