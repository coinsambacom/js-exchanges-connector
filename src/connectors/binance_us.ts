import { bnb } from '../interfaces/bnb.js';
import { IExchangeImplementationConstructorArgs } from '../interfaces/exchange.js';

export class binance_us<T> extends bnb<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "binance_us",
      baseUrl: "https://api.binance.us/api/v3",
      opts: args?.opts,
    });
  }
}
