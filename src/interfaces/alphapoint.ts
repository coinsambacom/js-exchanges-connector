import { IOrderbook, IOrderbookOrder, ITicker } from "../types/common";
import { Exchange } from "./exchange";

type IAlphapointOrderbookRes = number[][];

export class alphapoint<T> extends Exchange<T> {
  public baseUrl: any;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  normalizeAsset(asset: string | number): string | number {
    throw new Error("this method must be overrided");
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    base = this.normalizeAsset(base) as string;

    const res = await this.fetch(
      `${this.baseUrl}/GetLevel1?OMSId=1&InstrumentId=${base} `,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.LastTradedPx,
      ask: res.BestOffer,
      bid: res.BestBid,
      vol: res.Volume,
    };
  }

  private parseOrder(order: number[]) {
    return {
      price: order[6] as number,
      amount: order[8] as number,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string): Promise<IOrderbook> {
    base = this.normalizeAsset(base) as string;

    const res = await this.fetch<IAlphapointOrderbookRes>(
      `${this.baseUrl}/GetL2Snapshot?OMSId=1&InstrumentId=${base}&Depth=50`,
    );

    const normalizedBook = {
      asks: [] as IOrderbookOrder[],
      bids: [] as IOrderbookOrder[],
    };

    res.forEach((order) => {
      if (order[9] === 1) {
        normalizedBook.asks.push(this.parseOrder(order));
      } else {
        normalizedBook.bids.push(this.parseOrder(order));
      }
    });

    return normalizedBook;
  }
}
