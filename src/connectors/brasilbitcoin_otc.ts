import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { ITicker } from "../utils/DTOs";

interface IBrasilBitcoinOtcTicker {
  last: number;
  max: string;
  min: string;
  buy: number;
  sell: number;
  open: string;
  vol: number;
  trade: number;
  trades: number;
  vwap: number;
  money: number;
}

export class brasilbitcoin_otc<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "brasilbitcoin_otc",
      baseUrl: "https://brasilbitcoin.com.br/API",
      opts: args?.opts,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<IBrasilBitcoinOtcTicker>(
      `${this.baseUrl}/otc/prices/${base}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.sell,
      bid: res.buy,
      vol: res.vol,
    };
  }
}
