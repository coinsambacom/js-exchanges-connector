import { bnb } from "../interfaces/bnb";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";

export class binance_je<T> extends bnb<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "binance_je",
      baseUrl: "https://api.binance.je/api/v3",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }
}
