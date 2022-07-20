import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbookOrder, ITicker } from "../types/common";

interface ICitcoinTickerRes {
  date: string;
  high: string;
  low: string;
  open: string;
  close: string;
  volume: number;
}

interface ICitcoinOrder {
  btc: string;
  btc_price: string;
}

interface ICitcoinOrderbookRes {
  ask: ICitcoinOrder[];
  bid: ICitcoinOrder[];
}
export class citcoin<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "citcoin",
      baseUrl: "https://api.citcoin.com.br/v1",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<ICitcoinTickerRes>(
      `${this.baseUrl}/${base.toLowerCase()}/ticker/`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.close),
      ask: Number(res.close),
      bid: Number(res.close),
      vol: res.volume,
    };
  }

  private parseOrder({ btc, btc_price }: ICitcoinOrder): IOrderbookOrder {
    return { price: Number(btc_price), amount: Number(btc) };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string) {
    const res = await this.fetch<ICitcoinOrderbookRes>(
      `${this.baseUrl}/${base.toLowerCase()}/orderbook/`,
    );

    return {
      asks: res.ask.map(this.parseOrder),
      bids: res.bid.map(this.parseOrder),
    };
  }
}
