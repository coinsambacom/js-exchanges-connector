import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { ITicker } from "../types/common";

interface INoxBitcoinTicker {
  ask: number;
  bid: number;
  last_price: number;
  timestamp: number;
  volume: number;
}

interface INoxBitcoinTickerRes {
  dolar_price: number;
  ticker: INoxBitcoinTicker;
  ticker_usd: INoxBitcoinTicker;
}

export class noxbitcoin<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "noxbitcoin",
      baseUrl: "https://app.noxbitcoin.com.br/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { ticker: res } = await this.fetch<INoxBitcoinTickerRes>(
      `${this.baseUrl}/tickers/price?volume=1`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last_price,
      ask: res.ask,
      bid: res.bid,
      vol: res.volume,
    };
  }
}
