import {
  FetcherArgs,
  FetcherRequisitionMethods,
  ICustomFetcher,
} from "../../src/utils/FetcherHandler";
import Axios, { AxiosError } from "axios";

export class MyFetcher implements ICustomFetcher {
  private parseAxiosError(e: AxiosError) {
    let message = `E - ${e.code}`;
    if (e.response) {
      message += ` - ${e.response.status} - ${e.config!.url} ${
        typeof e.response.data === "object"
          ? `- ${JSON.stringify(e.response.data)}`
          : ""
      }`;
    } else {
      message += ` - ${e.config!.url}`;
    }
    return new Error(message);
  }

  // fetch must handle with get and post methods
  // must be able to receive string paramter and handle as GET method
  async fetch<ResponseType>(args: FetcherArgs): Promise<ResponseType> {
    try {
      if (typeof args == "string") {
        const { data } = await Axios.get<ResponseType>(args);
        return data;
      } else {
        const { data } = await Axios.request<ResponseType>({
          headers: args.headers,
          url: args.url,
          method: args.method,
          [args.method === FetcherRequisitionMethods.GET ? "params" : "data"]:
            args.data,
        });
        return data;
      }
    } catch (error: any) {
      throw this.parseAxiosError(error as unknown as AxiosError);
    }
  }
}
