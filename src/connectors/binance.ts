import { bnb } from '../interfaces/bnb.js';
import { IExchangeImplementationConstructorArgs } from '../interfaces/exchange.js';

export class binance<T> extends bnb<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "binance",
      baseUrl: "https://api.binance.com/api/v3",
      opts: args?.opts,
    });
  }
}
