import { bws } from "../interfaces/bws";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";

export class exccripto<T> extends bws<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "exccripto",
      baseUrl: "https://trade.exccripto.com/api/v3/public",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }
}
