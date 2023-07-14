import { IExchangeBase } from "../types/common";
import { FetcherHandler, FetcherArgs } from "../utils/FetcherHandler";

export interface IExchangeImplementationConstructorArgs<T = any> {
  opts?: T;
}

export interface IExchangeBaseConstructorArgs<T> {
  [x: string]: any; // hack to suport any parameters
  /**
   * this exchange id
   */
  id: string;
  /**
   * this exchange base URL
   */
  baseUrl: string;
  /**
   * custom optiions to inject in your Fetcher function
   */
  opts?: T;
}

export class Exchange<T> implements IExchangeBase<T> {
  [x: string]: any;
  public id!: string;
  public baseUrl!: string;
  public opts?: T;

  constructor(args: IExchangeBaseConstructorArgs<T>) {
    Object.assign(this, args);
  }

  /**
   * Performs an HTTP request using the Fetcher class.
   * @param args The arguments for the HTTP request.
   * @returns A promise that resolves to the response data.
   */
  public fetch<T = any>(args: FetcherArgs) {
    return FetcherHandler.fetch<T>(args);
  }

  public get hasAllTickers(): boolean {
    return typeof this.getAllTickers === "function";
  }

  public get hasAllTickersByQuote(): boolean {
    return typeof this.getAllTickersByQuote === "function";
  }
}
