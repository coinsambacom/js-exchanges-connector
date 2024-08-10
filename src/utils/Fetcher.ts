import { ICustomFetcher, FetcherArgs, FetcherRequisitionMethods } from "./DTOs";

class DefaultFetcher implements ICustomFetcher {
  private async parseFetchError(response: Response): Promise<Error> {
    const text = await response.text();
    return new Error(`E - ${response.status} - ${response.url} - ${text}`);
  }

  async fetch<ResponseType>(args: FetcherArgs): Promise<ResponseType> {
    let url: string;
    const options: RequestInit = {};
    options.headers = new Headers();

    if (typeof args === "string") {
      url = args;
      options.method = FetcherRequisitionMethods.GET;
    } else {
      url = args.url;
      options.method = args.method || FetcherRequisitionMethods.GET;

      if (args.headers) {
        for (const [key, value] of Object.entries(args.headers)) {
          options.headers.append(key, String(value));
        }
      }

      if (options.method === FetcherRequisitionMethods.POST && args.data) {
        options.body = JSON.stringify(args.data);
      }

      options.headers.append("Content-Type", "application/json");
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw await this.parseFetchError(response);
      }

      if (response.status === 204) {
        // No content response
        return {} as ResponseType;
      }

      const data: ResponseType = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Unknown error occurred");
      }
    }
  }
}

/**
 * Class responsible for handling HTTP requests using Axios.
 * It provides the ability to set a custom fetcher and performs requests based on the provided arguments.
 */
class FetcherHandler {
  private fetcher: ICustomFetcher;

  constructor() {
    this.fetcher = new DefaultFetcher();
  }

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
