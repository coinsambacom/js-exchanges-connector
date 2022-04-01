import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

export class gateio<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "gateio",
      baseUrl: "https://data.gateio.la/api2/1",
      opts: args?.opts,
      limiter: args?.limiter,
      allTickersAllQuotes: true,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAllTickers(quote: string): Promise<ITicker[]> {
    const res = await this.fetch(`${this.baseUrl}/tickers`);

    const tickers: ITicker[] = [];
    for (const pair in res) {
      const ticker = res[pair];
      tickers.push({
        exchangeId: this.id,
        base: (pair.split("_")[0] as string).toUpperCase(),
        quote: (pair.split("_")[1] as string).toUpperCase(),
        last: ticker.last,
        ask: ticker.lowestAsk,
        bid: ticker.quoteVolume,
        vol: ticker.vol,
      });
    }
    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch(
      `${this.baseUrl}/ticker/${base.toLowerCase()}_${quote.toLowerCase()}`,
    );

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
      `${this.baseUrl}/orderBook/${base.toLowerCase()}_${quote.toLowerCase()}`,
    );

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
