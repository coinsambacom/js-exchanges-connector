import { IOrderbook, ITicker } from "../types/common";
import { Exchange, IExchangeBaseConstructorArgs } from "./exchange";

interface IBwsTickerRes {
  MarketAsset: string;
  BaseAsset: string;
  Last: string;
  Ask: string;
  Bid: string;
  Volume: string;
}

interface IBwsOrder {
  Quantity: string;
  Rate: string;
}

interface IBwsOrderbookRes {
  buy: IBwsOrder[];
  sell: IBwsOrder[];
}

export class bws<T> extends Exchange<T> {
  constructor(args: IExchangeBaseConstructorArgs<T>) {
    super({ ...args });
  }

  private parseTicker(t: IBwsTickerRes): ITicker {
    return {
      exchangeId: this.id,
      base: t.MarketAsset,
      quote: t.BaseAsset,
      last: Number(t.Last),
      ask: Number(t.Ask),
      bid: Number(t.Bid),
      vol: Number(t.Volume),
    };
  }

  async getAllTickers(): Promise<ITicker[]> {
    const res = await this.fetch<{ result: IBwsTickerRes[] }>(
      `${this.baseUrl}/getmarketsummaries`,
    );

    return res.result.map((t) => this.parseTicker(t));
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const res = await this.fetch<{ result: IBwsTickerRes[] }>(
      `${this.baseUrl}/getmarketsummaries?basemarket=${quote}`,
    );

    return res.result.map((t) => this.parseTicker(t));
  }

  async getTicker(base: any, quote: string): Promise<ITicker> {
    const res = await this.fetch<{ result: IBwsTickerRes }>(
      `${this.baseUrl}/getmarketsummary?market=${base}_${quote}`,
    );

    return {
      exchangeId: this.id,
      base: res.result.MarketAsset,
      quote: res.result.BaseAsset,
      last: Number(res.result.Last),
      ask: Number(res.result.Ask),
      bid: Number(res.result.Bid),
      vol: Number(res.result.Volume),
    };
  }

  private parseOrder({ Quantity, Rate }: IBwsOrder) {
    return {
      price: Number(Rate),
      amount: Number(Quantity),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<{ result: IBwsOrderbookRes }>(
      `${this.baseUrl}/getorderbook?market=${base}_${quote}&type=ALL&depth=60`,
    );

    return {
      asks: (res.result.sell || []).map(this.parseOrder),
      bids: (res.result.buy || []).map(this.parseOrder),
    };
  }
}
