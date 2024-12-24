import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";

type BaseRes<T> = {
  result: T;
};

type BookOrder = {
  price: string;
  size: string;
};

type BookRes = BaseRes<{
  asks: BookOrder[];
  bids: BookOrder[];
}>;

type TickerRes = BaseRes<{
  price: string;
  bid: string;
  ask: string;
  base_volume_24h: string;
  quote_volume_24h: string;
  high_24h: string;
  low_24h: string;
  price_change_percent_24h: string;
}>;

export class digitra<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "digitra",
      baseUrl: "https://api.digitra.com",
      opts: args?.opts,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<TickerRes>(
      `${this.baseUrl}/v1/markets/${base}-${quote}/prices`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.result.price),
      ask: Number(res.result.ask),
      bid: Number(res.result.bid),
      vol: Number(res.result.base_volume_24h),
    };
  }

  private parseOrder(order: BookOrder): { price: number; amount: number } {
    return {
      price: parseFloat(order.price),
      amount: parseFloat(order.size),
    };
  }

  public async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<BookRes>(
      `${this.baseUrl}/v1/markets/${base}-${quote}/orderbook`,
    );

    return {
      asks: res.result.asks.map(this.parseOrder),
      bids: res.result.bids.map(this.parseOrder),
    };
  }
}
