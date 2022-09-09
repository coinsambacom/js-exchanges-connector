import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../types/common";

interface IMercadoBitcoinTicker {
  buy: string;
  date: number;
  high: string;
  last: string;
  low: string;
  open: string;
  pair: string;
  sell: string;
  vol: string;
}

interface IMercadoBitcoinSymbolsRes {
  symbol: string[];
  description: string[];
  currency: string[];
  "base-currency": string[];
  "exchange-listed": boolean[];
  "exchange-traded": boolean[];
  minmovement: string[];
  pricescale: number[];
  type: string[];
  timezone: string[];
  "session-regular": string[];
  "withdrawal-fee": string[];
}

type IMercadoBitcoinOrderbookOrder = [number, number];

interface IMercadoBitcoinOrderbookRes {
  asks: IMercadoBitcoinOrderbookOrder[];
  bids: IMercadoBitcoinOrderbookOrder[];
}

export class mercadobitcoin<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "mercadobitcoin",
      baseUrl: "https://api.mercadobitcoin.net/api/v4",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<IMercadoBitcoinTicker[]>(
      `${this.baseUrl}/tickers?symbols=${base}-${quote}`,
    );

    const ticker = res[0]!;

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(ticker.last),
      ask: Number(ticker.sell),
      bid: Number(ticker.buy),
      vol: Number(ticker.vol),
    };
  }

  async getAllTickers(): Promise<ITicker[]> {
    const pairs = await this.fetch<IMercadoBitcoinSymbolsRes>(
      `${this.baseUrl}/symbols`,
    );

    const symbols = pairs.symbol.join(",");

    const res = await this.fetch<IMercadoBitcoinTicker[]>(
      `${this.baseUrl}/tickers?symbols=${symbols}`,
    );

    return res.map((ticker) => {
      const [base, quote] = ticker.pair.split("-") as [string, string];

      return {
        exchangeId: this.id,
        base,
        quote,
        last: Number(ticker.last),
        ask: Number(ticker.sell),
        bid: Number(ticker.buy),
        vol: Number(ticker.vol),
      };
    });
  }

  private parseOrder([price, amount]: IMercadoBitcoinOrderbookOrder) {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<IMercadoBitcoinOrderbookRes>(
      `${this.baseUrl}/${base}-${quote}/orderbook/`,
    );

    return {
      asks: res.asks.map(this.parseOrder),
      bids: res.bids.map(this.parseOrder),
    };
  }
}
