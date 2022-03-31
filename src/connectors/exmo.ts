import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker, IExchangeBase } from "../types/common";

export class exmo<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "exmo",
      baseUrl: "https://api.exmo.com/v1.1",
      opts: args?.opts,
      limiter: args?.limiter,
      allTickersAllQuotes: true,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAllTickers(quote: any) {
    const res = await this.fetch(`${this.baseUrl}/ticker`);

    const tickers: ITicker[] = [];
    for (const pair in res) {
      const ticker = res[pair];
      tickers.push({
        exchangeId: this.id,
        base: pair.split("_")[0] as string,
        quote: pair.split("_")[1] as string,
        last: Number(ticker.last_trade),
        ask: Number(ticker.sell_price),
        bid: Number(ticker.buy_price),
        vol: Number(ticker.vol),
      });
    }
    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(`${this.baseUrl}/ticker`);

    res = res[`${base}_${quote}`];
    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last_trade),
      ask: Number(res.sell_price),
      bid: Number(res.buy_price),
      vol: Number(res.vol),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = (
      await this.fetch(this.baseUrl + "/order_book/?pair=" + base + "_" + quote)
    )[base + "_" + quote];

    return {
      asks: (res.ask || []).map((order: any[]) => ({
        price: order[0],
        amount: order[1],
      })),
      bids: (res.bid || []).map((order: any[]) => ({
        price: order[0],
        amount: order[1],
      })),
    };
  }
}
