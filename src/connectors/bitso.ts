import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../utils/DTOs";

interface IBitsoOrderbookOrder {
  price: string;
  amount: string;
}

export class bitso<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitso",
      baseUrl: "https://api.bitso.com/v3",
      opts: args?.opts,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(
      `${
        this.baseUrl
      }/ticker/?book=${base.toLowerCase()}_${quote.toLowerCase()}`,
    );
    if (!res || !res.success) return res;
    res = res.payload;

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

  private parseOrder({ price, amount }: IBitsoOrderbookOrder): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    let res = await this.fetch(
      `${
        this.baseUrl
      }/order_book/?book=${base.toLowerCase()}_${quote.toLowerCase()}`,
    );

    res = res.payload;

    return {
      asks: res.asks.map(this.parseOrder),
      bids: res.bids.map(this.parseOrder),
    };
  }
}
