import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";

export interface CexioBaseRes {
  e: string;
  ok: string;
}

export interface CexioTickersRes extends CexioBaseRes {
  data: {
    timestamp: string;
    pair: string;
    low: string;
    high: string;
    last: string;
    volume: string;
    volume30d: string;
    priceChange: string;
    priceChangePercentage: string;
    bid?: number;
    ask?: number;
  }[];
}

export interface CexioTickerRes {
  timestamp: string;
  pair: string;
  low: string;
  high: string;
  last: string;
  volume: string;
  volume30d: string;
  priceChange: string;
  priceChangePercentage: string;
  bid?: number;
  ask?: number;
}

export class cexio<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "cexio",
      baseUrl: "https://cex.io/api",
      opts: args?.opts,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const { data: res } = await this.fetch<CexioTickersRes>(
      this.baseUrl + "/tickers/" + quote,
    );

    return res.map((t) => {
      const [base, quote] = t.pair.split(":") as [string, string];
      const last = Number(t.last);

      return {
        exchangeId: this.id,
        base,
        quote,
        last: last,
        ask: t.ask ?? last,
        bid: t.bid ?? last,
        vol: Number(t.volume),
      };
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<CexioTickerRes>(
      this.baseUrl + "/ticker/" + base + "/" + quote,
    );

    const last = Number(res.last);

    return {
      exchangeId: this.id,
      base,
      quote,
      last: last,
      ask: res.ask ?? last,
      bid: res.bid ?? last,
      vol: Number(res.volume),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch(
      this.baseUrl + "/order_book/" + base + "/" + quote,
    );

    return {
      asks: (res.asks || []).map((order: any[]) => ({
        price: order[0],
        amount: order[1],
      })),
      bids: (res.bids || []).map((order: any[]) => ({
        price: order[0],
        amount: order[1],
      })),
    };
  }
}
