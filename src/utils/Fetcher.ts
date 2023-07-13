import Axios, { AxiosError } from "axios";
import { ConnectorError, ERROR_TYPES } from "./ConnectorError";

/**
 * Enum representing different types of HTTP request methods.
 */
export enum FetcherRequisitionMethods {
  GET = "get",
  POST = "post",
}

export interface FetcherObjectArgs {
  url: string;
  method: FetcherRequisitionMethods;
  headers: Record<string, string | number | boolean>;
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

/**
 * Class responsible for handling HTTP requests using Axios.
 * It provides the ability to set a custom fetcher and performs requests based on the provided arguments.
 */
class Fetcher {
  private fetcher?: ICustomFetcher;

  /**
   * Sets a custom fetcher implementation.
   * @param fetcher The custom fetcher implementing the ICustomFetcher interface.
   */
  setCustomFetcher(fetcher: ICustomFetcher): void {
    this.fetcher = fetcher;
  }

  private parseAxiosError(e: AxiosError): ConnectorError {
    let message = `E - ${e.code}`;
    if (e.response) {
      message += ` - ${e.response.status} - ${e.config.url} ${
        typeof e.response.data === "object"
          ? `- ${JSON.stringify(e.response.data)}`
          : ""
      }`;
    } else {
      message += ` - ${e.config.url}`;
    }
    return new ConnectorError(ERROR_TYPES.API_NETWORK_ERROR, message, e);
  }

  /**
   * Performs an HTTP request using Axios.
   * If a custom fetcher is set, it delegates the request to the custom fetcher.
   * @param args The arguments for the HTTP request.
   * @returns A promise that resolves to the response data.
   * @throws ConnectorError if an AxiosError occurs during the request.
   */
  public async fetch<ResponseType>(args: FetcherArgs): Promise<ResponseType> {
    if (this.fetcher) {
      return this.fetcher.fetch<ResponseType>(args);
    } else {
      try {
        if (typeof args == "string") {
          const { data } = await Axios.get<ResponseType>(args);
          return data;
        } else {
          const { data } = await Axios.request<ResponseType>({
            headers: args.headers,
            url: args.url,
            method: args.method,
            data: args.data,
          });
          return data;
        }
      } catch (error: any) {
        throw this.parseAxiosError(error as unknown as AxiosError);
      }
    }
  }
}

// Singleton instance of the Fetcher class
const instance = new Fetcher();
export { instance as Fetcher };
