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
  allTickersAllQuotes?: boolean;
  opts?: T;

  getAllTickers?: (quote: string) => Promise<ITicker[]>;
  getTicker?: (base: string, quote: string) => Promise<ITicker>;
  getBook?: (base: string, quote: string) => Promise<IOrderbook>;
}
