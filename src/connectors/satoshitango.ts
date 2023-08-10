import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";

interface ISatoshiTangoTicker {
  date: string;
  timestamp: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  volume: number;
  change: number;
}

interface ISatoshiTangoTickerRes {
  data: {
    ticker: {
      [base: string]: ISatoshiTangoTicker;
    };
    code: string;
  };
}

interface ISatoshiTangoTickersRes {
  data: {
    ticker: {
      [quote: string]: {
        [base: string]: ISatoshiTangoTicker;
      };
    };
    code: string;
  };
}

export class satoshitango<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "satoshitango",
      baseUrl: "https://api.satoshitango.com/v3",
      opts: args?.opts,
    });
  }

  private getAmountForBase(base: string) {
    if (base === "XRP") return 1000;
    else if (base === "BTC") return 50;
    else if (base === "LTC") return 150;
    else if (base === "ETH") return 150;
    else if (base === "DAI") return 50000;
    else if (base === "DAI" || base === "USDC") return 50000;
    return 20;
  }

  async getAllTickers(): Promise<ITicker[]> {
    const { data: res } = await this.fetch<ISatoshiTangoTickersRes>(
      `${this.baseUrl}/ticker/ALL`,
    );

    if (res.code !== "success")
      throw new ConnectorError(ERROR_TYPES.API_RESPONSE_ERROR);

    const tickers: ITicker[] = [];

    for (const quote in res.ticker) {
      const tickersForQuote = res.ticker[quote];
      for (const base in tickersForQuote) {
        if (tickersForQuote[base]) {
          const { ask, bid, volume } = tickersForQuote[
            base
          ] as ISatoshiTangoTicker;

          tickers.push({
            exchangeId: this.id,
            base,
            quote,
            last: (ask + bid) / 2,
            ask,
            bid,
            vol: volume,
          });
        }
      }
    }

    return tickers;
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const { data: res } = await this.fetch<ISatoshiTangoTickerRes>(
      `${this.baseUrl}/ticker/${quote}`,
    );

    if (res.code !== "success")
      throw new ConnectorError(ERROR_TYPES.API_RESPONSE_ERROR);

    return Object.keys(res.ticker).map((base) => {
      const { ask, bid, volume } = res.ticker[base] as ISatoshiTangoTicker;

      return {
        exchangeId: this.id,
        base,
        quote,
        last: (ask + bid) / 2,
        ask,
        bid,
        vol: volume,
      };
    });
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const tickers = await this.getAllTickersByQuote(quote);

    const filtered = tickers.find((e) => e.base === base);

    return {
      asks: filtered
        ? [
            {
              price: filtered.ask,
              amount: this.getAmountForBase(base),
            },
          ]
        : [],
      bids: filtered
        ? [
            {
              price: filtered.bid,
              amount: this.getAmountForBase(base),
            },
          ]
        : [],
    };
  }
}
