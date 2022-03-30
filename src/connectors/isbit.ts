import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";
import { peatio } from "../interfaces/peatio";

export class isbit<T> extends peatio<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "isbit",
      baseUrl: "https://www.isbit.co/api/v2",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }
}
