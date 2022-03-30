import { bws } from "../interfaces/bws";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";

export class comprarbitcoin<T> extends bws<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "comprarbitcoin",
      baseUrl: "https://app.comprarbitcoin.com.br/api/v3/public",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }
}
