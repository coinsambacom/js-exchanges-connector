import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

export class kraken<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "kraken",
      baseUrl: "https://api.kraken.com/0/public",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    if (base == "BTC") base = "XBT";
    let res = await this.fetch(this.baseUrl + "/Ticker?pair=" + base + quote);

    res = res.result[Object.keys(res.result)[0]];
    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.c[0],
      ask: res.a[0],
      bid: res.b[0],
      vol: res.v[1],
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    if (base == "BTC") base = "XBT";
    let res = await this.fetch(this.baseUrl + "/Depth?pair=" + base + quote);

    res = res.result[Object.keys(res.result)[0]];
    return {
      asks: (res.asks || []).map((order: any[]) => ({
        price: order[0],
        amount: order[1],
      })),
      bids: (res.bids || []).map((order: any[]) => ({
        price: order[0],
        amount: order[1],
      })),
    };
  }
}
