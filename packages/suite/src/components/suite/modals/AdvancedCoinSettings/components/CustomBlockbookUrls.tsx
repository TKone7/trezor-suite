import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import TrezorConnect, { BlockchainLink } from 'trezor-connect';
import { Input, Button, Tooltip, Select, H3 } from '@trezor/components';
import { Translation, TooltipSymbol, StatusLight, CollapsibleBox } from '@suite-components';
import { isUrl } from '@suite-utils/validators';
import { useTranslation } from '@suite-hooks/useTranslation';
import InputError from '@wallet-components/InputError';
import * as walletSettingsActions from '@settings-actions/walletSettingsActions';
import { useActions, useSelector } from '@suite-hooks';
import ConnectionInfo from './ConnectionInfo';
import type { Network } from '@wallet-types';
import type { BackendType } from '@wallet-reducers/settingsReducer';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    text-align: left;
    & > * + * {
        margin-top: 8px;
    }
`;

const AddUrlButton = styled(Button)`
    align-self: end;
    margin-top: 0;
`;

const Heading = styled(H3)`
    color: ${props => props.theme.TYPE_DARK_GREY};
    margin-bottom: 6px;
`;

const TooltipContent = styled.div`
    display: flex;
    flex-direction: column;
`;

const SaveButton = styled(Button)`
    width: 200px;
    margin-top: 30px;
    align-self: center;
`;

const TransparentCollapsibleBox = styled(CollapsibleBox)`
    background: transparent;
    box-shadow: none;
    margin-top: 16px;
    & > div:first-child {
        padding: 12px 0;
        border-top: 1px solid ${props => props.theme.STROKE_GREY};
        &:hover {
            background-color: ${props => props.theme.BG_LIGHT_GREY};
        }
    }
`;

const Capitalize = styled.span`
    text-transform: capitalize;
`;

type BackendOption = BackendType | 'default';

type BackendSettings = {
    type: BackendOption;
    urls: string[];
};

const useDefaultSettings = (coin: Network['symbol']): BackendSettings => {
    const [link, setLink] = useState<BlockchainLink>();
    useEffect(() => {
        TrezorConnect.getCoinInfo({ coin }).then(result => {
            if (result.success) {
                setLink(result.payload.blockchainLink);
            }
        });
    }, [coin]);
    return {
        type: link?.type as BackendOption,
        urls: link?.url ?? [],
    };
};

const useInitialSettings = (coin: Network['symbol']): BackendSettings => {
    const { backend } = useSelector(state => ({
        backend: state.wallet.settings.backends[coin],
    }));
    return {
        type: backend?.type ?? (coin === 'regtest' ? 'blockbook' : 'default'),
        urls: backend?.urls ?? [],
    };
};

const useBackendSettings = (initial: BackendSettings) => {
    const [currentValues, setCurrentValues] = useState(initial);

    const changeType = (option: { value: BackendSettings['type'] }) => {
        setCurrentValues({
            type: option.value,
            urls: [],
        });
    };

    const addUrl = (url: string) => {
        setCurrentValues(({ type, urls }) => ({
            type,
            urls: [...urls, url],
        }));
    };

    const removeUrl = (url: string) => {
        setCurrentValues(({ type, urls }) => ({
            type,
            urls: urls.filter(u => u !== url),
        }));
    };

    return {
        currentValues,
        changeType,
        addUrl,
        removeUrl,
        editable: currentValues.type !== 'default',
    };
};

const validateUrl = (type: BackendOption, value: string) => {
    switch (type) {
        case 'blockbook':
            return isUrl(value);
        case 'electrum':
            return /^[a-zA-Z0-9.]+:[0-9]{1,5}:[ts]$/.test(value);
        default:
            return false;
    }
};

const useUrlInput = (type: BackendOption, currentUrls: string[]) => {
    const { register, watch, setValue, errors } = useForm<{ url: string }>({
        mode: 'onChange',
    });

    const name = 'url';
    const ref = register({
        validate: (value: string) => {
            // Check if URL is valid
            if (!validateUrl(type, value)) {
                return 'TR_CUSTOM_BACKEND_INVALID_URL';
            }

            // Check if already exists
            if (currentUrls.find(url => url === value)) {
                return 'TR_CUSTOM_BACKEND_BACKEND_ALREADY_ADDED';
            }
        },
    });

    return {
        name,
        ref,
        error: errors[name],
        value: watch(name) || '',
        reset: () => setValue(name, ''),
    };
};

const getBackendOptions = (network: Network) => {
    const backends: BackendOption[] = [];
    if (network.symbol !== 'regtest') backends.push('default');
    if (network.networkType !== 'ripple') backends.push('blockbook');
    // if (network.symbol === 'btc') backends.push('electrum');
    return backends.map(backend => ({
        label:
            backend === 'default' ? (
                <Translation id="TR_BACKEND_DEFAULT_SERVERS" />
            ) : (
                <Translation
                    id="TR_BACKEND_CUSTOM_SERVERS"
                    values={{ type: <Capitalize>{backend}</Capitalize> }}
                />
            ),
        value: backend,
    }));
};

const getUrlPlaceholder = (network: Network, type: BackendOption) => {
    switch (type) {
        case 'blockbook':
            return `https://${network.symbol}1.trezor.io/`;
        case 'electrum':
            return `electrum.foobar.com:50001:t`;
        default:
            return '';
    }
};

