import { bws } from "../interfaces/bws";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";

export class bitrecife<T> extends bws<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitrecife",
      baseUrl: "https://exchange.bitrecife.com.br/api/v3/public",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }
}
