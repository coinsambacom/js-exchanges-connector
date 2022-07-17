import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

interface IBRFinexTickerRes {
  data: {
    last: string;
    open: string;
    low: string;
    high: string;
    ask: string;
    bid: string;
    change: string;
    volume: string;
  };
}

type IBRFinexOrderbookOrder = [number, number];

interface IBRFinexOrderbookRes {
  data: {
    bids: IBRFinexOrderbookOrder[];
    asks: IBRFinexOrderbookOrder[];
  };
}

export class brfinex<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "brfinex",
      baseUrl: "https://api.brfinex.com/v1",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: any, quote: string): Promise<ITicker> {
    const { data: res } = await this.fetch<IBRFinexTickerRes>(
      `${this.baseUrl}/ticker/${base}-${quote}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last),
      ask: Number(res.ask),
      bid: Number(res.bid),
      vol: Number(res.volume),
    };
  }

  private parseOrder([price, amount]: IBRFinexOrderbookOrder) {
    return { price, amount };
  }

  async getBook(base: any, quote: string): Promise<IOrderbook> {
    const { data: res } = await this.fetch<IBRFinexOrderbookRes>(
      `${this.baseUrl}/book/${base}-${quote}`,
    );

    return {
      asks: res.asks.map(this.parseOrder),
      bids: res.bids.map(this.parseOrder),
    };
  }
}
