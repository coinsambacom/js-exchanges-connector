import Bottleneck from "bottleneck";
import { IExchangeBase } from "../types/common";
import { Fetcher, FetcherArgs, FetcherObjectArgs } from "../utils/Fetcher";

/**
 * Represents the constructor arguments for a public exchange.
 */
export interface PublicExchangeConstructorArgs<T> {
  /**
   * Custom options to inject in your Fetcher function.
   */
  opts?: T;

  key?: string;
  secret?: string;
}

/**
 * Represents the constructor arguments for an exchange implementation.
 */
export interface IExchangeImplementationConstructorArgs<T = any>
  extends PublicExchangeConstructorArgs<T> {
  limiter?: Bottleneck;
}

/**
 * Represents the constructor arguments for the base exchange.
 */
export interface IExchangeBaseConstructorArgs<T>
  extends PublicExchangeConstructorArgs<T> {
  [x: string]: any; // hack to support any parameters
  /**
   * The exchange ID.
   */
  id: string;
  /**
   * The exchange base URL.
   */
  baseUrl: string;

  /**
   * The rate limiter for the exchange.
   */
  limiter?: Bottleneck;
}

/**
 * Represents the arguments for signing requests.
 */
export type SignerArguments = Omit<FetcherObjectArgs, "headers">;

/**
 * Represents the return value of the signer function.
 */
export type SignerReturn = FetcherObjectArgs;

/**
 * Abstract base class for exchanges.
 */
export abstract class Exchange<T> implements IExchangeBase<T> {
  /**
   * The exchange ID.
   */
  public id!: string;
  /**
   * The exchange base URL.
   */
  public baseUrl!: string;
  /**
   * The rate limiter for the exchange.
   */
  public limiter!: Bottleneck;
  /**
   * Custom options to inject in the Fetcher function.
   */
  public opts?: T;
  /**
   * The API key for the exchange.
   */
  public apiKey?: string;
  /**
   * The API secret for the exchange.
   */
  public apiSecret?: string;

  /**
   * Constructs a new instance of the Exchange class.
   * @param args The constructor arguments.
   */
  constructor(args: IExchangeBaseConstructorArgs<T>) {
    Object.assign(this, {
      ...args,
      limiter:
        args.limiter ??
        new Bottleneck({
          maxConcurrent: 2,
          reservoir: 60,
          reservoirRefreshAmount: 10,
          reservoirRefreshInterval: 60 * 1000,
        }),
    });
  }

  /**
   * Performs an HTTP request using the Fetcher class.
   * @param args The arguments for the HTTP request.
   * @returns A promise that resolves to the response data.
   */
  public fetch<T = any>(args: FetcherArgs) {
    return this.limiter.schedule<T>(() => Fetcher.fetch<T>(args));
  }

  /**
   * Checks if the exchange implementation has the `getAllTickers` method.
   */
  public get hasAllTickers(): boolean {
    return typeof this["getAllTickers"] === "function";
  }

  /**
   * Checks if the exchange implementation has the `getAllTickersByQuote` method.
   */
  public get hasAllTickersByQuote(): boolean {
    return typeof this["getAllTickersByQuote"] === "function";
  }
}
