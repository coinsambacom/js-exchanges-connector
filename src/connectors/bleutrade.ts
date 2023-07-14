import { bws } from "../interfaces/bws";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";

export class bleutrade<T> extends bws<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bleutrade",
      baseUrl: "https://bleutrade.com/api/v3/public",
      opts: args?.opts,
    });
  }
}
