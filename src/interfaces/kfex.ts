import { IOrderbook, ITicker } from "../types/common";
import { Exchange, IExchangeBaseConstructorArgs } from "./exchange";

interface IKfexTicker {
  parName: string;
  last: string;
  quoteVolume: string;
  ask: string;
  bid: string;
}

interface IKfexOrder {
  Quantity: string;
  Rate: string;
}

interface IKfexOrderbook {
  Ask: IKfexOrder[];
  Bid: IKfexOrder[];
}

export class kfex<T> extends Exchange<T> {
  constructor(args: IExchangeBaseConstructorArgs<T>) {
    super({ ...args, ...{ allTickersAllQuotes: true } });
  }

  async getAllTickers(): Promise<ITicker[]> {
    const res = await this.fetch<IKfexTicker[]>(`${this.baseUrl}/volume`);

    return res.map(({ parName, last, quoteVolume, ask, bid }) => ({
      exchangeId: this.id,
      base: parName.split("_")[0],
      quote: parName.split("_")[1],
      last: Number(last),
      ask: Number(ask),
      bid: Number(bid),
      vol: Number(quoteVolume),
    }));
  }

  private parseOrder({ Quantity, Rate }: IKfexOrder) {
    return {
      price: Number(Rate),
      amount: Number(Quantity),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const { result: res } = await this.fetch<{
      result: IKfexOrderbook;
    }>(`${this.baseUrl}/orderBook/${base}_${quote}`);

    return {
      asks: res.Ask.map(this.parseOrder),
      bids: res.Bid.map(this.parseOrder),
    };
  }
}
