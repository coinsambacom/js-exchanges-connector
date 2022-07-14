import Bottleneck from "bottleneck";

export interface ITicker {
  exchangeId: string;
  base: string;
  quote: string;
  last: number;
  bid: number;
  ask: number;
  vol: number;
}

export interface IOrderbookOrder {
  price: number;
  amount: number;
}

export interface IOrderbook {
  asks: IOrderbookOrder[];
  bids: IOrderbookOrder[];
}

export interface IExchangeBase<T> {
  id: string;
  baseUrl: string;
  limiter: Bottleneck;
  opts?: T;

  /**
   * true if this exchange implements all tickers by specified quote
   */
  hasAllTickersByQuote: boolean;
  /**
   * true if this exchange implements all tickers with all available quotes
   */
  hasAllTickers: boolean;

  getAllTickers?: () => Promise<ITicker[]>;
  getAllTickersByQuote?: (quote: string) => Promise<ITicker[]>;
  getTicker?: (base: string, quote: string) => Promise<ITicker>;
  getBook?: (base: string, quote: string) => Promise<IOrderbook>;
}
