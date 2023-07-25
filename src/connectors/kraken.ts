import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../types/common";

interface IKrakenBaseRes {
  error: [];
}

interface IKrakenTicker {
  a: [string, string, string];
  b: [string, string, string];
  c: [string, string];
  v: [string, string];
  p: [string, string];
  t: [number, number];
  l: [string, string];
  h: [string, string];
  o: string;
}

interface IKrakenTickerRes extends IKrakenBaseRes {
  result: {
    [key: string]: IKrakenTicker;
  };
}

type IKrakenOrderbookOrder = [string, string, number];

interface IKrakenOrderbook {
  asks: IKrakenOrderbookOrder[];
  bids: IKrakenOrderbookOrder[];
}

interface IKrakenBookRes {
  result: { [key: string]: IKrakenOrderbook };
}

export class kraken<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "kraken",
      baseUrl: "https://api.kraken.com/0/public",
      opts: args?.opts,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    if (base == "BTC") base = "XBT";
    const { result: res } = await this.fetch<IKrakenTickerRes>(
      this.baseUrl + "/Ticker?pair=" + base + quote,
    );

    const ticker = res[Object.keys(res)[0] as string] as IKrakenTicker;

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(ticker.c[0]),
      ask: Number(ticker.a[0]),
      bid: Number(ticker.b[0]),
      vol: Number(ticker.v[1]),
    };
  }

  private parseOrder([price, amount]: IKrakenOrderbookOrder): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    if (base == "BTC") base = "XBT";
    const { result: res } = await this.fetch<IKrakenBookRes>(
      this.baseUrl + "/Depth?pair=" + base + quote,
    );

    const book = res[Object.keys(res)[0] as string] as IKrakenOrderbook;

    return {
      asks: book.asks.map(this.parseOrder),
      bids: book.bids.map(this.parseOrder),
    };
  }
}
