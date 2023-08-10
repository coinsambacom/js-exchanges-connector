import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";

import { IOrderbookOrder, ITicker, IOrderbook } from "../utils/DTOs";

interface IFTXTicker {
  name: string;
  enabled: boolean;
  postOnly: boolean;
  priceIncrement: number;
  sizeIncrement: number;
  minProvideSize: number;
  last: number;
  bid: number;
  ask: number;
  price: number;
  type: string;
  futureType: string;
  baseCurrency?: any;
  isEtfMarket: boolean;
  quoteCurrency?: any;
  underlying: string;
  restricted: boolean;
  highLeverageFeeExempt: boolean;
  largeOrderThreshold: number;
  change1h: number;
  change24h: number;
  changeBod: number;
  quoteVolume24h: number;
  volumeUsd24h: number;
  priceHigh24h: number;
  priceLow24h: number;
}

type FTXOrderbookOrder = [number, number];

interface IFTXOrderbookRes {
  result: {
    bids: FTXOrderbookOrder[];
    asks: FTXOrderbookOrder[];
  };
}

export class ftx<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "ftx",
      baseUrl: "https://ftx.com/api",
      opts: args?.opts,
    });
  }

  private parseTicker(res: IFTXTicker): ITicker {
    if (res.quoteCurrency === "BRZ") {
      res.quoteCurrency = "BRL";
    }

    return {
      exchangeId: this.id,
      base: res.baseCurrency,
      quote: res.quoteCurrency,
      last: res.last,
      ask: res.ask,
      bid: res.bid,
      vol: res.quoteVolume24h / res.last,
    };
  }

  async getAllTickers(): Promise<ITicker[]> {
    const { result: res } = await this.fetch<{ result: IFTXTicker[] }>(
      `${this.baseUrl}/markets`,
    );

    return res.map((t) => this.parseTicker(t)).filter((t) => t.base && t.quote);
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    if (quote === "BRL") {
      quote = "BRZ";
    }

    const { result: res } = await this.fetch<{ result: IFTXTicker }>(
      `${this.baseUrl}/markets/${base}_${quote}`,
    );

    return this.parseTicker(res);
  }

  private parseOrder([price, amount]: FTXOrderbookOrder): IOrderbookOrder {
    return { price, amount };
  }

  async getBook(base: any, quote: string): Promise<IOrderbook> {
    if (quote === "BRL") {
      quote = "BRZ";
    }

    const { result: res } = await this.fetch<IFTXOrderbookRes>(
      `${this.baseUrl}/markets/${base}_${quote}/orderbook?depth=50`,
    );

    return {
      asks: res.asks.map(this.parseOrder),
      bids: res.bids.map(this.parseOrder),
    };
  }
}
