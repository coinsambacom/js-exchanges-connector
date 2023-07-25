import { bws } from "../interfaces/bws";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";

export class stonoex<T> extends bws<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "stonoex",
      baseUrl: "https://exchange.stonoex.com/api/v3/public",
      opts: args?.opts,
    });
  }
}
