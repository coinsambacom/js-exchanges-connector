import { alphapoint } from "../interfaces/alphapoint";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";

export class flowbtc<T> extends alphapoint<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "flowbtc",
      baseUrl: "https://api.flowbtc.com.br:8443/ap",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  override normalizeAsset(asset: string | number): string | number {
    if (asset == "BTC") return 1;
    else if (asset == "ETH") return 2;
    else if (asset == "LTC") return 3;
    else if (asset == "BCH") return 5;
    else if (asset == "XRP") return 7;
    else if (asset == 1) return "BTC";
    else if (asset == 2) return "ETH";
    else if (asset == 3) return "LTC";
    else if (asset == 5) return "BCH";
    else if (asset == 7) return "XRP";
    return asset;
  }
}
