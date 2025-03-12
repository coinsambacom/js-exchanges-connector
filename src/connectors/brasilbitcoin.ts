import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { FetcherRequisitionMethods, IOrderbook, ITicker } from "../utils/DTOs";

type BrasilBitcoinBaseRes = {
  success: boolean;
  serverTime: number;
};

type BrasilBitcoinSymbol = {
  symbol: string;
  quoteCurrency: string;
  askPrice: string;
  bidPrice: string;
  priceChangePercent: number;
  isFrozen: number;
  volume: string;
  quoteVolume: string;
  baseCurrency: string;
  highPrice: string;
  lowPrice: string;
  lastPrice: string;
  openPrice: string;
};

type BrasilBitcoinOrderbookOrder = {
  "0": string;
  "1": string;
};

export class brasilbitcoin<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "brasilbitcoin",
      baseUrl: "https://brasilbitcoin.com.br/API",
      opts: args?.opts,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch({
      url: `${this.baseUrl}/prices/${base}`,
      method: FetcherRequisitionMethods.GET,
    });

    return {
      exchangeId: this.id,
      base,
      quote,
      last: parseFloat(res.last),
      ask: parseFloat(res.sell),
      bid: parseFloat(res.buy),
      vol: parseFloat(res.vol),
    };
  }

  async getAllTickers(): Promise<ITicker[]> {
    const res = await this.fetch<
      BrasilBitcoinBaseRes & {
        symbols: BrasilBitcoinSymbol[];
      }
    >({
      url: `${this.baseUrl}/v2/summary`,
      method: FetcherRequisitionMethods.GET,
    });

    return res.symbols.map((s) => ({
      exchangeId: this.id,
      base: s.baseCurrency,
      quote: s.quoteCurrency,
      last: parseFloat(s.lastPrice),
      ask: parseFloat(s.askPrice),
      bid: parseFloat(s.bidPrice),
      vol: parseFloat(s.volume),
    }));
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<
      BrasilBitcoinBaseRes & {
        orders: {
          bids: BrasilBitcoinOrderbookOrder[];
          asks: BrasilBitcoinOrderbookOrder[];
        };
      }
    >({
      url: `${this.baseUrl}/v2/orderbook/${base}${quote}`,
      method: FetcherRequisitionMethods.GET,
      data: {
        limit: 100,
      },
    });

    return {
      asks: res.orders.asks.map((order) => ({
        price: parseFloat(order["0"]),
        amount: parseFloat(order["1"]),
      })),
      bids: res.orders.bids.map((order) => ({
        price: parseFloat(order["0"]),
        amount: parseFloat(order["1"]),
      })),
    };
  }
}
