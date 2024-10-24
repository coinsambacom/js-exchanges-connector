Youre an assistant that use the provided API doc to create a class like provided example.

# Steps

1. Use the uploaded file to generate an API class based on the documentation.
2. Name the class after the domain provided in the file.
3. Create public methods for the following: `getBook(base, quote)` and `getTicker(base, quote)`.

# Notes

- If the API doesn't provide pairs explicity separated but returns all tickers, create a method called `getAllTickersByQuote(quote)` to filter tickers by the given quote.
- Use any JSON examples from the documentation to define return interfaces, and incorporate them into the method responses. Ignore comments in the JSON examples.
- DONT assume in `getAllTickers()` that all tickers ends with quote, only create this method if tickers has explicity base and quote separated.

**MUST:** Return only the generated code. No additional text or comments.

```Typescript
import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";

interface INovaDAXBaseApiResponse {
  code: string;
  message: string;
}

interface INovaDAXTicker {
  ask?: string;
  baseVolume24h: string;
  bid?: string;
  high24h: string;
  lastPrice: string;
  low24h: string;
  open24h: string;
  quoteVolume24h: string;
  symbol: string;
  timestamp: number;
}

interface INovaDAXTickerRes extends INovaDAXBaseApiResponse {
  data: INovaDAXTicker;
}

interface INovaDAXTickersRes extends INovaDAXBaseApiResponse {
  code: string;
  data: INovaDAXTicker[];
}

type INovaDAXOrderbookOrder = [string, string];

interface INovaDAXOrderbookRes extends INovaDAXBaseApiResponse {
  data: {
    asks: INovaDAXOrderbookOrder[];
    bids: INovaDAXOrderbookOrder[];
    timestamp: number;
  };
}

export class novadax<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "novadax",
      baseUrl: "https://api.novadax.com",
      opts: args?.opts,
    });
  }

  async getAllTickers(): Promise<ITicker[]> {
    const { data: res } = await this.fetch<INovaDAXTickersRes>(
      `${this.baseUrl}/v2/market/tickers`,
    );

    return res.map((t) => ({
      exchangeId: this.id,
      base: t.symbol.split("_")[0] as string,
      quote: t.symbol.split("_")[1] as string,
      last: Number(t.lastPrice),
      ask: Number(t.ask ?? 0),
      bid: Number(t.bid ?? 0),
      vol: Number(t.baseVolume24h),
    }));
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const { data: res } = await this.fetch<INovaDAXTickersRes>(
      `${this.baseUrl}/v1/market/tickers`,
    );

    const tickers: ITicker[] = [];

    for (const ticker of res) {
      if (ticker.pair.endsWith(quote)) {
        tickers.push({
          exchangeId: this.id,
          base: ticker.pair.replace(quote, ""),
          quote,
          last: ticker.last,
          ask: ticker.sell,
          bid: ticker.buy,
          vol: ticker.volume,
        });
      }
    }

    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { data: res } = await this.fetch<INovaDAXTickerRes>(
      `${this.baseUrl}/v1/market/ticker?symbol=${base}_${quote}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.lastPrice),
      ask: Number(res.ask ?? 0),
      bid: Number(res.bid ?? 0),
      vol: Number(res.baseVolume24h),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const { data: res } = await this.fetch<INovaDAXOrderbookRes>(
      `${this.baseUrl}/v1/market/depth?symbol=${base}_${quote}&size=10`,
    );

    return {
      asks: (res.asks ?? []).map(([price, amount]) => {
        price: Number(price),
        amount: Number(amount),
      }),
      bids: (res.bids ?? []).map(([price, amount]) => {
        price: Number(price),
        amount: Number(amount),
      }),
    };
  }
}
```
