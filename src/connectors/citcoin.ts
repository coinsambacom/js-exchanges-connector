import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IExchangeBase, ITicker } from "../types/common";

export class citcoin<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "citcoin",
      baseUrl: "https://api.citcoin.com.br/v1",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch(
      `${this.baseUrl}/${base.toLowerCase()}/ticker`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.close,
      ask: res.close,
      bid: res.close,
      vol: res.vol,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string) {
    const res = await this.fetch(
      `${this.baseUrl}/${base.toLowerCase()}/orderbook`,
    );

    return {
      asks: res.asks.map((o: { btc_price: string; btc: string }) => ({
        price: Number(o.btc_price),
        amount: Number(o.btc),
      })),
      bids: res.bids.map((o: { btc_price: string; btc: string }) => ({
        price: Number(o.btc_price),
        amount: Number(o.btc),
      })),
    };
  }
}
