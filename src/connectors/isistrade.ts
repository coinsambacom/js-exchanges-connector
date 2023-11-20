import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../utils/DTOs";
import { parseBRLNumberString } from "../utils/utils";

interface BaseRes<T> {
  success: boolean;
  message: string;
  result: T;
}

interface IsisTradeOrderbookOrder {
  timestamp: number;
  price: string;
  quantity: string;
}

export class isistrade<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "isistrade",
      baseUrl: "https://isistrade.com/api",
      opts: args?.opts,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const res = await this.fetch<
      BaseRes<
        {
          timestamp: number;
          marketName: string;
          marketAsset: string;
          baseAsset: string;
          marketAssetName: string;
          baseAssetName: string;
          high: string;
          low: string;
          last: string;
          volume: string;
          baseVolume: string;
          bid: string;
          ask: string;
          isActive: boolean;
          infoMessage: string;
        }[]
      >
    >(`${this.baseUrl}/public/marketsummaries?basemarket=${quote}`);

    return res.result.map((t) => ({
      exchangeId: this.id,
      base: t.marketAsset,
      quote: t.baseAsset,
      ask: parseBRLNumberString(t.ask),
      bid: parseBRLNumberString(t.bid),
      last: parseBRLNumberString(t.last),
      vol: parseBRLNumberString(t.volume),
    }));
  }

  private parseOrder({
    price,
    quantity,
  }: IsisTradeOrderbookOrder): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(quantity),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<
      BaseRes<{
        sell: IsisTradeOrderbookOrder[];
        buy: IsisTradeOrderbookOrder[];
      }>
    >(
      `${this.baseUrl}/public/orderbook?market=${base}_${quote}&type=ALL&depth=20`,
    );

    return {
      asks: res.result.sell.map(this.parseOrder),
      bids: res.result.buy.map(this.parseOrder),
    };
  }
}
