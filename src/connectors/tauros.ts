import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../types/common";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";

interface ITaurosOrderbookOrder {
  amount: number;
  value: number;
  price: string;
  created_at: string;
  id: number;
}

interface ITaurosOrderbookRes {
  success: boolean;
  msg: any;
  payload: {
    bids: ITaurosOrderbookOrder[];
    asks: ITaurosOrderbookOrder[];
  };
}

export class tauros<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "tauros",
      baseUrl: "https://api.tauros.io/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getAllTickers(): Promise<ITicker[]> {
    let res = await this.fetch(this.baseUrl + "/v2/trading/tickers/");
    if (!res || !res.success) return res;
    res = res.payload;
    return res.map(
      (t: {
        market: { split: (arg0: string) => [any, any] };
        last: any;
        volume: any;
      }) => {
        const [base, quote] = t.market.split("-");
        return {
          exchangeId: this.id,
          base,
          quote,
          last: t.last,
          ask: t.last,
          bid: t.last,
          vol: t.volume,
        };
      },
    );
  }

  private parseOrder({
    amount,
    price,
  }: ITaurosOrderbookOrder): IOrderbookOrder {
    return {
      amount,
      price: Number(price),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<ITaurosOrderbookRes>(
      `${this.baseUrl}/v2/trading/${base}-${quote}/orderbook/`,
    );
    if (!res.success) {
      throw new ConnectorError(ERROR_TYPES.API_RESPONSE_ERROR, res.msg);
    }

    const book = res.payload;

    return {
      asks: book.asks.map(this.parseOrder),
      bids: book.bids.map(this.parseOrder),
    };
  }
}
