import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";
import { IOrderbook, IOrderbookOrder, ITicker } from "../utils/DTOs";

interface OkxResponse<T> {
  code: string;
  msg: string;
  data: T;
}

interface OkxTicker {
  instType: string;
  instId: `${string}-${string}`;
  last: string;
  lastSz: string;
  askPx: string;
  askSz: string;
  bidPx: string;
  bidSz: string;
  open24h: string;
  high24h: string;
  low24h: string;
  volCcy24h: string;
  vol24h: string;
  ts: string;
  sodUtc0: string;
  sodUtc8: string;
}

interface OkxOrderBook {
  asks: OkxOrderBookEntry[];
  bids: OkxOrderBookEntry[];
  ts: string;
}

type OkxOrderBookEntry = [string, string, "0", string];

export class okx<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "okx",
      baseUrl: "https://www.okx.com/api/v5",
      opts: args?.opts,
    });
  }

  private parseTicker(ticker: OkxTicker): ITicker {
    const [base, quote] = ticker.instId.split("-") as [string, string];

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(ticker.last),
      ask: Number(ticker.askPx),
      bid: Number(ticker.bidPx),
      vol: Number(ticker.vol24h),
    };
  }

  private checkResponse(res: OkxResponse<any>) {
    if (res.code !== "0") {
      throw new ConnectorError(
        ERROR_TYPES.API_RESPONSE_ERROR,
        res.msg || "No response returned",
      );
    }
  }

  async getAllTickers(): Promise<ITicker[]> {
    const res = await this.fetch<OkxResponse<OkxTicker[]>>(
      `${this.baseUrl}/market/tickers?instType=SPOT`,
    );

    this.checkResponse(res);

    return res.data.map((t) => this.parseTicker(t));
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<OkxResponse<[OkxTicker]>>(
      `${this.baseUrl}/market/ticker?instType=SPOT&instId=${base}-${quote}`,
    );

    this.checkResponse(res);

    return this.parseTicker(res.data[0] as OkxTicker);
  }

  private parseOrderbookOrder([
    price,
    amount,
  ]: OkxOrderBookEntry): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<OkxResponse<[OkxOrderBook]>>(
      `${this.baseUrl}/market/books?instType=SPOT&instId=${base}-${quote}&sz=100`,
    );

    this.checkResponse(res);

    return {
      asks: res.data[0].asks.map((order) => this.parseOrderbookOrder(order)),
      bids: res.data[0].bids.map((order) => this.parseOrderbookOrder(order)),
    };
  }
}
