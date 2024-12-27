import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";

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

export class mercadobitcoin<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "mercadobitcoin",
      baseUrl: "https://api.mercadobitcoin.net/api/v4",
      opts: args?.opts,
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

    const maxSymbols = 50;

    const symbolsChunks: string[] = [];
    for (let i = 0; i < pairs.symbol.length; i += maxSymbols) {
      symbolsChunks.push(pairs.symbol.slice(i, i + maxSymbols).join(","));
    }

    const tickersSettled = await Promise.allSettled(
      symbolsChunks.map((symbols) =>
        this.fetch<IMercadoBitcoinTicker[]>(
          `${this.baseUrl}/tickers?symbols=${symbols}`,
        ),
      ),
    );

    const tickers = tickersSettled
      .filter(
        (result): result is PromiseFulfilledResult<IMercadoBitcoinTicker[]> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    const res = tickers.flat();

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
