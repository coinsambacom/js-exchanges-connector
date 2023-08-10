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
  GetHistoryArguments,
  History,
} from "../utils/DTOs";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";
import { FetcherRequisitionMethods } from "../FetcherHandler";

interface PagCriptoBaseRes {
  code: string;
}

interface PagCriptoTicker {
  high: string;
  low: string;
  volume: string;
  volume_otc: number;
  trades_qty: string;
  last: string;
  sell: string;
  buy: string;
}

interface PagCriptoOrderbookOrder {
  nick: string;
  amount: string;
  price: string;
}

interface PagCriptoTickersRes extends PagCriptoBaseRes {
  data: [{ [pair: string]: PagCriptoTicker }];
}

interface PagCriptoTickerRes extends PagCriptoBaseRes {
  data: PagCriptoTicker;
}

interface PagCriptoOrderbookRes extends PagCriptoBaseRes {
  data: {
    pair: string;
    bids: PagCriptoOrderbookOrder[] | any;
    asks: PagCriptoOrderbookOrder[] | any;
  };
}

interface PagCriptoBalanceRes {
  balance: {
    [symbol: string]: {
      current: string;
      orders: string;
      withdraw_fee: number;
      trade_fee: number;
    };
  };
}

interface PagCriptoPlaceOrderRes {
  [symbol: string]: {
    id: string;
    quantity: number;
    price: number;
    order: string;
    status: string;
  };
}

interface PagCriptoGetOrderRes {
  pair: string;
  id: string;
  status: number;
  cotacao: string;
  preco_total: string;
  qnt_executada: string;
  qnt_total: string;
  tipo: number;
  create_date: string;
  update_date: string;
}

interface PagCriptoPagination {
  current_page: number;
  total_pages: number;
  per_page: number;
  total_records: number;
}

interface PagCriptoHistoryItem {
  pair: string;
  quantity: string;
  price: string;
  total: string;
  order: "venda" | "compra"; // assuming order can only be "venda" or "compra"
  tax: string;
  date: string;
}

interface PagCriptoGetHistoryRes {
  pagination: PagCriptoPagination;
  history: PagCriptoHistoryItem[];
}

export class pagcripto<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "pagcripto",
      baseUrl: "https://api.pagcripto.com.br/v2",
      ...args,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const {
      data: [res],
    } = await this.fetch<PagCriptoTickersRes>(this.baseUrl + "/public/tickers");

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
    const { data: res } = await this.fetch<PagCriptoTickerRes>(
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
  }: PagCriptoOrderbookOrder): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<PagCriptoOrderbookRes>(
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
    const { balance: res } = await this.fetch<PagCriptoBalanceRes>(
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
    const res = await this.fetch<PagCriptoPlaceOrderRes>(
      this.signer({
        url: `${this.baseUrl}/trade/create/${base}${quote}`,
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
        url: `${this.baseUrl}/trade/cancel/${base}${quote}`,
        method: FetcherRequisitionMethods.POST,
        data: {
          idOrder: id,
        },
      }),
    );

    return true;
  }

  async getOrder({ id, base, quote }: GetOrderArguments): Promise<IOrder> {
    const res = await this.fetch<PagCriptoGetOrderRes>(
      this.signer({
        url: `${this.baseUrl}/trade/status/${base}${quote}`,
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
      price: Number(res.cotacao),
    };
  }

  async getHistory({
    page,
    base,
    quote,
  }: GetHistoryArguments): Promise<History> {
    const res = await this.fetch<PagCriptoGetHistoryRes>(
      this.signer({
        url: `${this.baseUrl}/trade/history/${base}${quote}`,
        method: FetcherRequisitionMethods.GET,
        data: {
          page,
        },
      }),
    );

    return {
      page,
      pages: res.pagination.total_pages,
      perPage: res.pagination.per_page,
      items: res.history.map((h) => ({
        base,
        quote,
        status: null,
        side: h.order == "compra" ? OrderSide.BUY : OrderSide.SELL,
        price: Number(h.price),
        amount: Number(h.quantity),
        executed: null,
        date: new Date(h.date),
      })),
    };
  }

  private signer(args: SignerArguments): SignerReturn {
    this.ensureApiCredentials(true);
    const headers = { "X-Authentication": this.key! };

    return { ...args, headers };
  }
}
