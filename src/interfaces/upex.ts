import { IOrderbook, ITicker } from "../utils/DTOs";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";
import { Exchange } from "./exchange";
import { isNumber } from "../utils/utils";

interface IUpexTickerRes {
  DATA: {
    orderMarketSellPrice: number;
    orderMarketBuyPrice: number;
    minPrice24H: number;
    maxPrice24H: number;
    lastPrice: number;
    dollar: number;
    btcUsd: number;
    volume24H?: any;
    variation24H: number;
  };
}

export class upex<T> extends Exchange<T> {
  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { DATA: res } = await this.fetch<IUpexTickerRes>(
      `${this.baseUrl}/Info/topbar_info`,
    );

    if (!res) {
      throw new ConnectorError(ERROR_TYPES.API_RESPONSE_ERROR, "invalid data");
    }

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.lastPrice,
      ask: res.orderMarketBuyPrice,
      bid: res.orderMarketSellPrice,
      vol: isNumber(Number(res.volume24H)) ? res.volume24H : 0,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch(`${this.baseUrl}/Order/info?uppainel=1001`);

    const parseOrder = ({ price_btc, amount_btc }) => ({
      price: price_btc,
      amount: amount_btc,
    });

    return {
      asks: res.SELL.map(parseOrder),
      bids: res.BUY.map(parseOrder),
    };
  }
}
