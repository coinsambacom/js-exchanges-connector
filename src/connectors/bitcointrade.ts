import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

interface IBitcoinTradeTickerRes {
  data: {
    last: number;
    sell: number;
    buy: number;
    volume: number;
  };
}

interface IBitcoinTradeOrderBookOrder {
  unit_price: number;
  amount: number;
}

interface IBitcoinTradeOrderBookRes {
  data: {
    asks: IBitcoinTradeOrderBookOrder[];
    bids: IBitcoinTradeOrderBookOrder[];
  };
}

export class bitcointrade<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitcointrade",
      baseUrl: "https://api.bitcointrade.com.br/v3/public",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: any, quote: string): Promise<ITicker> {
    const { data: res } = await this.fetch<IBitcoinTradeTickerRes>(
      `${this.baseUrl}/${quote}${base}/ticker`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.sell,
      bid: res.buy,
      vol: res.volume,
    };
  }

  private parseOrder({ amount, unit_price }: IBitcoinTradeOrderBookOrder) {
    return { price: unit_price, amount: amount };
  }

  async getBook(base: any, quote: string): Promise<IOrderbook> {
    const { data: res } = await this.fetch<IBitcoinTradeOrderBookRes>(
      `${this.baseUrl}/${quote}${base}/orders`,
    );

    return {
      asks: res.asks.map(this.parseOrder),
      bids: res.bids.map(this.parseOrder),
    };
  }
}
