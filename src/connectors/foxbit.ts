import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { ITicker } from "../types/common";

export class foxbit<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "foxbit",
      baseUrl: "https://watcher.foxbit.com.br/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch(
      `${this.baseUrl}/Ticker?exchange=Foxbit&Pair=${quote}X${base}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.sellPrice,
      bid: res.buyPrice,
      vol: res.vol,
    };
  }
}
