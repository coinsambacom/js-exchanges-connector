import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../types/common";

interface IHuobiTicker {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  amount: number;
  vol: number;
  count: number;
  bid: number;
  bidSize: number;
  ask: number;
  askSize: number;
}

interface IHuobiTickerRes {
  tick: {
    id: number;
    low: number;
    high: number;
    open: number;
    close: number;
    vol: number;
    amount: number;
    version: number;
    count: number;
    bid: [number, number];
    ask: [number, number];
  };
}

interface IHuobiTickersRes {
  data: IHuobiTicker[];
}

type IHuobiOrderbookOrder = [number, number];

interface IHuobiOrderbookRes {
  tick: {
    bids: IHuobiOrderbookOrder[];
    asks: IHuobiOrderbookOrder[];
  };
}

export class huobi<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "huobi",
      baseUrl: "https://api.huobi.pro",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const { data: res } = await this.fetch<IHuobiTickersRes>(
      `${this.baseUrl}/market/tickers`,
    );

    const lowerCaseQuote = quote.toLowerCase();

    const tickers: ITicker[] = [];

    for (const t of res) {
      if (t.symbol.endsWith(lowerCaseQuote)) {
        tickers.push({
          exchangeId: this.id,
          base: t.symbol.replace(lowerCaseQuote, "").toUpperCase(),
          quote,
          last: t.close,
          ask: t.ask,
          bid: t.bid,
          vol: t.amount,
        });
      }
    }

    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { tick: res } = await this.fetch<IHuobiTickerRes>(
      `${
        this.baseUrl
      }/market/detail/merged?symbol=${base.toLowerCase()}${quote.toLowerCase()}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.close,
      ask: res.ask[0],
      bid: res.bid[0],
      vol: res.amount,
    };
  }

  private parseOrder([price, amount]: IHuobiOrderbookOrder): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const { tick: res } = await this.fetch<IHuobiOrderbookRes>(
      `${
        this.baseUrl
      }/market/depth?symbol=${base.toLowerCase()}${quote.toLowerCase()}&type=step0`,
    );

    return {
      asks: res.asks.map(this.parseOrder),
      bids: res.bids.map(this.parseOrder),
    };
  }
}
