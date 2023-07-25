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
class FetcherHandler {
  private fetcher?: ICustomFetcher;

  /**
   * Sets a custom fetcher implementation.
   * @param fetcher The custom fetcher implementing the ICustomFetcher interface.
   */
  setFetcher(fetcher: ICustomFetcher): void {
    this.fetcher = fetcher;
  }

  /**
   * Performs an HTTP request using Axios.
   * If a custom fetcher is set, it delegates the request to the custom fetcher.
   * @param args The arguments for the HTTP request.
   * @returns A promise that resolves to the response data.
   * @throws ConnectorError if an AxiosError occurs during the request.
   */
  async fetch<ResponseType>(args: FetcherArgs): Promise<ResponseType> {
    if (this.fetcher) {
      return this.fetcher.fetch<ResponseType>(args);
    } else {
      throw Error("need to attach fetcher before this call");
    }
  }
}

// Singleton instance of the Fetcher class
const instance = new FetcherHandler();
export { instance as FetcherHandler };
