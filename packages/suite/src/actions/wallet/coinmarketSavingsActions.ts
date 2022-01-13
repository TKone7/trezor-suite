import invityAPI, {
    SavingsListResponse,
    SavingsProviderInfo,
    SavingsTradeResponse,
} from '@suite-services/invityAPI';
import { COINMARKET_SAVINGS } from './constants';

export interface SavingsInfo {
    savingsList?: SavingsListResponse;
    providerInfos: { [name: string]: SavingsProviderInfo };
    supportedFiatCurrencies: Set<string>;
    supportedCryptoCurrencies: Set<string>;
}
export type CoinmarketSavingsAction =
    | {
          type: typeof COINMARKET_SAVINGS.SAVE_SAVINGS_INFO;
          savingsInfo: SavingsInfo;
      }
    | {
          type: typeof COINMARKET_SAVINGS.SAVE_SAVINGS_TRADE_RESPONSE;
          response: SavingsTradeResponse;
      };

export const loadSavingsInfo = async (): Promise<SavingsInfo> => {
    const savingsList = await invityAPI.getSavingsList();
    const providerInfos: { [name: string]: SavingsProviderInfo } = {};
    if (savingsList?.providers) {
        savingsList.providers.forEach(e => (providerInfos[e.name] = e));
    }

    const supportedFiatCurrencies = new Set<string>();
    const supportedCryptoCurrencies = new Set<string>();
    savingsList?.providers.forEach(p => {
        if (p.tradedFiatCurrencies) {
            p.tradedFiatCurrencies
                .map(c => c.toLowerCase())
                .forEach(c => supportedFiatCurrencies.add(c));
        }
        p.tradedCoins.map(c => c.toLowerCase()).forEach(c => supportedCryptoCurrencies.add(c));
    });

    return {
        savingsList,
        providerInfos,
        supportedFiatCurrencies,
        supportedCryptoCurrencies,
    };
};

export const saveSavingsInfo = (savingsInfo: SavingsInfo): CoinmarketSavingsAction => ({
    type: COINMARKET_SAVINGS.SAVE_SAVINGS_INFO,
    savingsInfo,
});

export const saveSavingsTradeResponse = (
    response: SavingsTradeResponse,
): CoinmarketSavingsAction => ({
    type: COINMARKET_SAVINGS.SAVE_SAVINGS_TRADE_RESPONSE,
    response,
});
