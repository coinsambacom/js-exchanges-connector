import { bnb } from "../interfaces/bnb";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";

export class binance_us<T> extends bnb<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "binance_us",
      baseUrl: "https://api.binance.us/api/v3",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }
}
