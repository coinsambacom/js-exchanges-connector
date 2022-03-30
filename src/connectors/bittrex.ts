import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

export class bittrex<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bittrex",
      baseUrl: "https://api.bittrex.com/api/v1.1",
      opts: args?.opts,
      limiter: args?.limiter,
      allTickersAllQuotes: true,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAllTickers(quote: string): Promise<ITicker[]> {
    let res = await this.fetch(this.baseUrl + "/public/getmarketsummaries");

    res = res.result;
    return res.map(
      (t: {
        MarketName: string;
        Last: any;
        Ask: any;
        Bid: any;
        Volume: any;
      }) => {
        return {
          exchangeId: this.id,
          base: t.MarketName.split("-")[1],
          quote: t.MarketName.split("-")[0],
          last: t.Last,
          ask: t.Ask,
          bid: t.Bid,
          vol: t.Volume,
        };
      },
    );
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    let res = await this.fetch(
      this.baseUrl +
        "/public/getmarketsummary?market=" +
        quote +
        "-" +
        base +
        "/",
    );

    res = res.result[0];
    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.Last,
      ask: res.Ask,
      bid: res.Bid,
      vol: res.Volume,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const normalizedBook = {
      asks: [],
      bids: [],
    };
    return normalizedBook;
  }
}
