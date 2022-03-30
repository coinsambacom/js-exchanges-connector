import Axios, { AxiosError } from "axios";
import { ConnectorError, ERROR_TYPES } from "./ConnectorError";

export interface ICustomFetcher {
  fetch: <T>(url: string, opts?: any) => Promise<T>;
}

class Fetcher {
  private fetcher?: ICustomFetcher;

  setCustomFetcher(fetcher: ICustomFetcher): void {
    this.fetcher = fetcher;
  }

  public async get<T>(url: string, opts?: any) {
    if (this.fetcher) {
      return this.fetcher.fetch<T>(url, opts);
    } else {
      try {
        const { data } = await Axios.get<T>(url);
        return data;
      } catch (error: any) {
        const e: AxiosError = error;
        let message = `E - ${e.code}`;
        if (e.response) {
          message += ` - ${e.response.status} - ${url} ${
            typeof e.response.data === "object"
              ? `- ${JSON.stringify(e.response.data)}`
              : ""
          }`;
        } else {
          message += ` - ${url}`;
        }
        throw new ConnectorError(ERROR_TYPES.API_NETWORK_ERROR, message, error);
      }
    }
  }
}

const instance = new Fetcher();
export { instance as Fetcher };
