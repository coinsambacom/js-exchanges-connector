import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

export class cryptomarket<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "cryptomarket",
      baseUrl: "https://api.cryptomkt.com/v1",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(this.baseUrl + "/ticker?market=" + base + quote);

    res = res.data[0];
    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last_price,
      ask: res.ask,
      bid: res.bid,
      vol: res.volume,
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    let res1 = await this.fetch(
      this.baseUrl + "/book?market=" + base + quote + "&type=sell&page=0",
    );
    let res2 = await this.fetch(
      this.baseUrl + "/book?market=" + base + quote + "&type=buy&page=0",
    );

    res1 = res1.data;
    res2 = res2.data;
    return {
      asks: res1.map((o: { price: string; amount: string }) => ({
        price: Number(o.price),
        amount: Number(o.amount),
      })),
      bids: res2.map((o: { price: string; amount: string }) => ({
        price: Number(o.price),
        amount: Number(o.amount),
      })),
    };
  }
}
