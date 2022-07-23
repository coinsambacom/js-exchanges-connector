import { bnb } from "../interfaces/bnb";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";

export class binance<T> extends bnb<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "binance",
      baseUrl: "https://api.binance.com/api/v3",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }
}
