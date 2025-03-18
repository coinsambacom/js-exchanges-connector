import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";
import { upbit_interface } from "../interfaces/upbit.interface";

export class upbit<T> extends upbit_interface<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "upbit",
      baseUrl: "https://api.upbit.com",
      opts: args?.opts,
    });
  }
}

export class upbit_id<T> extends upbit_interface<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "upbit_id",
      baseUrl: "https://id-api.upbit.com",
      opts: args?.opts,
    });
  }
}

export class upbit_sg<T> extends upbit_interface<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "upbit_sg",
      baseUrl: "https://sg-api.upbit.com",
      opts: args?.opts,
    });
  }
}
