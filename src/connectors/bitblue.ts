import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange.js";
import { IOrderbook, ITicker } from "../utils/DTOs.js";

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
      `${this.baseUrl}/stats?market=${base}&currency=${quote}`,
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
      `${this.baseUrl}/order-book?market=${base}&currency=${quote}`,
    );

    return {
      asks: res.orderbook.ask.map(({ price, order_amount }: any) => ({
        price,
        amount: order_amount,
      })),
      bids: res.orderbook.bid.map(({ price, order_amount }: any) => ({
        price,
        amount: order_amount,
      })),
    };
  }
}
