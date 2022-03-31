import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker, IExchangeBase } from "../types/common";

export class bitmonedero<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitmonedero",
      baseUrl: "https://www.bitmonedero.com/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch(
      `${this.baseUrl}/${base.toLowerCase()}-${quote.toLowerCase()}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.buy_btc_ars,
      ask: res.buy_btc_ars,
      bid: res.sell_btc_ars,
      vol: 0,
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch(
      `${this.baseUrl}/${base.toLowerCase()}-${quote.toLowerCase()}`,
    );

    return {
      asks: [
        {
          price: res.buy_btc_ars,
          amount: 1,
        },
      ],
      bids: [
        {
          price: res.sell_btc_ars,
          amount: 1,
        },
      ],
    };
  }
}
