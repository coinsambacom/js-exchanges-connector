import { alphapoint } from "../interfaces/alphapoint";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";
import { ITicker } from "../types/common";

export class coinext<T> extends alphapoint<T> {
  public tickerUrl: string;

  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "coinext",
      baseUrl: "https://api.coinext.com.br:8443/AP",
      websocketUrl: "wss://api.coinext.com.br/WSGateway/",
      opts: args?.opts,
    });

    this.tickerUrl = "http://apex.coinext.com.br/tickers";
  }

  normalizeAsset(asset: string | number): string | number {
    if (asset == "BTC") return 1;
    else if (asset == "LTC") return 2;
    else if (asset == "ETH") return 4;
    else if (asset == "XRP") return 6;
    else if (asset == "BCH") return 8;
    else if (asset == "USDT") return 10;
    else if (asset == "DOGE") return 14;
    else if (asset == 1) return "BTC";
    else if (asset == 2) return "LTC";
    else if (asset == 4) return "ETH";
    else if (asset == 6) return "XRP";
    else if (asset == 8) return "BCH";
    else if (asset == 10) return "USDT";
    else if (asset == 14) return "DOGE";
    return asset;
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const res = await this.fetch(this.tickerUrl);

    const tickers: ITicker[] = [];
    for (const asset in res) {
      const ticker = res[asset];

      if (!((this.normalizeAsset(asset) as string) === asset))
        tickers.push({
          exchangeId: this.id,
          base: this.normalizeAsset(asset) as string,
          quote,
          last: ticker.last,
          ask: ticker.sell,
          bid: ticker.buy,
          vol: ticker.volume,
        });
    }
    return tickers;
  }
}
