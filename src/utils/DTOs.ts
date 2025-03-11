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

/**
 * Represents the base interface for an exchange.
 */
export interface IExchange {
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

/**
 * Enum representing different types of HTTP request methods.
 */
export enum FetcherRequisitionMethods {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
  PATCH = "patch",
}

export interface FetcherObjectArgs {
  url: string;
  method: FetcherRequisitionMethods;
  headers?: Record<string, string | number | boolean>;
  data?: Record<string, any>;
  opts?: any;
}

/**
 * Type representing the arguments for making an HTTP request.
 * It can be either a string representing the URL or an object with additional options.
 */
export type FetcherArgs = string | FetcherObjectArgs;

/**
 * Interface representing a custom fetcher with a fetch method.
 */
export interface ICustomFetcher {
  fetch: <T>(args: FetcherArgs) => Promise<T>;
}
