import { IExchangeImplementationConstructorArgs } from '../interfaces/exchange.js';
import { upex } from '../interfaces/upex.js';

export class upcambio<T> extends upex<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "upcambio",
      baseUrl: "https://api.upcambio.com",
      opts: args?.opts,
    });
  }
}
