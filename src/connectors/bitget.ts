import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange.js";
import { IOrderbook, IOrderbookOrder, ITicker } from "../utils/DTOs.js";

interface BitgetBaseRes<T> {
  code: string;
  data: T;
  msg: string;
  requestTime: string;
}

interface BitgetProduct {
  symbol: string;
  baseCoin: string;
  quoteCoin: string;
  minTradeAmount: string;
  maxTradeAmount: string;
  takerFeeRate: string;
  makerFeeRate: string;
  pricePrecision: string;
  quantityPrecision: string;
  quotePrecision: string;
  minTradeUSDT: string;
  status: string;
  buyLimitPriceRatio: string;
  sellLimitPriceRatio: string;
  areaSymbol: string;
  orderQuantity: string;
  openTime: string;
  offTime: string;
}

interface BitgetTicker {
  symbol: string;
  high24h: string;
  open: string;
  low24h: string;
  lastPr: string;
  quoteVolume: string;
  baseVolume: string;
  usdtVolume: string;
  bidPr: string;
  askPr: string;
  bidSz: string;
  askSz: string;
  openUtc: string;
  ts: string;
  changeUtc24h: string;
  change24h: string;
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
      baseUrl: "https://api.bitget.com",
      opts: args?.opts,
    });
  }

  async getAllTickers(): Promise<ITicker[]> {
    const { data: markets } = await this.fetch<BitgetBaseRes<BitgetProduct[]>>(
      `${this.baseUrl}/api/v2/spot/public/symbols`,
    );
    const { data: tickers } = await this.fetch<BitgetBaseRes<BitgetTicker[]>>(
      `${this.baseUrl}/api/v2/spot/market/tickers`,
    );

    const res: ITicker[] = [];

    for (const market of markets) {
      const ticker = tickers.find(
        (tickerItem) => tickerItem.symbol === market.symbol,
      );

      if (ticker) {
        res.push({
          exchangeId: this.id,
          base: market.baseCoin,
          quote: market.quoteCoin,
          ask: Number(ticker.askPr),
          bid: Number(ticker.bidPr),
          last: Number(ticker.lastPr),
          vol: Number(ticker.baseVolume),
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
      `${this.baseUrl}/api/v2/spot/market/orderbook?symbol=${base}${quote}&type=step0&limit=100`,
    );

    return {
      asks: res.data.asks.map(this.parseOrder),
      bids: res.data.bids.map(this.parseOrder),
    };
  }
}
