import * as cardanoUtils from '../cardanoUtils';
import { CARDANO } from 'trezor-connect';
import * as fixtures from '../__fixtures__/cardanoUtils';

describe('cardano utils', () => {
    expect(cardanoUtils.getProtocolMagic('ada')).toEqual(CARDANO.PROTOCOL_MAGICS.mainnet);
    expect(cardanoUtils.getProtocolMagic('tada')).toEqual(1097911063);

    expect(cardanoUtils.getNetworkId('ada')).toEqual(CARDANO.NETWORK_IDS.mainnet);
    expect(cardanoUtils.getNetworkId('tada')).toEqual(CARDANO.NETWORK_IDS.testnet);

    expect(cardanoUtils.getAddressType('normal')).toEqual(CARDANO.ADDRESS_TYPE.Base);
    expect(cardanoUtils.getAddressType('legacy')).toEqual(CARDANO.ADDRESS_TYPE.Byron);

    expect(cardanoUtils.getStakingPath('normal', 1)).toEqual(`m/1852'/1815'/1'/2/0`);
    expect(cardanoUtils.getStakingPath('normal', 12)).toEqual(`m/1852'/1815'/12'/2/0`);
    expect(
        cardanoUtils.getShortFingerprint('asset1dffrfk79uxwq2a8yaslcfedycgga55tuv5dezd'),
    ).toEqual('asset1dffr…55tuv5dezd');

    // @ts-ignore params are partial
    expect(cardanoUtils.isCardanoTx({ networkType: 'cardano' }, {})).toBe(true);
    // @ts-ignore params are partial
    expect(cardanoUtils.isCardanoTx({ networkType: 'bitcoin' }, {})).toBe(false);
    // @ts-ignore params are partial
    expect(cardanoUtils.isCardanoExternalOutput({ address: 'addr1' }, {})).toBe(true);
    // @ts-ignore params are partial
    expect(cardanoUtils.isCardanoExternalOutput({ addressParameters: {} }, {})).toBe(false);

    fixtures.getChangeAddressParameters.forEach(f => {
        it(`getChangeAddressParameters: ${f.description}`, () => {
            // @ts-ignore params are partial
            expect(cardanoUtils.getChangeAddressParameters(f.account)).toMatchObject(f.result);
        });
    });

    fixtures.transformUserOutputs.forEach(f => {
        it(`transformUserOutputs: ${f.description}`, () => {
            // @ts-ignore params are partial
            expect(cardanoUtils.transformUserOutputs(f.outputs, f.maxOutputIndex)).toMatchObject(
                f.result,
            );
        });
    });

    fixtures.transformUtxos.forEach(f => {
        it(`transformUtxos: ${f.description}`, () => {
            expect(cardanoUtils.transformUtxos(f.utxo)).toMatchObject(f.result);
        });
    });

    fixtures.prepareCertificates.forEach(f => {
        it(`prepareCertificates: ${f.description}`, () => {
            expect(cardanoUtils.prepareCertificates(f.certificates)).toMatchObject(f.result);
        });
    });

    fixtures.parseAsset.forEach(f => {
        it(`parseAsset: ${f.description}`, () => {
            expect(cardanoUtils.parseAsset(f.hex)).toMatchObject(f.result);
        });
    });
});
