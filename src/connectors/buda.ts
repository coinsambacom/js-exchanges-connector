import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../types/common";

type IBudaTickerEntry = [string, string];

interface IBudaTickerRes {
  ticker: {
    last_price: IBudaTickerEntry;
    min_ask: IBudaTickerEntry;
    max_bid: IBudaTickerEntry;
    volume: IBudaTickerEntry;
  };
}

type IBudaOrderbookOrder = [string, string];

interface IBudaOrderbookRes {
  order_book: {
    asks: IBudaOrderbookOrder[];
    bids: IBudaOrderbookOrder[];
  };
}

export class buda<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "buda",
      baseUrl: "https://www.buda.com/api/v2",
      opts: args?.opts,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { ticker } = await this.fetch<IBudaTickerRes>(
      `${
        this.baseUrl
      }/markets/${base.toLowerCase()}-${quote.toLowerCase()}/ticker`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(ticker.last_price[0]),
      ask: Number(ticker.min_ask[0]),
      bid: Number(ticker.max_bid[0]),
      vol: Number(ticker.volume[0]),
    };
  }

  private parseOrder([price, amount]: IBudaOrderbookOrder): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const { order_book } = await this.fetch<IBudaOrderbookRes>(
      `${
        this.baseUrl
      }/markets/${base.toLowerCase()}-${quote.toLowerCase()}/order_book`,
    );

    return {
      asks: order_book.asks.map(this.parseOrder),
      bids: order_book.bids.map(this.parseOrder),
    };
  }
}
