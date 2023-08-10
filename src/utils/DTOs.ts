export interface IBalance {
  [symbol: string]: number;
}

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

export enum OrderSide {
  BUY = "buy",
  SELL = "sell",
}

export interface PlaceOrderArguments {
  price: number;
  amount: number;
  side: OrderSide;
  base: string;
  quote: string;
}

export interface CancelOrderArguments {
  id: string;
  base: string;
  quote: string;
}

export type GetOrderArguments = CancelOrderArguments;

export interface GetHistoryArguments {
  page: number;
  base: string;
  quote: string;
}

export enum OrderStatus {
  EMPTY = "empty",
  PARTIAL = "partial",
  FILLED = "filled",
  CANCELED = "canceled",
}

export interface IOrder {
  status: OrderStatus;
  side: OrderSide;
  price: number;
  amount: number;
  executed: number;
}

export interface HistoryItem {
  base: string;
  quote: string;
  status: OrderStatus | null;
  side: OrderSide;
  price: number;
  amount: number;
  executed: number | null;
  date: Date | null;
}

export interface History {
  page: number;
  pages: number;
  perPage: number;
  items: HistoryItem[];
}
