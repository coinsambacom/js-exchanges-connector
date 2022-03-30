import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

export class poloniex<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "poloniex",
      baseUrl: "https://poloniex.com/public",
      opts: args?.opts,
      limiter: args?.limiter,
      allTickersAllQuotes: true,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAllTickers(quote: string): Promise<ITicker[]> {
    const res = await this.fetch(this.baseUrl + "?command=returnTicker");

    const tickers: ITicker[] = [];
    for (const pair in res) {
      const ticker = pair[pair];
      tickers.push({
        exchangeId: this.id,
        base: ticker.split("_")[1],
        quote: ticker.split("_")[0],
        last: Number(ticker.last),
        ask: Number(ticker.lowestAsk),
        bid: Number(ticker.highestBid),
        vol: Number(ticker.quoteVolume),
      });
    }
    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(this.baseUrl + "?command=returnTicker");

    res = res[quote + "_" + base];
    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last),
      ask: Number(res.lowestAsk),
      bid: Number(res.highestBid),
      vol: Number(res.quoteVolume),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch(
      `${this.baseUrl}?command=returnOrderBook&currencyPair=${quote}_${base}&depth=10`,
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
