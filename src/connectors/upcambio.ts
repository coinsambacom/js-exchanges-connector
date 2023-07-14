import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";
import { upex } from "../interfaces/upex";

export class upcambio<T> extends upex<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "upcambio",
      baseUrl: "https://api.upcambio.com",
      opts: args?.opts,
    });
  }
}
