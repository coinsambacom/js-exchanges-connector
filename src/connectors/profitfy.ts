import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import {
  IExchangeBase,
  IOrderbook,
  IOrderbookOrder,
  ITicker,
} from "../types/common";

export class profitfy<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "profitfy",
      baseUrl: "https://profitfy.trade/api/v1/public",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }
  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(this.baseUrl + "/ticker/" + quote + "/" + base);

    res = res[0];

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.sell,
      bid: res.buy,
      vol: res.volume,
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    let res = await this.fetch(
      this.baseUrl + "/orderbook/" + quote + "/" + base,
    );

    res = res[0];

    return {
      asks: res.sell.map((o: IOrderbookOrder) => ({
        price: o.price,
        amount: o.amount,
      })),
      bids: res.buy.map((o: IOrderbookOrder) => ({
        price: o.price,
        amount: o.amount,
      })),
    };
  }
}
