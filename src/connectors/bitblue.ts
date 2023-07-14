import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

interface IBitblueTickerRes {
  stats: {
    last_price: number;
    ask: number;
    bid: number;
    "24h_volume": number;
  };
}

interface IBitblueOrderbookOrder {
  price: number;
  order_amount: number;
}

interface IBitblueOrderbookRes {
  orderbook: {
    ask: IBitblueOrderbookOrder[];
    bid: IBitblueOrderbookOrder[];
  };
}

export class bitblue<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitblue",
      baseUrl: "https://bitblue.com/api",
      opts: args?.opts,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { stats: res } = await this.fetch<IBitblueTickerRes>(
      `${this.baseUrl}/stats?market=${base}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last_price,
      ask: res.ask,
      bid: res.bid,
      vol: res["24h_volume"] / res.last_price,
    };
  }

  async getBook(base: any, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<IBitblueOrderbookRes>(
      `${this.baseUrl}/order-book?market=${quote}&currency=${base}`,
    );

    return {
      asks: res["order-book"].ask.map(({ price, order_amount }) => ({
        price,
        amount: order_amount,
      })),
      bids: res["order-book"].bid.map(({ price, order_amount }) => ({
        price,
        amount: order_amount,
      })),
    };
  }
}
