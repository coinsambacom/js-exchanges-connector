import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { ITicker } from "../types/common";

interface IWalltimeTicker {
  version: string;
  last_update: Date;
  last_update_timestamp: string;
  BRL_XBT: {
    last_inexact: string;
    last: string;
    highest_bid_inexact: string;
    highest_bid: string;
    n_trades_24h: string;
    lowest_ask_inexact: string;
    lowest_ask: string;
    base_volume24h_inexact: string;
    base_volume24h: string;
    quote_volume24h_inexact: string;
    quote_volume24h: string;
    base_volume_today_inexact: string;
    base_volume_today: string;
    quote_volume_today_inexact: string;
    quote_volume_today: string;
    base_volume_yesterday_inexact: string;
    base_volume_yesterday: string;
    quote_volume_yesterday_inexact: string;
    quote_volume_yesterday: string;
  };
}

interface IWalltimeCurrentRound {
  current_round: number;
  code_version: string;
  order_book_pages: number;
  suspended_actions: any[];
  order_book_prefix: string;
  last_trades_prefix: string;
  best_offer: {
    "brl-xbt": string;
    "xbt-brl": string;
  };
}

export class walltime<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "walltime",
      baseUrl:
        "https://s3.amazonaws.com/data-production-walltime-info/production/dynamic",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { BRL_XBT: res } = await this.fetch<IWalltimeTicker>(
      `${this.baseUrl}/walltime-info.json`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last_inexact),
      ask: Number(res.lowest_ask_inexact),
      bid: Number(res.highest_bid_inexact),
      vol: Number(res.quote_volume24h_inexact),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string) {
    const currentRound = await this.fetch<IWalltimeCurrentRound>(
      this.baseUrl + "/meta.json",
    );

    if (!currentRound) return false;
    const res = await this.fetch(
      this.baseUrl + "/order-book/v8878cb_r" + currentRound + "_p0.json",
    );
    if (!res) return false;

    return {
      asks: res["xbt-brl"].map((o: [string, string]) => ({
        price: eval(o[1]) / eval(o[0]),
        amount: eval(o[0]),
      })),
      bids: res["xbt-brl"].map((o: [string, string]) => ({
        price: eval(o[0]) / eval(o[1]),
        amount: eval(o[1]),
      })),
    };
  }
}
