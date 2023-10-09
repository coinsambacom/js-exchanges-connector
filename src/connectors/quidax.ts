import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../utils/DTOs";

interface QuidaxBaseRes<T> {
  status: string;
  message: string;
  data: T;
}

interface Order {
  id: string;
  side: string;
  ord_type: string;
  price: string;
  avg_price: string;
  state: string;
  currency: string;
  origin_volume: string;
  volume: string;
  executed_volume: string;
  trades_count: number;
  created_at: string;
  updated_at: string;
}

interface OrderBook {
  asks: Order[];
  bids: Order[];
}

export interface Ticker {
  at: number;
  ticker: {
    buy: string;
    sell: string;
    low: string;
    high: string;
    open: string;
    last: string;
    vol: string;
  };
}

interface Tickers {
  [pair: string]: Ticker;
}

export class quidax<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "quidax",
      baseUrl: "https://www.quidax.com/api",
      opts: args?.opts,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const res = await this.fetch<QuidaxBaseRes<Tickers>>(
      `${this.baseUrl}/v1/markets/tickers`,
    );

    const tickers: ITicker[] = [];

    for (const pair in res.data) {
      if (pair.endsWith(quote.toLowerCase())) {
        const tickerData = res.data[pair]!;

        if (tickerData) {
          const { ticker } = tickerData;

          tickers.push({
            exchangeId: this.id,
            base: pair.replace(quote, "").toUpperCase(),
            quote,
            last: Number(ticker.last),
            ask: Number(ticker.sell),
            bid: Number(ticker.buy),
            vol: Number(ticker.vol),
          });
        }
      }
    }

    return tickers;
  }

  private parseOrder({ price, volume }: Order): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(volume),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const { data } = await this.fetch<QuidaxBaseRes<OrderBook>>(
      `${
        this.baseUrl
      }/v1/markets/${base.toLowerCase()}${quote.toLowerCase()}/order_book`,
    );

    return {
      asks: data.asks.map(this.parseOrder),
      bids: data.bids.map(this.parseOrder),
    };
  }
}
