import { IExchangeBase } from "../types/common";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";
import {
  FetcherHandler,
  FetcherArgs,
  FetcherObjectArgs,
} from "../utils/FetcherHandler";

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
  extends PublicExchangeConstructorArgs<T> {}

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
   * custom optiions to inject in your Fetcher function
   */
  opts?: T;
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
  protected baseUrl!: string;
  /**
   * Custom options to inject in the Fetcher function.
   */
  protected opts?: T;
  /**
   * The API key for the exchange.
   */
  protected key?: string;
  /**
   * The API secret for the exchange.
   */
  protected secret?: string;

  /**
   * Constructs a new instance of the Exchange class.
   * @param args The constructor arguments.
   */
  constructor(args: IExchangeBaseConstructorArgs<T>) {
    Object.assign(this, args);
  }

  /**
   * Performs an HTTP request using the Fetcher class.
   * @param args The arguments for the HTTP request.
   * @returns A promise that resolves to the response data.
   */
  protected fetch<T = any>(args: FetcherArgs) {
    return FetcherHandler.fetch<T>(args);
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

  protected ensureApiCredentials(onlyKey = false): void {
    if (!this.key && (onlyKey ? false : !this.secret)) {
      throw new ConnectorError(ERROR_TYPES.MISSING_API_KEYS);
    }
  }
}
