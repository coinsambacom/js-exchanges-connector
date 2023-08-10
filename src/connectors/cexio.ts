import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";

export class cexio<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "cexio",
      baseUrl: "https://cex.io/api",
      opts: args?.opts,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    let res = await this.fetch(this.baseUrl + "/tickers/" + quote);

    res = res.data;
    return res.map(
      (t: {
        pair: { split: (arg0: string) => [any, any] };
        last: any;
        ask: any;
        bid: any;
        volume: any;
      }) => {
        const [base, quote] = t.pair.split(":");

        return {
          exchangeId: this.id,
          base,
          quote,
          last: t.last,
          ask: t.ask,
          bid: t.bid,
          vol: t.volume,
        };
      },
    );
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch(
      this.baseUrl + "/ticker/" + base + "/" + quote,
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
    const res = await this.fetch(
      this.baseUrl + "/order_book/" + base + "/" + quote,
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
