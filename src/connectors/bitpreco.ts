import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

export class bitpreco<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitpreco",
      baseUrl: "https://api.bitpreco.com",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getAllTickers(quote: string): Promise<ITicker[]> {
    const res = await this.fetch(
      `${this.baseUrl}/all-${quote.toLowerCase()}/ticker`,
    );

    const tickers: ITicker[] = [];
    for (const pair in res) {
      if (pair !== "success") {
        const ticker = res[pair];
        tickers.push({
          exchangeId: this.id,
          base: ticker.split("-")[0],
          quote: ticker.market.split("-")[1],
          last: ticker.last,
          ask: ticker.sell,
          bid: ticker.buy,
          vol: ticker.vol,
        });
      }
    }
    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch(
      `${this.baseUrl}/${base.toLowerCase()}-${quote.toLowerCase()}/ticker`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.sell,
      bid: res.buy,
      vol: res.vol,
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch(
      `${this.baseUrl}/${base.toLowerCase()}-${quote.toLowerCase()}/orderbook`,
    );

    return {
      asks: res.asks.map(({ price, amount }) => ({
        price,
        amount,
      })),
      bids: res.bids.map(({ price, amount }) => ({
        price,
        amount,
      })),
    };
  }
}
