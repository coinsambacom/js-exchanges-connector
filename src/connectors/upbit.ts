import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { FetcherRequisitionMethods, IOrderbook, ITicker } from "../utils/DTOs";

interface upbitTickerRes {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_timestamp: number;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: string;
  change_price: number;
  change_rate: number;
  signed_change_price: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  highest_52_week_price: number;
  highest_52_week_date: string;
  lowest_52_week_price: number;
  lowest_52_week_date: string;
  timestamp: number;
}

interface UpBitOrderbookRes {
  market: string;
  timestamp: number;
  total_ask_size: number;
  total_bid_size: number;
  orderbook_units: Orderbookunit[];
}

interface Orderbookunit {
  ask_price: number;
  bid_price: number;
  ask_size: number;
  bid_size: number;
}

export class upbit<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "upbit",
      baseUrl: "https://sg-api.upbit.com",
      opts: args?.opts,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const res = await this.fetch<upbitTickerRes[]>({
      url: `${this.baseUrl}/v1/ticker/all`,
      data: {
        quote_currencies: quote,
      },
      method: FetcherRequisitionMethods.GET,
    });

    const tickers: ITicker[] = res.map((ticker) => {
      const [quote, base] = ticker.market.split("-");

      return {
        exchangeId: this.id,
        base: base!,
        quote: quote!,
        ask: Number(ticker.trade_price),
        bid: Number(ticker.trade_price),
        last: Number(ticker.trade_price),
        vol: Number(ticker.acc_trade_volume_24h),
      };
    });

    return tickers;
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<UpBitOrderbookRes[]>({
      url: `${this.baseUrl}/v1/orderbook`,
      data: {
        markets: `${quote.toUpperCase()}-${base.toUpperCase()}`,
      },
      method: FetcherRequisitionMethods.GET,
    });

    const book = res[0]!;

    const returnBook: IOrderbook = {
      asks: [],
      bids: [],
    };

    book.orderbook_units.forEach((unit) => {
      returnBook.asks.push({
        price: unit.ask_price,
        amount: unit.ask_size,
      });
      returnBook.bids.push({
        price: unit.bid_price,
        amount: unit.bid_size,
      });
    });

    return returnBook;
  }
}
