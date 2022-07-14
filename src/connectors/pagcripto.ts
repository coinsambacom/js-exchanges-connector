import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../types/common";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";

interface IPagCriptoBaseRes {
  code: string;
}

interface IPagCriptoTicker {
  high: string;
  low: string;
  volume: string;
  volume_otc: number;
  trades_qty: string;
  last: string;
  sell: string;
  buy: string;
}

interface IPagCriptoOrderbookOrder {
  nick: string;
  amount: string;
  price: string;
}

interface IPagcriptoTickersRes extends IPagCriptoBaseRes {
  data: IPagCriptoTicker[];
}

interface IPagcriptoTickerRes extends IPagCriptoBaseRes {
  data: IPagCriptoTicker;
}

interface IPagcriptoOrderbookRes extends IPagCriptoBaseRes {
  data: {
    pair: string;
    bids: IPagCriptoOrderbookOrder[] | any;
    asks: IPagCriptoOrderbookOrder[] | any;
  };
}

export class pagcripto<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "pagcripto",
      baseUrl: "https://api.pagcripto.com.br/v2/public",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  // async getAllTickers(quote: string): Promise<ITicker> {
  //   const { data: res } = await this.fetch<IPagcriptoTickersRes>(
  //     this.baseUrl + "/tickers",
  //   );

  //   return res.map((t) => ({
  //     exchangeId: this.id,
  //     base: t.symbol.split("-")[0] as string,
  //     quote: t.symbol.split("-")[1] as string,
  //     last: Number(t.last),
  //     ask: Number(t.sell),
  //     bid: Number(t.buy),
  //     vol: Number(t.vol),
  //   }));
  // }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { data: res } = await this.fetch<IPagcriptoTickerRes>(
      this.baseUrl + "/ticker/" + base + quote,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(res.last),
      ask: Number(res.sell),
      bid: Number(res.buy),
      vol: Number(res.volume),
    };
  }

  private parseOrder({
    price,
    amount,
  }: IPagCriptoOrderbookOrder): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<IPagcriptoOrderbookRes>(
      this.baseUrl + "/orders/" + base + quote,
    );
    if (!res || !res.data) {
      throw new ConnectorError(ERROR_TYPES.API_RESPONSE_ERROR);
    }

    const book = res.data;

    return {
      asks: Array.isArray(book?.asks) ? book.asks.map(this.parseOrder) : [],
      bids: Array.isArray(book?.bids) ? book.bids.map(this.parseOrder) : [],
    };
  }
}
