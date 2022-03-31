import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker, IExchangeBase } from "../types/common";

export class bitso<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitso",
      baseUrl: "https://api.bitso.com/v3",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(
      `${
        this.baseUrl
      }/ticker/?book=${base.toLowerCase()}_${quote.toLowerCase()}`,
    );
    if (!res || !res.success) return res;
    res = res.payload;

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last),
      ask: Number(res.ask),
      bid: Number(res.bid),
      vol: Number(res.volume),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    let res = await this.fetch(
      `${
        this.baseUrl
      }/order_book/?book=${base.toLowerCase()}_${quote.toLowerCase()}`,
    );

    res = res.payload;

    return {
      asks: res.asks.map(({ price, amount }) => ({
        price: Number(price),
        amount: Number(amount),
      })),
      bids: res.bids.map(({ price, amount }) => ({
        price: Number(price),
        amount: Number(amount),
      })),
    };
  }
}
