import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";

export class ftx<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "ftx",
      baseUrl: "https://ftx.com/api",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getTicker(asset: any, market: string) {
    if (market === "BRL") market = "BRZ";
    let res = await this.fetch(`${this.baseUrl}/markets/${asset}_${market}`);

    res = res.result;
    return {
      last: res.last,
      ask: res.ask,
      bid: res.bid,
      vol: res.quoteVolume24h / res.last,
    };
  }

  async getBook(base: any, quote: string) {
    if (quote === "BRL") quote = "BRZ";
    let res = await this.fetch(
      `${this.baseUrl}/markets/${base}_${quote}/orderbook?depth=50`,
    );

    res = res.result;
    return {
      asks: res.asks.map((order: any[]) => ({
        price: order[0],
        amount: order[1],
      })),
      bids: res.bids.map((order: any[]) => ({
        price: order[0],
        amount: order[1],
      })),
    };
  }
}
