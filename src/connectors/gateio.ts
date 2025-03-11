import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";
import { FetcherRequisitionMethods, IOrderbook, ITicker } from "../utils/DTOs";

interface GateIoTickerRes {
  currency_pair: string;
  last: string;
  lowest_ask: string;
  highest_bid: string;
  change_percentage: string;
  change_utc0: string;
  change_utc8: string;
  base_volume: string;
  quote_volume: string;
  high_24h: string;
  low_24h: string;
  etf_net_value: string;
  etf_pre_net_value: string;
  etf_pre_timestamp: number;
  etf_leverage: string;
}

type GateIoTickersRes = GateIoTickerRes[];

type GateIoOrder = [string, string];

type GateIoOrderbookRes = {
  id: number;
  current: number;
  update: number;
  asks: GateIoOrder[];
  bids: GateIoOrder[];
};

export class gateio<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "gateio",
      baseUrl: "https://api.gateio.ws/api/v4",
      opts: args?.opts,
    });
  }

  async getAllTickers(): Promise<ITicker[]> {
    const res = await this.fetch<GateIoTickersRes>(
      `${this.baseUrl}/spot/tickers`,
    );

    const tickers: ITicker[] = res.map((ticker) => {
      const [base, quote] = ticker.currency_pair.split("_");
      return {
        exchangeId: this.id,
        base: base!,
        quote: quote!,
        last: Number(ticker.last),
        ask: Number(ticker.lowest_ask),
        bid: Number(ticker.highest_bid),
        vol: Number(ticker.quote_volume),
      };
    });

    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<GateIoTickersRes>({
      url: `${this.baseUrl}/spot/tickers`,
      data: {
        currency_pair: `${base.toLowerCase()}_${quote.toLowerCase()}`,
      },
      method: FetcherRequisitionMethods.GET,
    });

    const ticker = res[0];

    if (!ticker) {
      throw new ConnectorError(ERROR_TYPES.LIB_PARSE_ERROR, "Ticker not found");
    }

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(ticker.last),
      ask: Number(ticker.lowest_ask),
      bid: Number(ticker.highest_bid),
      vol: Number(ticker.quote_volume),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<GateIoOrderbookRes>({
      url: `${this.baseUrl}/spot/order_book`,
      data: {
        currency_pair: `${base.toLowerCase()}_${quote.toLowerCase()}`,
      },
      method: FetcherRequisitionMethods.GET,
    });

    return {
      asks: res.asks.map((order: any[]) => ({
        price: Number(order[0]),
        amount: Number(order[1]),
      })),
      bids: res.bids.map((order: any[]) => ({
        price: Number(order[0]),
        amount: Number(order[1]),
      })),
    };
  }
}
