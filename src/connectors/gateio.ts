import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";

interface GateIoTickerRes {
  result: string;
  last: string;
  lowestAsk: string;
  highestBid: string;
  percentChange: string;
  baseVolume: string;
  quoteVolume: string;
  high24hr: string;
  low24hr: string;
}

interface GateIoTickersRes {
  [pair: string]: GateIoTickerRes;
}

export class gateio<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "gateio",
      baseUrl: "https://data.gateio.la/api2/1",
      opts: args?.opts,
    });
  }

  async getAllTickers(): Promise<ITicker[]> {
    const res = await this.fetch<GateIoTickersRes>(`${this.baseUrl}/tickers`);

    const tickers: ITicker[] = [];
    for (const pair in res) {
      const ticker = res[pair]!;

      tickers.push({
        exchangeId: this.id,
        base: (pair.split("_")[0] as string).toUpperCase(),
        quote: (pair.split("_")[1] as string).toUpperCase(),
        last: Number(ticker.last),
        ask: Number(ticker.lowestAsk),
        bid: Number(ticker.highestBid),
        vol: Number(ticker.quoteVolume),
      });
    }
    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<GateIoTickersRes>(
      `${this.baseUrl}/ticker/${base.toLowerCase()}_${quote.toLowerCase()}`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last),
      ask: Number(res.lowestAsk),
      bid: Number(res.highestBid),
      vol: Number(res.quoteVolume),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch(
      `${this.baseUrl}/orderBook/${base.toLowerCase()}_${quote.toLowerCase()}`,
    );

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
