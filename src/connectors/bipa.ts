import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker, IExchangeBase } from "../types/common";

interface IBipaTickerRes {
  data: {
    buy_price_cents: number;
    sell_price_cents: number;
  };
}

export class bipa<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bipa",
      baseUrl: "https://prices.bipa.app",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { data: res } = await this.fetch<IBipaTickerRes>(
      `${this.baseUrl}/ftx_ticker`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.buy_price_cents / 100,
      ask: res.buy_price_cents / 100,
      bid: res.sell_price_cents / 100,
      vol: 0,
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.getTicker(base, quote);

    return {
      asks: [
        {
          price: res.ask,
          amount: 0.5,
        },
      ],
      bids: [
        {
          price: res.bid,
          amount: 0.5,
        },
      ],
    };
  }
}
