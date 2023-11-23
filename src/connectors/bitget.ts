import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, IOrderbookOrder, ITicker } from "../utils/DTOs";

interface BitgetBaseRes<T> {
  code: string;
  data: T;
  msg: string;
  requestTime: string;
}

interface BitgetProduct {
  baseCoin: string;
  buyLimitPriceRatio: string;
  makerFeeRate: string;
  maxOrderNum: string;
  maxTradeAmount: string;
  minTradeAmount: string;
  minTradeUSDT: string;
  priceScale: string;
  quantityScale: string;
  quoteCoin: string;
  quotePrecision: string;
  sellLimitPriceRatio: string;
  status: string;
  symbol: string;
  symbolName: string;
  takerFeeRate: string;
}

interface BitgetTicker {
  askSz: string;
  baseVol: string;
  bidSz: string;
  buyOne: string;
  change: string;
  changeUtc: string;
  close: string;
  high24h: string;
  low24h: string;
  openUtc0: string;
  quoteVol: string;
  sellOne: string;
  symbol: string;
  ts: string;
  usdtVol: string;
}

type BitgetOrderbookOrder = [string, string];

interface BitgetOrderbook {
  asks: BitgetOrderbookOrder[];
  bids: BitgetOrderbookOrder[];
  ts: string;
}

export class bitget<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitget",
      baseUrl: "https://api.bitget.com/api",
      opts: args?.opts,
    });
  }

  async getAllTickers(): Promise<ITicker[]> {
    const { data: markets } = await this.fetch<BitgetBaseRes<BitgetProduct[]>>(
      `${this.baseUrl}/spot/v1/public/products`,
    );
    const { data: tickers } = await this.fetch<BitgetBaseRes<BitgetTicker[]>>(
      `${this.baseUrl}/spot/v1/market/tickers`,
    );

    const res: ITicker[] = [];

    for (const market of markets) {
      const ticker = tickers.find(
        (tickerItem) => tickerItem.symbol === market.symbolName,
      );

      if (ticker) {
        res.push({
          exchangeId: this.id,
          base: market.baseCoin,
          quote: market.quoteCoin,
          ask: Number(ticker.sellOne),
          bid: Number(ticker.buyOne),
          last: Number(ticker.close),
          vol: Number(ticker.baseVol),
        });
      }
    }

    return res;
  }

  private parseOrder([price, amount]: BitgetOrderbookOrder): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<BitgetBaseRes<BitgetOrderbook>>(
      `${this.baseUrl}/v2/spot/market/orderbook?symbol=${base}${quote}&type=step0&limit=100`,
    );

    return {
      asks: res.data.asks.map(this.parseOrder),
      bids: res.data.bids.map(this.parseOrder),
    };
  }
}
