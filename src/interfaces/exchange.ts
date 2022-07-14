import Bottleneck from "bottleneck";
import { IExchangeBase } from "../types/common";
import { Fetcher } from "../utils/Fetcher";

export interface IExchangeImplementationConstructorArgs<T = any> {
  opts?: T;
  limiter?: Bottleneck;
}

export interface IExchangeBaseConstructorArgs<T> {
  /**
   * this exchange id
   */
  id: string;
  /**
   * this exchange base URL
   */
  baseUrl: string;
  opts?: T;
  /**
   * bottleneck rate limit
   */
  limiter?: Bottleneck;
}

export class Exchange<T> implements IExchangeBase<T> {
  [x: string]: any;
  public id!: string;
  public baseUrl!: string;
  public limiter!: Bottleneck;
  public opts?: any;

  constructor(args: IExchangeBaseConstructorArgs<T>) {
    Object.assign(this, args);
    if (!args.limiter) {
      this.limiter = new Bottleneck({
        maxConcurrent: 2,
        reservoir: 60,
        reservoirRefreshAmount: 10,
        reservoirRefreshInterval: 60 * 1000,
      });
    }
  }

  public fetch<T = any>(url: string) {
    return this.limiter.schedule<T>(() => Fetcher.get<T>(url, this.opts));
  }

  public get hasAllTickers(): boolean {
    return typeof this.getAllTickers === "function";
  }

  public get hasAllTickersByQuote(): boolean {
    return typeof this.getAllTickersByQuote === "function";
  }
}
