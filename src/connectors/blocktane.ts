import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { ITicker } from "../utils/DTOs";

export class blocktane<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "blocktane",
      baseUrl: "https://trade.blocktane.io/api",
      opts: args?.opts,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(
      `${
        this.baseUrl
      }/v2/xt/public/markets/${base.toLowerCase()}${quote.toLowerCase()}/tickers`,
    );

    res = res.ticker;
    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last),
      ask: Number(res.last),
      bid: Number(res.last),
      vol: Number(res.amount),
    };
  }
}
