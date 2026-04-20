import {
  ICustomFetcher,
  FetcherArgs,
  FetcherRequisitionMethods,
} from "./DTOs.js";

class DefaultFetcher implements ICustomFetcher {
  /**
   * Creates a new DefaultFetcher instance
   * @param requestTimeout Timeout for requests in milliseconds (default: 10000ms)
   */
  constructor(private requestTimeout: number = 10000) {}

  private async parseFetchError(response: Response): Promise<Error> {
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        return new Error(
          `HTTP ${response.status}: ${response.url} - ${JSON.stringify(errorData)}`,
        );
      }
      const text = await response.text();
      return new Error(`HTTP ${response.status}: ${response.url} - ${text}`);
    } catch {
      return new Error(
        `HTTP ${response.status}: ${response.url} - ${response.statusText}`,
      );
    }
  }

  async fetch<ResponseType>(args: FetcherArgs): Promise<ResponseType> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      let url: string;
      const options: RequestInit = {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      };

      if (typeof args === "string") {
        url = args;
        options.method = FetcherRequisitionMethods.GET;
      } else {
        url = args.url;
        options.method = args.method || FetcherRequisitionMethods.GET;

        if (args.headers) {
          options.headers = {
            ...options.headers,
            ...Object.fromEntries(
              Object.entries(args.headers).map(([k, v]) => [k, String(v)]),
            ),
          };
        }

        if (args.data) {
          const isBodyMethod = [
            FetcherRequisitionMethods.POST,
            FetcherRequisitionMethods.PUT,
            FetcherRequisitionMethods.PATCH,
          ].includes(options.method as FetcherRequisitionMethods);

          if (isBodyMethod) {
            if (
              !(options.headers as Record<string, string>)?.["Content-Type"]
            ) {
              options.headers = {
                ...options.headers,
                "Content-Type": "application/json",
              } as Record<string, string>;
            }
            options.body = JSON.stringify(args.data);
          } else {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(args.data)) {
              params.append(key, String(value));
            }
            url += (url.includes("?") ? "&" : "?") + params.toString();
          }
        }
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.parseFetchError(response);
      }

      if (response.status === 204) {
        return {} as ResponseType;
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return (await response.json()) as ResponseType;
      }

      const text = await response.text();
      try {
        return JSON.parse(text) as ResponseType;
      } catch {
        return text as unknown as ResponseType;
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          const targetUrl = typeof args === "string" ? args : args.url;
          throw new Error(
            `Request timeout after ${this.requestTimeout / 1000}s: ${targetUrl}`,
          );
        }
        throw error;
      }
      throw new Error(`Unknown error: ${String(error)}`);
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
    return this.fetcher.fetch<ResponseType>(args);
  }
}

// Singleton instance of the Fetcher class
const instance = new FetcherHandler();
export { instance as FetcherHandler };
