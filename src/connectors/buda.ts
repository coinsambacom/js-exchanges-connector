import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker, IExchangeBase } from "../types/common";

interface IBudaTickerRes {
  ticker: {
    last_price: [number];
    min_ask: [number];
    max_bid: [number];
    volume: [number];
  };
}

interface IBudaOrderbookRes {
  order_book: {
    asks: [number, number][];
    bids: [number, number][];
  };
}

export class buda<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "buda",
      baseUrl: "https://www.buda.com/api/v2",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { ticker } = await this.fetch<IBudaTickerRes>(
      `${this.baseUrl}/
      s/${base.toLowerCase()}-${quote.toLowerCase()}/ticker`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: ticker.last_price[0],
      ask: ticker.min_ask[0],
      bid: ticker.max_bid[0],
      vol: ticker.volume[0],
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const { order_book } = await this.fetch<IBudaOrderbookRes>(
      `${
        this.baseUrl
      }/markets/${base.toLowerCase()}-${quote.toLowerCase()}/order_book`,
    );

    return {
      asks: order_book.asks.map(([price, amount]) => ({
        price,
        amount,
      })),
      bids: order_book.bids.map(([price, amount]) => ({
        price,
        amount,
      })),
    };
  }
}
