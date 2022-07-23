import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbookOrder, ITicker } from "../types/common";

export class walltime<T> extends Exchange<T> {
  public id: any;
  public baseUrl: any;
  public tickerUrl: any;

  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "walltime",
      baseUrl:
        "https://s3.amazonaws.com/data-production-walltime-info/production/dynamic",
      opts: args?.opts,
      limiter: args?.limiter,
    });

    this.tickerUrl =
      "https://s3.amazonaws.com/data-production-walltime-info/production/dynamic/walltime-info.json";
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(this.tickerUrl);

    res = res.BRL_XBT;
    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last_inexact,
      ask: res.lowest_ask_inexact,
      bid: res.highest_bid_inexact,
      vol: res.quote_volume24h_inexact,
    };
  }

  private parseOrder(o: [string, string]): IOrderbookOrder {
    return {
      price: eval(o[1]) / eval(o[0]),
      amount: eval(o[0]),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string) {
    const currentRound = (await this.fetch(this.baseUrl + "/meta.json"))[
      "current-round"
    ];
    if (!currentRound) return false;
    const res = await this.fetch(
      this.baseUrl + "/order-book/v8878cb_r" + currentRound + "_p0.json",
    );
    if (!res) return false;

    return {
      asks: res["xbt-brl"].map(this.parseOrder),
      bids: res["xbt-brl"].map(this.parseOrder),
    };
  }
}
