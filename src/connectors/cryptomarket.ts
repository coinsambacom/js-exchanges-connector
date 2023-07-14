import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../types/common";

interface ICryptoMarketTicker {
  ask: string;
  bid: string;
  last: string;
  low: string;
  high: string;
  open: string;
  volume: string;
  volume_quote: string;
  timestamp: string;
}

interface ICryptoMarketTickersRes {
  [pair: string]: ICryptoMarketTicker;
}

type ICryptoMarketOrder = [string, string];

interface ICryptoMarketOrderbookRes {
  ask: ICryptoMarketOrder[];
  bid: ICryptoMarketOrder[];
}

export class cryptomarket<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "cryptomarket",
      baseUrl: "https://api.exchange.cryptomkt.com/api/3",
      opts: args?.opts,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const { data: res } = await this.fetch<ICryptoMarketTickersRes>(
      this.baseUrl + "/public/ticker",
    );

    const tickers: ITicker[] = [];

    for (const pair in res) {
      if (pair.endsWith(quote)) {
        const ticker = res[pair] as ICryptoMarketTicker;
        tickers.push({
          exchangeId: this.id,
          base: pair.replace(quote, ""),
          quote,
          last: Number(ticker.last),
          ask: Number(ticker.ask),
          bid: Number(ticker.bid),
          vol: Number(ticker.volume),
        });
      }
    }

    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const ticker = await this.fetch<ICryptoMarketTicker>(
      this.baseUrl + "/public/ticker/" + base + quote,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(ticker.last),
      ask: Number(ticker.ask),
      bid: Number(ticker.bid),
      vol: Number(ticker.volume),
    };
  }

  private parseOrder([price, amount]: ICryptoMarketOrder): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const book = await this.fetch<ICryptoMarketOrderbookRes>(
      this.baseUrl + "/public/orderbook/" + base + quote,
    );

    return {
      asks: book.ask.map(this.parseOrder),
      bids: book.bid.map(this.parseOrder),
    };
  }
}
