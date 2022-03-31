import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IExchangeBase, ITicker } from "../types/common";

export class ftx<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "ftx",
      baseUrl: "https://ftx.com/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    if (quote === "BRL") quote = "BRZ";
    let res = await this.fetch(`${this.baseUrl}/markets/${base}_${quote}`);

    res = res.result;
    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.ask,
      bid: res.bid,
      vol: res.quoteVolume24h / res.last,
    };
  }

  async getBook(base: any, quote: string) {
    if (quote === "BRL") quote = "BRZ";
    let res = await this.fetch(
      `${this.baseUrl}/markets/${base}_${quote}/orderbook?depth=50`,
    );

    res = res.result;
    return {
      asks: res.asks.map((order: any[]) => ({
        price: order[0],
        amount: order[1],
      })),
      bids: res.bids.map((order: any[]) => ({
        price: order[0],
        amount: order[1],
      })),
    };
  }
}
