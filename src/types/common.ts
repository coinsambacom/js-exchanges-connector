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
