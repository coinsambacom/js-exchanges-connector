import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";
import { upex } from "../interfaces/upex";

export class makesexchange<T> extends upex<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "makesexchange",
      baseUrl: "https://api.makes.exchange/index.php?",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }
}
