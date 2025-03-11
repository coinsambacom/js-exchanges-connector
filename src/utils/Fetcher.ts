import { ICustomFetcher, FetcherArgs, FetcherRequisitionMethods } from "./DTOs";

class DefaultFetcher implements ICustomFetcher {
  /**
   * Creates a new DefaultFetcher instance
   * @param requestTimeout Timeout for requests in milliseconds (default: 10000ms)
   */
  constructor(private requestTimeout: number = 10000) {}

  private async parseFetchError(response: Response): Promise<Error> {
    try {
      // Try to parse as JSON first to get more detailed error info
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        return new Error(
          `HTTP Error ${response.status} - ${response.url} - ${JSON.stringify(
            errorData,
          )}`,
        );
      } else {
        const text = await response.text();
        return new Error(
          `HTTP Error ${response.status} - ${response.url} - ${text}`,
        );
      }
    } catch (e) {
      // If JSON parsing fails, fall back to status text
      return new Error(
        `HTTP Error ${response.status} - ${response.url} - ${response.statusText}`,
      );
    }
  }

  async fetch<ResponseType>(args: FetcherArgs): Promise<ResponseType> {
    let url: string;
    const options: RequestInit = {};
    options.headers = new Headers();

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
    options.signal = controller.signal;
    options.headers.append("Accept", "application/json");

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

      if (args.data) {
        if (
          options.method === FetcherRequisitionMethods.POST ||
          options.method === FetcherRequisitionMethods.PUT ||
          options.method === FetcherRequisitionMethods.PATCH
        ) {
          // Only add content-type for requests with body
          if (!options.headers.has("Content-Type")) {
            options.headers.append("Content-Type", "application/json");
          }
          options.body = JSON.stringify(args.data);
        } else if (
          options.method === FetcherRequisitionMethods.GET ||
          options.method === FetcherRequisitionMethods.DELETE
        ) {
          // Add query parameters
          const params = new URLSearchParams();
          Object.entries(args.data).forEach(([key, value]) => {
            params.append(key, String(value));
          });
          url += (url.includes("?") ? "&" : "?") + params.toString();
        }
      }
    }

    try {
      const response = await fetch(url, options);

      // Clear timeout as request completed
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.parseFetchError(response);
      }

      if (response.status === 204) {
        // No content response
        return {} as ResponseType;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data: ResponseType = await response.json();
        return data;
      } else {
        // Handle non-JSON responses more gracefully
        const text = await response.text();
        try {
          // Try to parse as JSON anyway (some APIs don't set proper content type)
          return JSON.parse(text) as ResponseType;
        } catch {
          // If not JSON, return the text as is
          return text as unknown as ResponseType;
        }
      }
    } catch (error) {
      // Clear timeout in case of error
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(
            `Request timeout after ${this.requestTimeout / 1000} seconds: ${
              typeof args === "string" ? args : args.url
            }`,
          );
        } else {
          throw error;
        }
      } else {
        throw new Error(`Unknown error occurred: ${String(error)}`);
      }
    }
  }
}

/**
 * Class responsible for handling HTTP requests using the Fetch API.
 * It provides the ability to set a custom fetcher and performs requests based on the provided arguments.
 */
class FetcherHandler {
  private fetcher: ICustomFetcher;

  /**
   * Creates a new FetcherHandler instance
   * @param timeout Request timeout in milliseconds (default: 10000ms)
   */
  constructor(timeout?: number) {
    this.fetcher = new DefaultFetcher(timeout);
  }

  /**
   * Sets a custom fetcher implementation.
   * @param fetcher The custom fetcher implementing the ICustomFetcher interface.
   */
  setFetcher(fetcher: ICustomFetcher): void {
    this.fetcher = fetcher;
  }

  /**
   * Performs an HTTP request using the Fetch API.
   * If a custom fetcher is set, it delegates the request to the custom fetcher.
   * @param args The arguments for the HTTP request.
   * @returns A promise that resolves to the response data.
   * @throws Error if a fetcher is not attached or if the request fails.
   */
  async fetch<ResponseType>(args: FetcherArgs): Promise<ResponseType> {
    if (this.fetcher) {
      return this.fetcher.fetch<ResponseType>(args);
    } else {
      throw new Error(
        "No fetcher attached. Call setFetcher before making requests.",
      );
    }
  }
}

// Singleton instance of the Fetcher class
const instance = new FetcherHandler();
export { instance as FetcherHandler };
