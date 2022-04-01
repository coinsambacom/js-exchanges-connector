import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

interface IIBitnuvemOrderbookRes {
  asks: [number, number][];
  bids: [number, number][];
}

interface IBitnuvemTickerRes {
  ticker: {
    last: number;
    sell: number;
    buy: number;
    vol: number;
  };
}

export class bitnuvem<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitnuvem",
      baseUrl: "https://bitnuvem.com/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { ticker: res } = await this.fetch<IBitnuvemTickerRes>(
      `${this.baseUrl}/${base}/ticker`,
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<IIBitnuvemOrderbookRes>(
      this.baseUrl + "/" + base + "/orderbook",
    );

    return {
      asks: res.asks.map((order) => ({
        price: order[0],
        amount: order[1],
      })),
      bids: res.bids.map((order) => ({
        price: order[0],
        amount: order[1],
      })),
    };
  }
}
