import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../utils/DTOs";

type Ticker = {
  time: number;
  symbol: string;
  volume: string;
  quoteVolume: string;
  base_currency: string;
  quote_currency: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  openPrice: string;
};

type OrderbookOrder = [string, string];

type Orderbook = {
  time: number;
  bids: OrderbookOrder[];
  asks: OrderbookOrder[];
};

export class trubit<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "trubit",
      baseUrl: "https://api-spot.trubit.com/openapi",
      opts: args?.opts,
    });
  }

  private parseTicker(ticker: Ticker): ITicker {
    return {
      exchangeId: this.id,
      base: ticker.base_currency,
      quote: ticker.quote_currency,
      last: Number(ticker.lastPrice),
      ask: Number(ticker.lowPrice),
      bid: Number(ticker.highPrice),
      vol: Number(ticker.volume),
    };
  }

  async getAllTickers(): Promise<ITicker[]> {
    const res = await this.fetch<Ticker[]>(
      `${this.baseUrl}/quote/v1/ticker/24hr`,
    );

    return res.map(this.parseTicker.bind(this));
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<Ticker>(
      `${this.baseUrl}/quote/v1/ticker/24hr?symbol=${base}${quote}`,
    );

    return { ...this.parseTicker(res), ...{ base, quote } };
  }

  private parseOrder(order: OrderbookOrder): IOrderbookOrder {
    return {
      price: Number(order[0]),
      amount: Number(order[1]),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<Orderbook>(
      `${this.baseUrl}/quote/v1/depth?symbol=${base}${quote}&limit=100`,
    );

    return {
      asks: (res.asks ?? []).map(this.parseOrder),
      bids: (res.bids ?? []).map(this.parseOrder),
    };
  }
}
