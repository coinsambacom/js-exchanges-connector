import {
  Exchange,
  IExchangeImplementationConstructorArgs,
  SignerArguments,
  SignerReturn,
} from "../interfaces/exchange";
import {
  CancelOrderArguments,
  GetOrderArguments,
  IBalance,
  IOrder,
  IOrderbook,
  IOrderbookOrder,
  ITicker,
  OrderStatus,
  OrderSide,
  PlaceOrderArguments,
} from "../types/common";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";
import { FetcherRequisitionMethods } from "../utils/Fetcher";

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
  data: [{ [pair: string]: IPagCriptoTicker }];
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

interface IPagcriptoBalanceRes {
  balance: {
    [symbol: string]: {
      current: string;
      orders: string;
      withdraw_fee: number;
      trade_fee: number;
    };
  };
}

interface IPagcriptoPlaceOrderRes {
  [symbol: string]: {
    id: string;
    quantity: number;
    price: number;
    order: string;
    status: string;
  };
}

interface IPagcriptoGetOrderRes {
  pair: string;
  id: string;
  status: number;
  preco_total: string;
  qnt_executada: string;
  qnt_total: string;
  tipo: number;
  create_date: string;
  update_date: string;
}

export class pagcripto<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "pagcripto",
      baseUrl: "https://api.pagcripto.com.br/v2",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const {
      data: [res],
    } = await this.fetch<IPagcriptoTickersRes>(
      this.baseUrl + "/public/tickers",
    );

    const tickers: ITicker[] = [];

    for (const pair in res) {
      if (pair.endsWith(quote)) {
        const ticker = res[pair];
        if (ticker) {
          tickers.push({
            exchangeId: this.id,
            base: pair.replace(quote, ""),
            quote,
            last: Number(ticker.last),
            ask: Number(ticker.sell),
            bid: Number(ticker.buy),
            vol: Number(ticker.volume),
          });
        }
      }
    }

    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const { data: res } = await this.fetch<IPagcriptoTickerRes>(
      this.baseUrl + "/public/ticker/" + base + quote,
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
      this.baseUrl + "/public/orders/" + base + quote,
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

  // Trade methods

  async getBalance(): Promise<IBalance> {
    const { balance: res } = await this.fetch<IPagcriptoBalanceRes>(
      this.signer({
        url: `${this.baseUrl}/trade/balance`,
        method: FetcherRequisitionMethods.GET,
      }),
    );

    const balance: IBalance = {};

    for (const symbol in res) {
      balance[symbol.toUpperCase()] = Number(res[symbol]!.current);
    }

    return balance;
  }

  async placeOrder({
    price,
    amount,
    side,
    base,
    quote,
  }: PlaceOrderArguments): Promise<string> {
    const res = await this.fetch<IPagcriptoPlaceOrderRes>(
      this.signer({
        url: `${this.baseUrl}/v2/trade/create/${base}${quote}`,
        method: FetcherRequisitionMethods.POST,
        data: {
          quantity: side == OrderSide.BUY ? price * amount : amount,
          price,
          order: side,
        },
      }),
    );

    return res[`${base}${quote}`]!.id;
  }

  async cancelOrder({
    id,
    base,
    quote,
  }: CancelOrderArguments): Promise<boolean> {
    await this.fetch(
      this.signer({
        url: `${this.baseUrl}/v2/trade/cancel/${base}${quote}`,
        method: FetcherRequisitionMethods.POST,
        data: {
          idOrder: id,
        },
      }),
    );

    return true;
  }

  async getOrder({ id, base, quote }: GetOrderArguments): Promise<IOrder> {
    const res = await this.fetch<IPagcriptoGetOrderRes>(
      this.signer({
        url: `${this.baseUrl}/v2/trade/status/${base}${quote}`,
        method: FetcherRequisitionMethods.POST,
        data: {
          idOrder: id,
        },
      }),
    );

    let status = OrderStatus.EMPTY;

    switch (res.status) {
      case 0:
        status = OrderStatus.EMPTY;
        break;

      case 1:
        status = OrderStatus.PARTIAL;
        break;

      case 2:
        status = OrderStatus.FILLED;
        break;

      case 3:
        status = OrderStatus.CANCELED;
        break;

      default:
        status = OrderStatus.EMPTY;
        break;
    }

    return {
      status,
      side: res.tipo == 1 ? OrderSide.BUY : OrderSide.SELL,
      amount: Number(res.qnt_total),
      executed: Number(res.qnt_executada),
      price: Number(res.preco_total) / Number(res.qnt_total),
    };
  }

  private signer(args: SignerArguments): SignerReturn {
    const headers = { "X-Authentication": this.apiKey! };

    return { ...args, headers };
  }
}
