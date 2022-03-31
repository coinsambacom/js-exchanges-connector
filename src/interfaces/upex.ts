import { IExchangeBase, IOrderbook, ITicker } from "../types/common";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";
import { Exchange } from "./exchange";

class upex<T> extends Exchange<T> implements IExchangeBase {
  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(`${this.baseUrl}/Info/topbar_info`);

    res = res.DATA;

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
      vol: res.volume24H,
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

export default upex;
