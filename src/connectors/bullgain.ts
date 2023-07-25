import { bws } from "../interfaces/bws";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";

export class bullgain<T> extends bws<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bullgain",
      baseUrl: "https://trade.bullgain.com/api/v3/public",
      opts: args?.opts,
    });
  }
}
