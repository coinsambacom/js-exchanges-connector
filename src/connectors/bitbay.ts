import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker, IExchangeBase } from "../types/common";

export class bitbay<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitbay",
      baseUrl: "https://bitbay.net/API/Public",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch(
      this.baseUrl + "/" + base + quote + "/ticker.json",
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.ask,
      bid: res.bid,
      vol: res.volume,
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const normalizedBook = {
      asks: [],
      bids: [],
    };
    const res = await this.fetch(
      this.baseUrl + "/" + base + quote + "/orderbook.json",
    );
    if (!res) return normalizedBook;
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
