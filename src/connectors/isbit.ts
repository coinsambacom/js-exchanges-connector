import { IExchangeImplementationConstructorArgs } from '../interfaces/exchange.js';
import { peatio } from '../interfaces/peatio.js';

export class isbit<T> extends peatio<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "isbit",
      baseUrl: "https://www.isbit.co/api/v2",
      opts: args?.opts,
    });
  }
}
