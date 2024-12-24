import { IOrderbook, ITicker } from "../utils/DTOs";
import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { ConnectorError } from "../utils/ConnectorError";
import { ConnectorErrors } from "..";

interface BaseRes<T> {
  retCode: number;
  retMsg: string;
  result: T;
  time: number;
}

interface TickersRes {
  category: "spot";
  list: TickerRes[];
}

interface TickerRes {
  symbol: string;
  bid1Price: string;
  bid1Size: string;
  ask1Price: string;
  ask1Size: string;
  lastPrice: string;
  prevPrice24h: string;
  price24hPcnt: string;
  highPrice24h: string;
  lowPrice24h: string;
  turnover24h: string;
  volume24h: string;
  usdIndexPrice?: string;
}

type Order = [string, string]; // [price, amount]

interface OrderbookRes {
  s: string;
  a: Order[];
  b: Order[];
  ts: number;
  u: number;
  seq: number;
  cts: number;
}

export class bybit<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bybit",
      baseUrl: "https://api.bybit.com",
      opts: args?.opts,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const res = await this.fetch<BaseRes<TickersRes>>(
      `${this.baseUrl}/v5/market/tickers?category=spot`,
    );

    const tickers: ITicker[] = this.parseTickers(res, quote);

    return tickers;
  }

  private parseTickers(res: BaseRes<TickersRes>, quote: string) {
    const tickers: ITicker[] = [];

    for (const ticker of res.result.list) {
      if (ticker.symbol.endsWith(quote)) {
        tickers.push({
          exchangeId: this.id,
          base: ticker.symbol.replace(quote, ""),
          quote,
          last: Number(ticker.lastPrice),
          ask: Number(ticker.ask1Price),
          bid: Number(ticker.bid1Price),
          vol: Number(ticker.volume24h),
        });
      }
    }
    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<BaseRes<TickersRes>>(
      `${this.baseUrl}/v5/market/tickers?category=spot&symbol=${base}${quote}`,
    );

    const ticker = this.parseTickers(res, quote);

    if (ticker.length === 0) {
      throw new ConnectorError(
        ConnectorErrors.ERROR_TYPES.API_RESPONSE_ERROR,
        `Ticker not found for ${base}${quote}`,
      );
    }

    return ticker[0]!;
  }

  private parseOrder(orders: Order[]) {
    return orders.map(([price, amount]: Order) => ({
      price: Number(price),
      amount: Number(amount),
    }));
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<BaseRes<OrderbookRes>>(
      `${this.baseUrl}/v5/market/orderbook?category=spot&symbol=${base}${quote}&limit=200`,
    );

    return {
      asks: this.parseOrder(res.result.a),
      bids: this.parseOrder(res.result.b),
    };
  }
}
