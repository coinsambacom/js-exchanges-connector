import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker, IExchangeBase } from "../types/common";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";

interface IAlterbankTickerRes {
  last: string;
  sell: string;
  buy: string;
  volume: string;
}

export class alterbank<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "alterbank",
      baseUrl: "https://api.alterbank.com.br/public-api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<IAlterbankTickerRes>(`${this.baseUrl}/ticker`);

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last),
      ask: Number(res.sell),
      bid: Number(res.buy),
      vol: Number(res.volume),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    try {
      const ticker = await this.getTicker(base, quote);

      return {
        asks: [
          {
            price: ticker.ask,
            amount: 0.3,
          },
        ],
        bids: [
          {
            price: ticker.bid,
            amount: 0.3,
          },
        ],
      };
    } catch (error) {
      throw new ConnectorError(
        ERROR_TYPES.API_RESPONSE_ERROR,
        "this method relays to getTicker",
        error,
      );
    }
  }
}
