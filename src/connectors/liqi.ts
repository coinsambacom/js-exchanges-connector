import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";

interface ILiqiTickerRes {
  symbol: string;
  timestamp: number;
  datetime: Date;
  high: number;
  low: number;
  bid: number;
  bidVolume: number;
  ask: number;
  askVolume: number;
  open: number;
  close: number;
  last: number;
  change: number;
  percentage: number;
  average: number;
  quoteVolume: number;
  baseVolume: number;
}

type ILiqiOrderbookOrder = [number, number];

interface ILiqiOrderbookRes {
  bids: ILiqiOrderbookOrder[];
  asks: ILiqiOrderbookOrder[];
}

export class liqi<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "liqi",
      baseUrl: "https://api.liqi.com.br/exchange/v1",
      opts: args?.opts,
    });
  }

  async getTicker(base: any, quote: string): Promise<ITicker> {
    const res = await this.fetch<ILiqiTickerRes>(
      `${this.baseUrl}/fetchTicker?symbol=${base}:${quote}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.ask,
      bid: res.bid,
      vol: res.baseVolume,
    };
  }

  async getAllTickers(): Promise<ITicker[]> {
    const res = await this.fetch<ILiqiTickerRes[]>(
      `${this.baseUrl}/fetchTickers`,
    );

    return res.map((t) => ({
      exchangeId: this.id,
      base: t.symbol.split("/")[0] as string,
      quote: t.symbol.split("/")[1] as string,
      last: t.last,
      ask: t.ask,
      bid: t.bid,
      vol: t.baseVolume,
    }));
  }

  private parseOrder([price, amount]: ILiqiOrderbookOrder) {
    return { price, amount };
  }

  async getBook(base: any, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<ILiqiOrderbookRes>(
      `${this.baseUrl}/fetchOrderBook?symbol=${base}:${quote}`,
    );

    return {
      asks: res.asks.map(this.parseOrder),
      bids: res.bids.map(this.parseOrder),
    };
  }
}
