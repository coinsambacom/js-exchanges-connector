import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IExchangeBase, ITicker } from "../types/common";

export class noxbitcoin<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "noxbitcoin",
      baseUrl: "https://charlie.noxbitcoin.com.br/public/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(`${this.baseUrl}/v1/ticker?volume=1`);
    if (!res || !res.ticker) return res;
    res = res.ticker;
    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last_price,
      ask: res.ask,
      bid: res.bid,
      vol: res.volume,
    };
  }
}
