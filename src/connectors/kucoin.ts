import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../types/common";

interface KucoinBaseRes {
  code: string;
}

interface IKucoinTicker {
  symbol: string;
  symbolName: string;
  buy: string;
  sell: string;
  changeRate: string;
  changePrice: string;
  high: string;
  low: string;
  vol: string;
  volValue: string;
  last: string;
  averagePrice: string;
  takerFeeRate: string;
  makerFeeRate: string;
  takerCoefficient: string;
  makerCoefficient: string;
}

interface IKucoinTickerRes extends KucoinBaseRes {
  data: IKucoinTicker;
}

interface IKucoinTickersRes extends KucoinBaseRes {
  data: { time: number; ticker: IKucoinTicker[] };
}

type IKucoinOrderbookOrder = [string, string];

interface IKucoinOrderbookRes extends KucoinBaseRes {
  data: {
    bids: IKucoinOrderbookOrder[];
    asks: IKucoinOrderbookOrder[];
  };
}

export class kucoin<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "kucoin",
      baseUrl: "https://api.kucoin.com/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getAllTickers(): Promise<ITicker[]> {
    const { data: res } = await this.fetch<IKucoinTickersRes>(
      `${this.baseUrl}/v1/market/allTickers`,
    );

    return res.ticker.map((t) => ({
      exchangeId: this.id,
      base: t.symbol.split("-")[0] as string,
      quote: t.symbol.split("-")[1] as string,
      last: Number(t.last),
      ask: Number(t.sell),
      bid: Number(t.buy),
      vol: Number(t.vol),
    }));
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { data: res } = await this.fetch<IKucoinTickerRes>(
      `${this.baseUrl}/v1/market/stats?symbol=${base}-${quote}`,
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

  private parseOrder([price, amount]: IKucoinOrderbookOrder): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const { data: res } = await this.fetch<IKucoinOrderbookRes>(
      `${this.baseUrl}/v1/market/orderbook/level2_20?symbol=${base}-${quote}`,
    );

    return {
      asks: (res.asks || []).map(this.parseOrder),
      bids: (res.bids || []).map(this.parseOrder),
    };
  }
}
