import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker, IExchangeBase } from "../types/common";

interface IMercadoBitcoinTickerRes {
  ticker: {
    high: string;
    low: string;
    vol: string;
    last: string;
    buy: string;
    sell: string;
    open: string;
    date: 1648515330;
  };
}

type IMercadoBitcoinOrderbookOrder = [number, number];

interface IMercadoBitcoinOrderbookRes {
  asks: IMercadoBitcoinOrderbookOrder[];
  bids: IMercadoBitcoinOrderbookOrder[];
}

export class mercadobitcoin<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "mercadobitcoin",
      baseUrl: "https://www.mercadobitcoin.net/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { ticker: res } = await this.fetch<IMercadoBitcoinTickerRes>(
      `${this.baseUrl}/${base}/ticker/`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last),
      ask: Number(res.sell),
      bid: Number(res.buy),
      vol: Number(res.vol),
    };
  }

  private parseOrder([price, amount]: IMercadoBitcoinOrderbookOrder) {
    return {
      price,
      amount,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<IMercadoBitcoinOrderbookRes>(
      `${this.baseUrl}/${base}/orderbook/`,
    );

    return {
      asks: res.asks.map(this.parseOrder),
      bids: res.bids.map(this.parseOrder),
    };
  }
}
