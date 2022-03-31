import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker, IExchangeBase } from "../types/common";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";

interface ISatoshiTangoTickerRes {
  data: {
    [key: string]: {
      ask: number;
      bid: number;
      volume: number;
    };
  };
  code: string;
}

export class satoshitango<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "satoshitango",
      baseUrl: "https://api.satoshitango.com/v3",
      opts: args?.opts,
      limiter: args?.limiter,
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

  async getAllTickers(quote: string): Promise<ITicker[]> {
    const res = await this.fetch<ISatoshiTangoTickerRes>(
      `${this.baseUrl}/ticker/${quote}`,
    );
    if (res.code !== "success")
      throw new ConnectorError(ERROR_TYPES.API_RESPONSE_ERROR);

    return Object.keys(res.data).map((base) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { ask, bid, volume } = res.data.ticker[base];

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
    const tickers = await this.getAllTickers(quote);

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
