import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../utils/DTOs";

interface Order {
  price: string;
  volume: string;
}

type OrderBook = {
  timestamp: number;
  asks: Order[];
  bids: Order[];
};

interface Ticker {
  pair: string;
  timestamp: number;
  bid: string;
  ask: string;
  last_trade: string;
  rolling_24_hour_volume: string;
  status: string;
}

interface Tickers {
  tickers: Ticker[];
}

export class luno<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "luno",
      baseUrl: "https://api.luno.com/api/1",
      opts: args?.opts,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const res = await this.fetch<Tickers>(`${this.baseUrl}/tickers`);

    const tickers: ITicker[] = [];

    for (const ticker of res.tickers) {
      if (ticker.pair.endsWith(quote)) {
        let base = ticker.pair.replace(quote, "");

        if (base == "XBT") {
          base = "BTC";
        }

        tickers.push({
          exchangeId: this.id,
          base,
          quote,
          last: Number(ticker.last_trade),
          ask: Number(ticker.ask),
          bid: Number(ticker.bid),
          vol: Number(ticker.rolling_24_hour_volume),
        });
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
    if (base == "BTC") {
      base = "XBT";
    }

    const data = await this.fetch<OrderBook>(
      `${this.baseUrl}/orderbook?pair=${base}${quote}`,
    );

    return {
      asks: data.asks.map(this.parseOrder),
      bids: data.bids.map(this.parseOrder),
    };
  }
}
