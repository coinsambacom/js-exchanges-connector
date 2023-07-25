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

/**
 * Represents the base interface for an exchange.
 */
export interface IExchangeBase<T> {
  /**
   * The exchange ID.
   */
  id: string;

  /**
   * Indicates whether this exchange implements all tickers by specified quote.
   */
  hasAllTickersByQuote: boolean;
  /**
   * Indicates whether this exchange implements all tickers with all available quotes.
   */
  hasAllTickers: boolean;

  /**
   * Retrieves all tickers for this exchange.
   * @returns A promise that resolves to an array of ITicker objects.
   */
  getAllTickers?: () => Promise<ITicker[]>;

  /**
   * Retrieves all tickers for this exchange based on the specified quote.
   * @param quote The quote currency.
   * @returns A promise that resolves to an array of ITicker objects.
   */
  getAllTickersByQuote?: (quote: string) => Promise<ITicker[]>;

  /**
   * Retrieves the ticker for the specified base and quote currencies.
   * @param base The base currency.
   * @param quote The quote currency.
   * @returns A promise that resolves to an ITicker object.
   */
  getTicker?: (base: string, quote: string) => Promise<ITicker>;

  /**
   * Retrieves the order book for the specified base and quote currencies.
   * @param base The base currency.
   * @param quote The quote currency.
   * @returns A promise that resolves to an IOrderbook object.
   */
  getBook?: (base: string, quote: string) => Promise<IOrderbook>;
}
