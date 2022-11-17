import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

interface IBisqTickerRes {
  last: string;
  high: string;
  low: string;
  volume_left: string;
  volume_right: string;
  buy: string;
  sell: string;
}

interface IBisqOrderbookOrder {
  offer_id: string;
  offer_date: any;
  direction: "BUY" | "SELL";
  min_amount: string;
  amount: string;
  price: string;
  volume: string;
  payment_method: string;
  offer_fee_txid?: any;
}

interface IBisqBookRes {
  [pair: string]: {
    buys: IBisqOrderbookOrder[];
    sells: IBisqOrderbookOrder[];
  };
}

export class bisq<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bisq",
      baseUrl: "https://bisq.markets/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<IBisqTickerRes>(
      `${this.baseUrl}/ticker?market=${base}_${quote}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last),
      ask: Number(res.sell),
      bid: Number(res.buy),
      vol: Number(res.volume_left),
    };
  }

  private parseOrder({ price, amount }: IBisqOrderbookOrder) {
    return { price: Number(price), amount: Number(amount) };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<IBisqBookRes>(
      `${this.baseUrl}/offers?market=${base}_${quote}`,
    );

    const orders = Object.values(res)[0]!;

    return {
      asks: orders.sells.map(this.parseOrder),
      bids: orders.buys.map(this.parseOrder),
    };
  }
}