const InputAddon = ({
    onRemove,
    active,
    inputHovered,
}: {
    onRemove?: () => void;
    active: boolean;
    inputHovered?: boolean;
}) => {
    if (onRemove && inputHovered)
        return <Button variant="tertiary" icon="CROSS" onClick={onRemove} />;
    if (active)
        return (
            <Tooltip content={<Translation id="TR_ACTIVE" />}>
                <StatusLight status="ok" />
            </Tooltip>
        );
    return null;
};

interface Props {
    network: Network;
    onCancel: () => void;
}

const CustomBlockbookUrls = ({ network, onCancel }: Props) => {
    const { symbol: coin } = network;
    const { translationString } = useTranslation();
    const { setBackend } = useActions({
        setBackend: walletSettingsActions.setBackend,
    });
    const { blockchain } = useSelector(state => ({
        blockchain: state.wallet.blockchain,
    }));

    const defaultSettings = useDefaultSettings(coin);
    const initialSettings = useInitialSettings(coin);
    const { currentValues, changeType, addUrl, removeUrl, editable } =
        useBackendSettings(initialSettings);
    const input = useUrlInput(currentValues.type, currentValues.urls);

    const save = () => {
        const { type, urls } = currentValues;
        const lastUrl = input.value && !input.error ? [input.value] : [];
        setBackend({
            coin,
            type: type === 'default' ? 'blockbook' : type,
            urls: type === 'default' ? [] : urls.concat(lastUrl),
        });
        onCancel();
    };

    const backendOptions = getBackendOptions(network);

    return (
        <Wrapper>
            <Heading>
                <Translation id="TR_BACKENDS" />
                <TooltipSymbol
                    content={
                        <TooltipContent>
                            <Translation id="SETTINGS_ADV_COIN_BLOCKBOOK_DESCRIPTION" />
                            <Translation
                                id="TR_DEFAULT_VALUE"
                                values={{
                                    value: defaultSettings.urls.join(', ') ?? '',
                                }}
                            />
                        </TooltipContent>
                    }
                />
            </Heading>

            {!!backendOptions.length && (
                <Select
                    value={backendOptions.find(({ value }) => value === currentValues.type)}
                    onChange={changeType}
                    options={backendOptions}
                    noTopLabel
                    data-test="@settings/advance/select-type"
                />
            )}

            {(editable ? currentValues.urls : defaultSettings.urls).map(url => (
                <Input
                    key={url}
                    value={url}
                    noTopLabel
                    isDisabled
                    noError
                    innerAddon={
                        <InputAddon
                            onRemove={editable ? () => removeUrl(url) : undefined}
                            active={url === blockchain[coin]?.url}
                        />
                    }
                />
            ))}

            {editable && (
                <Input
                    type="text"
                    noTopLabel
                    name={input.name}
                    data-test={`@settings/advance/${input.name}`}
                    placeholder={translationString('SETTINGS_ADV_COIN_URL_INPUT_PLACEHOLDER', {
                        url: getUrlPlaceholder(network, currentValues.type),
                    })}
                    innerRef={input.ref}
                    state={input.error ? 'error' : undefined}
                    bottomText={<InputError error={input.error} />}
                />
            )}

            {editable && (
                <AddUrlButton
                    variant="tertiary"
                    icon="PLUS"
                    data-test="@settings/advance/button/add"
                    onClick={() => {
                        addUrl(input.value);
                        input.reset();
                    }}
                    isDisabled={!!input.error || input.value === ''}
                >
                    <Translation id="TR_ADD_NEW_BLOCKBOOK_BACKEND" />
                </AddUrlButton>
            )}

            <TransparentCollapsibleBox
                variant="large"
                heading={<Translation id="SETTINGS_ADV_COIN_CONN_INFO_TITLE" />}
            >
                <ConnectionInfo coin={coin} />
            </TransparentCollapsibleBox>

            <SaveButton
                variant="primary"
                onClick={save}
                isDisabled={!!input.error}
                data-test="@settings/advance/button/save"
            >
                <Translation id="TR_CONFIRM" />
            </SaveButton>
        </Wrapper>
    );
};

export default CustomBlockbookUrls;
