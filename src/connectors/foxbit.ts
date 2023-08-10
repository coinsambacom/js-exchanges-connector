import { alphapoint } from "../interfaces/alphapoint";
import { IExchangeImplementationConstructorArgs } from "../interfaces/exchange";
import { ITicker } from "../utils/DTOs";

interface IFoxbitAllTickers {
  symbol: string;
  price: number;
  priceChange24hPercent: number;
  name: string;
  icon: string;
  rank: number;
  volume: number;
  low: number;
  high: number;
  marketcap: number;
  lastUpdateTimestamp: number;
}

export class foxbit<T> extends alphapoint<T> {
  private tickerUrl: string;
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "foxbit",
      baseUrl: "https://watcher.foxbit.com.br/api",
      websocketUrl: "wss://api.foxbit.com.br/",
      opts: args?.opts,
    });

    this.tickerUrl = "https://foxbit.com.br/_api/ticker?cache=0";
  }

  normalizeAsset(asset: string | number): string | number {
    if (asset == "BTC") return 1;
    else if (asset == "LTC") return 2;
    else if (asset == "ETH") return 4;
    else if (asset == "TUSD") return 6;
    else if (asset == "XRP") return 10;
    else if (asset == 1) return "BTC";
    else if (asset == 2) return "LTC";
    else if (asset == 4) return "ETH";
    else if (asset == 6) return "TUSD";
    else if (asset == 10) return "XRP";
    return asset;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch(
      `${this.baseUrl}/Ticker?exchange=Foxbit&Pair=${quote}X${base}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.sellPrice,
      bid: res.buyPrice,
      vol: res.vol,
    };
  }

  async getAllTickers(): Promise<ITicker[]> {
    const res = await this.fetch<IFoxbitAllTickers[]>(this.tickerUrl);

    return res.map((ticker) => ({
      exchangeId: this.id,
      base: ticker.symbol,
      quote: "BRL",
      last: ticker.price,
      ask: ticker.price,
      bid: ticker.price,
      vol: ticker.volume,
    }));
  }
}
