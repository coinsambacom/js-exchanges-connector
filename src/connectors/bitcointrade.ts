import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";

interface IBitcoinTradeTickersRes {
  data: {
    pair: string;
    high: number;
    low: number;
    volume: number;
    trades_quantity: number;
    last: number;
    buy: number;
    sell: number;
    date: string;
  }[];
}

interface IBitcoinTradeTickerRes {
  data: {
    last: number;
    sell: number;
    buy: number;
    volume: number;
  };
}

interface IBitcoinTradeOrderBookOrder {
  unit_price: number;
  amount: number;
}

interface IBitcoinTradeOrderBookRes {
  data: {
    asks: IBitcoinTradeOrderBookOrder[];
    bids: IBitcoinTradeOrderBookOrder[];
  };
}

export class bitcointrade<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitcointrade",
      baseUrl: "https://api.bitcointrade.com.br/v3/public",
      opts: args?.opts,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const { data: res } = await this.fetch<IBitcoinTradeTickersRes>(
      `${this.baseUrl}/ticker`,
    );

    const tickers: ITicker[] = [];

    for (const pair in res) {
      if (pair.startsWith(quote)) {
        const ticker = res[pair];
        if (ticker) {
          tickers.push({
            exchangeId: this.id,
            base: pair.replace(quote, ""),
            quote,
            last: ticker.last,
            ask: ticker.sell,
            bid: ticker.buy,
            vol: ticker.volume,
          });
        }
      }
    }

    return tickers;
  }

  async getTicker(base: any, quote: string): Promise<ITicker> {
    const { data: res } = await this.fetch<IBitcoinTradeTickerRes>(
      `${this.baseUrl}/${quote}${base}/ticker`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.sell,
      bid: res.buy,
      vol: res.volume,
    };
  }

  private parseOrder({ amount, unit_price }: IBitcoinTradeOrderBookOrder) {
    return { price: unit_price, amount: amount };
  }

  async getBook(base: any, quote: string): Promise<IOrderbook> {
    const { data: res } = await this.fetch<IBitcoinTradeOrderBookRes>(
      `${this.baseUrl}/${quote}${base}/orders`,
    );

    return {
      asks: res.asks.map(this.parseOrder),
      bids: res.bids.map(this.parseOrder),
    };
  }
}
