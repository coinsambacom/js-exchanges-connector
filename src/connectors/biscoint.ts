import * as sort from "fast-sort";
import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import {
  IExchangeBase,
  IOrderbook,
  IOrderbookOrder,
  ITicker,
} from "../types/common";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";

interface IBiscointTickerRes {
  data: {
    last: number;
    ask: number;
    bid: number;
    vol: number;
  };
}

export class biscoint<T> extends Exchange<T> implements IExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "biscoint",
      baseUrl: "https://api.biscoint.io/v1",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(
    base: string,
    quote: string,
    amount = 10000,
  ): Promise<ITicker> {
    const { data: res } = await this.fetch<IBiscointTickerRes>(
      `${this.baseUrl}/ticker?base=${base}&quote=${quote}&amount=${amount}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.ask,
      bid: res.bid,
      vol: res.vol,
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await Promise.all([
      this.fetch(
        `${this.baseUrl}/ticker?base=${base}&quote=${quote}&amount=1000`,
      ),
      this.fetch(
        `${this.baseUrl}/ticker?base=${base}&quote=${quote}&amount=5000`,
      ),
      this.fetch(
        `${this.baseUrl}/ticker?base=${base}&quote=${quote}&amount=10000`,
      ),
    ]);

    if (!res[0] || !res[0] || !res[0]) {
      throw new ConnectorError(
        ERROR_TYPES.API_RESPONSE_ERROR,
        "book got invalid number",
      );
    }

    const normalizedBook = {
      asks: [] as IOrderbookOrder[],
      bids: [] as IOrderbookOrder[],
    };

    res.forEach((ticker) => {
      normalizedBook.asks.push({
        price: ticker.data.ask,
        amount: ticker.data.askBaseAmountRef,
      });
      normalizedBook.bids.push({
        price: ticker.data.bid,
        amount: ticker.data.bidBaseAmountRef,
      });
    });

    sort.sort(normalizedBook.asks).asc((order: IOrderbookOrder) => order.price);
    sort
      .sort(normalizedBook.bids)
      .desc((order: IOrderbookOrder) => order.price);

    return normalizedBook;
  }
}
