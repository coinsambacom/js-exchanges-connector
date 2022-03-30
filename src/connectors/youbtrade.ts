import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";
import { kfex } from "../interfaces/kfex";

export class youbtrade<T> extends kfex<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "youbtrade",
      baseUrl: "https://api.youbtrade.com.br/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }
}
