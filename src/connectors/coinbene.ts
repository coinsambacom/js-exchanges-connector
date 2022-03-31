import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker, IExchangeBase } from "../types/common";

export class coinbene<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "coinbene",
      baseUrl: "http://api.coinbene.com/v1/market",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(this.baseUrl + "/ticker?symbol=" + base + quote);

    res = res.ticker["0"];
    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.ask,
      bid: res.bid,
      vol: res["24hrVol"],
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    let res = await this.fetch(
      this.baseUrl + "/orderbook?symbol=" + base + quote,
    );

    res = res.orderbook || {};

    return {
      asks: (res.asks || []).map((o: { price: number; quantity: number }) => ({
        price: o.price,
        amount: o.quantity,
      })),
      bids: (res.bids || []).map((o: { price: number; quantity: number }) => ({
        price: o.price,
        amount: o.quantity,
      })),
    };
  }
}
