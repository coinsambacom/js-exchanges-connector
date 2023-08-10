import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";

interface IFluyezTickerRes {
  data: {
    [symbol: string]: number;
  };
}

export class fluyez<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "fluyez",
      baseUrl: "https://api.fluyez.com/w/v2",
      opts: args?.opts,
    });
  }

  private getAmountForBase(base: string) {
    if (base === "XRP") return 1000;
    else if (base === "BTC") return 0.3;
    else if (base === "LTC") return 150;
    else if (base === "ETH") return 1;
    return 20;
  }

  async getAllTickers(): Promise<ITicker[]> {
    const { data: res } = await this.fetch<IFluyezTickerRes>(
      `${this.baseUrl}/ms-coin/price/now`,
    );

    return Object.keys(res).map((base) => {
      return {
        exchangeId: this.id,
        base,
        quote: "USD",
        last: res[base]!,
        ask: res[base]!,
        bid: res[base]!,
        vol: 0,
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const tickers = await this.getAllTickers();

    const found = tickers.find((e) => e.base === base);

    return {
      asks: found
        ? [
            {
              price: found.ask,
              amount: this.getAmountForBase(base),
            },
          ]
        : [],
      bids: found
        ? [
            {
              price: found.bid,
              amount: this.getAmountForBase(base),
            },
          ]
        : [],
    };
  }
}
