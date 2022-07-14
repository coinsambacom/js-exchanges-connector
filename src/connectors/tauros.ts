import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";

export class tauros<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "tauros",
      baseUrl: "https://api.tauros.io/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getAllTickers(): Promise<ITicker[]> {
    let res = await this.fetch(this.baseUrl + "/v2/trading/tickers/");
    if (!res || !res.success) return res;
    res = res.payload;
    return res.map(
      (t: {
        market: { split: (arg0: string) => [any, any] };
        last: any;
        volume: any;
      }) => {
        const [base, quote] = t.market.split("-");
        return {
          exchangeId: this.id,
          base,
          quote,
          last: t.last,
          ask: t.last,
          bid: t.last,
          vol: t.volume,
        };
      },
    );
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    let res = await this.fetch(
      `${this.baseUrl}/v1/trading/orders/?market=${base}-${quote}`,
    );
    if (!res || !res.data)
      throw new ConnectorError(ERROR_TYPES.API_RESPONSE_ERROR);
    res = res.data;

    return {
      asks: res.asks.map(({ price, amount }) => ({
        price: price,
        amount: amount,
      })),
      bids: res.bids.map(({ price, amount }) => ({
        price: price,
        amount: amount,
      })),
    };
  }
}
