import { IOrderbook, ITicker } from "../utils/DTOs";
import { Exchange } from "./exchange";

export class peatio<T> extends Exchange<T> {
  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch(
      this.baseUrl + "/tickers/" + base.toLowerCase() + quote.toLowerCase(),
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

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch(
      this.baseUrl +
        "/order_book?market=" +
        base.toLowerCase() +
        quote.toLowerCase() +
        "&asks_limit=50&bids_limit=50",
    );

    return {
      asks: res.asks.map(({ price, volume }) => ({
        price,
        amount: volume,
      })),
      bids: res.bids.map(({ price, volume }) => ({
        price,
        amount: volume,
      })),
    };
  }
}
