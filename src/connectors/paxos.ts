import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";

interface PaxosTickerRes {
  market: string;
  best_bid: Bestbid;
  best_ask: Bestbid;
  last_execution: Bestbid;
  last_day: Lastday;
  today: Lastday;
  snapshot_at: string;
}

interface Lastday {
  high: string;
  low: string;
  open: string;
  volume: string;
  volume_weighted_average_price: string;
  range: Range;
}

interface Range {
  begin: string;
  end: string;
}

interface Bestbid {
  price: string;
  amount: string;
}

interface PaxosOrderbookRes {
  market: string;
  asks: IPaxosOrderbookOrder[];
  bids: IPaxosOrderbookOrder[];
}

interface IPaxosOrderbookOrder {
  price: string;
  amount: string;
}

export class paxos<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "paxos",
      baseUrl: "https://api.paxos.com",
      opts: args?.opts,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<PaxosTickerRes>(
      `${this.baseUrl}/v2/markets/${base}${quote}/ticker`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last_execution.price),
      ask: Number(res.best_ask.price),
      bid: Number(res.best_bid.price),
      vol: Number(res.today.volume),
    };
  }

  private parseOrder({ price, amount }: IPaxosOrderbookOrder) {
    return { price: Number(price), amount: Number(amount) };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<PaxosOrderbookRes>(
      `${this.baseUrl}/v2/markets/${base}${quote}/order-book`,
    );

    return {
      asks: res.asks.map(this.parseOrder),
      bids: res.bids.map(this.parseOrder),
    };
  }
}
