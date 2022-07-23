import { IOrderbook, ITicker } from "../types/common";
import { Exchange, IExchangeBaseConstructorArgs } from "./exchange";

interface IBinanceExchangeInfoRes {
  symbols: {
    status: string;
    isSpotTradingAllowed: boolean;
    baseAsset: string;
    quoteAsset: string;
    symbol: string;
  }[];
}

interface IBinanceTicker24hRes {
  symbol: string;
  lastPrice: string;
  bidPrice: string;
  askPrice: string;
  volume: string;
}

type IBinanceOrder = [string, string];

interface IBinanceOrderbook {
  asks: IBinanceOrder[];
  bids: IBinanceOrder[];
}

export class bnb<T> extends Exchange<T> {
  constructor(args: IExchangeBaseConstructorArgs<T>) {
    super({ ...args });
  }

  async getAllTickers(): Promise<ITicker[]> {
    const { symbols: markets } = await this.fetch<IBinanceExchangeInfoRes>(
      `${this.baseUrl}/exchangeInfo`,
    );
    const tickers = await this.fetch<IBinanceTicker24hRes[]>(
      `${this.baseUrl}/ticker/24hr`,
    );

    const marketsEnabled = markets.filter(
      (market) =>
        market.status === "TRADING" && market.isSpotTradingAllowed === true,
    );

    const returns: ITicker[] = [];

    for (const {
      symbol,
      baseAsset: base,
      quoteAsset: quote,
    } of marketsEnabled) {
      const tickerFound = tickers.find((item) => item.symbol === symbol);
      if (tickerFound) {
        returns.push({
          exchangeId: this.id,
          base,
          quote,
          last: Number(tickerFound.lastPrice),
          bid: Number(tickerFound.bidPrice),
          ask: Number(tickerFound.askPrice),
          vol: Number(tickerFound.volume),
        });
      }
    }

    return returns;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<{
      lastPrice: string;
      bidPrice: string;
      askPrice: string;
      volume: string;
    }>(this.baseUrl + "/ticker/24hr?symbol=" + base + quote);

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.lastPrice),
      ask: Number(res.askPrice),
      bid: Number(res.bidPrice),
      vol: Number(res.volume),
    };
  }

  private parseOrder(orders: IBinanceOrder[]) {
    return orders.map(([price, amount]: IBinanceOrder) => ({
      price: Number(price),
      amount: Number(amount),
    }));
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<IBinanceOrderbook>(
      `${this.baseUrl}/depth?symbol=${base}${quote}&limit=20`,
    );

    return {
      asks: this.parseOrder(res.asks),
      bids: this.parseOrder(res.bids),
    };
  }
}
