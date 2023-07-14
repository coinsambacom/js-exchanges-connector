import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

export class coinbase_pro<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "coinbase_pro",
      baseUrl: "https://api.pro.coinbase.com",
      opts: args?.opts,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch(
      `${this.baseUrl}/products/${base}-${quote}/ticker`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.price,
      ask: res.ask,
      bid: res.bid,
      vol: res.volume,
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch(
      `${this.baseUrl}/products/${base}-${quote}/book?level=2`,
    );

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
