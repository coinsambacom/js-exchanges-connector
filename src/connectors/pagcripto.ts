import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import {
  IExchangeBase,
  IOrderbook,
  IOrderbookOrder,
  ITicker,
} from "../types/common";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";

export class pagcripto<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "pagcripto",
      baseUrl: "https://api.pagcripto.com.br/v2/public",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(this.baseUrl + "/ticker/" + base + quote);

    res = res.data;
    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.sell,
      bid: res.buy,
      vol: res.volume,
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    let res = await this.fetch(this.baseUrl + "/orders/" + base + quote);
    if (!res || !res.data) {
      throw new ConnectorError(ERROR_TYPES.API_RESPONSE_ERROR);
    }

    res = res.data;

    return {
      asks: (res.asks || []).map((o: IOrderbookOrder) => ({
        price: Number(o.price),
        amount: Number(o.amount),
      })),
      bids: (res.bids || []).map((o: IOrderbookOrder) => ({
        price: Number(o.price),
        amount: Number(o.amount),
      })),
    };
  }
}
