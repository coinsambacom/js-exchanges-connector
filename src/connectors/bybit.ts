import crypto from "crypto";
import {
  IOrderbook,
  ITicker,
  FetcherRequisitionMethods,
} from "../utils/DTOs.js";
import {
  Exchange,
  IExchangeImplementationConstructorArgs,
  SignerArguments,
  SignerReturn,
} from "../interfaces/exchange.js";
import { ConnectorError } from "../utils/ConnectorError.js";
import { ConnectorErrors } from "../index.js";
import {
  CancelOrderArguments,
  GetOrderArguments,
  IBalance,
  IOrder,
  OrderSide,
  OrderStatus,
  PlaceOrderArguments,
} from "../utils/DTOs.js";

interface BaseRes<T> {
  retCode: number;
  retMsg: string;
  result: T;
  time: number;
}

interface TickersRes {
  category: "spot";
  list: TickerRes[];
}

interface TickerRes {
  symbol: string;
  bid1Price: string;
  bid1Size: string;
  ask1Price: string;
  ask1Size: string;
  lastPrice: string;
  prevPrice24h: string;
  price24hPcnt: string;
  highPrice24h: string;
  lowPrice24h: string;
  turnover24h: string;
  volume24h: string;
  usdIndexPrice?: string;
}

type Order = [string, string]; // [price, amount]

interface OrderbookRes {
  s: string;
  a: Order[];
  b: Order[];
  ts: number;
  u: number;
  seq: number;
  cts: number;
}

interface BalanceRes {
  list: {
    accountType: string;
    totalEquity: string;
    totalWalletBalance: string;
    totalAvailableBalance: string;
    coin: {
      coin: string;
      equity: string;
      usdValue: string;
      walletBalance: string;
      availableToWithdraw: string;
      borrowAmount: string;
      unrealisedPnl: string;
      cumRealisedPnl: string;
    }[];
  }[];
}

interface PlaceOrderRes {
  orderId: string;
  orderLinkId: string;
}

interface OrderRes {
  orderId: string;
  orderLinkId: string;
  symbol: string;
  side: string;
  orderType: string;
  price: string;
  qty: string;
  cumExecQty: string;
  orderStatus: string;
  createdTime: string;
  updatedTime: string;
}

export class bybit<T> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bybit",
      baseUrl: "https://api.bybit.com",
      opts: args?.opts,
      key: args?.key,
      secret: args?.secret,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const res = await this.fetch<BaseRes<TickersRes>>(
      `${this.baseUrl}/v5/market/tickers?category=spot`,
    );

    const tickers: ITicker[] = this.parseTickers(res, quote);

    return tickers;
  }

  private parseTickers(res: BaseRes<TickersRes>, quote: string) {
    const tickers: ITicker[] = [];

    for (const ticker of res.result.list) {
      if (ticker.symbol.endsWith(quote)) {
        tickers.push({
          exchangeId: this.id,
          base: ticker.symbol.replace(quote, ""),
          quote,
          last: Number(ticker.lastPrice),
          ask: Number(ticker.ask1Price),
          bid: Number(ticker.bid1Price),
          vol: Number(ticker.volume24h),
        });
      }
    }
    return tickers;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<BaseRes<TickersRes>>(
      `${this.baseUrl}/v5/market/tickers?category=spot&symbol=${base}${quote}`,
    );

    const ticker = this.parseTickers(res, quote);

    if (ticker.length === 0) {
      throw new ConnectorError(
        ConnectorErrors.ERROR_TYPES.API_RESPONSE_ERROR,
        `Ticker not found for ${base}${quote}`,
      );
    }

    return ticker[0]!;
  }

  private parseOrder(orders: Order[]) {
    return orders.map(([price, amount]: Order) => ({
      price: Number(price),
      amount: Number(amount),
    }));
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<BaseRes<OrderbookRes>>(
      `${this.baseUrl}/v5/market/orderbook?category=spot&symbol=${base}${quote}&limit=200`,
    );

    return {
      asks: this.parseOrder(res.result.a),
      bids: this.parseOrder(res.result.b),
    };
  }

  private buildQueryString(params: Record<string, any>): string {
    if (!params) return "";

    return Object.keys(params)
      .sort()
      .map((key) => {
        const value = params[key];
        return `${key}=${encodeURIComponent(value)}`;
      })
      .join("&");
  }

  private signer(args: SignerArguments): SignerReturn {
    this.ensureApiCredentials(true);

    const timestamp = Date.now().toString();
    const recvWindow = "5000"; // Default receive window (milliseconds)

    // Extract and prepare query parameters
    const url = new URL(args.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const queryString = this.buildQueryString(queryParams);

    // Extract and prepare request body parameters if it exists
    let bodyString = "";
    if (args.data && typeof args.data === "string") {
      bodyString = args.data;
    } else if (args.data) {
      bodyString = JSON.stringify(args.data);
    }

    // Create signature string based on method
    let signatureString = timestamp + this.key + recvWindow;

    if (args.method === FetcherRequisitionMethods.GET) {
      signatureString += queryString;
    } else {
      signatureString += bodyString;
    }

    // Generate HMAC SHA256 signature
    const signature = this.createSignature(signatureString, this.secret!);

    // Set the headers
    const headers = {
      "X-BAPI-API-KEY": this.key!,
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-SIGN": signature,
      "X-BAPI-RECV-WINDOW": recvWindow,
    };

    if (args.method !== FetcherRequisitionMethods.GET && args.data) {
      headers["Content-Type"] = "application/json";
    }

    return { ...args, headers };
  }

  // New methods that use the signer function
  async getBalance(): Promise<IBalance> {
    this.ensureApiCredentials(true);

    const res = await this.fetch<BaseRes<BalanceRes>>(
      this.signer({
        url: `${this.baseUrl}/v5/account/wallet-balance?accountType=UNIFIED`,
        method: FetcherRequisitionMethods.GET,
      }),
    );

    const balance: IBalance = {};

    if (res?.result?.list?.[0]?.coin) {
      // Access the coin array from the first account in the list
      const coinList = res.result.list[0].coin;

      for (const item of coinList) {
        // Use walletBalance as the primary balance value
        // Note: walletBalance includes spot borrow amount according to docs
        balance[item.coin] = Number(item.walletBalance);
      }
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
    this.ensureApiCredentials(true);

    const symbol = `${base}${quote}`;

    // Always use LIMIT order type as specified in requirements
    const orderData = {
      category: "spot",
      symbol,
      side: side === OrderSide.BUY ? "Buy" : "Sell",
      orderType: "Limit", // Explicit Limit order type
      qty: amount.toString(),
      price: price.toString(),
      timeInForce: "GTC", // Good Till Cancel - default strategy
    };

    const res = await this.fetch<BaseRes<PlaceOrderRes>>(
      this.signer({
        url: `${this.baseUrl}/v5/order/create`,
        method: FetcherRequisitionMethods.POST,
        data: orderData,
      }),
    );

    if (!res.result || !res.result.orderId) {
      throw new ConnectorError(
        ConnectorErrors.ERROR_TYPES.API_RESPONSE_ERROR,
        `Failed to place order: ${res.retMsg || "Unknown error"}`,
      );
    }

    return res.result.orderId;
  }

  async cancelOrder({
    id,
    base,
    quote,
  }: CancelOrderArguments): Promise<boolean> {
    this.ensureApiCredentials(true);

    const symbol = `${base}${quote}`;

    const cancelData = {
      category: "spot",
      symbol,
      orderId: id,
    };

    const res = await this.fetch<BaseRes<any>>(
      this.signer({
        url: `${this.baseUrl}/v5/order/cancel`,
        method: FetcherRequisitionMethods.POST,
        data: cancelData,
      }),
    );

    if (res.retCode !== 0) {
      throw new ConnectorError(
        ConnectorErrors.ERROR_TYPES.API_RESPONSE_ERROR,
        `Failed to cancel order: ${res.retMsg}`,
      );
    }

    return true;
  }

  async getOrder({ id, base, quote }: GetOrderArguments): Promise<IOrder> {
    this.ensureApiCredentials(true);

    const symbol = `${base}${quote}`;

    // Try to get order from active orders first
    let res = await this.fetch<BaseRes<{ list: OrderRes[] }>>(
      this.signer({
        url: `${this.baseUrl}/v5/order/realtime?category=spot&symbol=${symbol}&orderId=${id}`,
        method: FetcherRequisitionMethods.GET,
      }),
    );

    // If not found in active orders, try history
    if (!res.result || !res.result.list || res.result.list.length === 0) {
      res = await this.fetch<BaseRes<{ list: OrderRes[] }>>(
        this.signer({
          url: `${this.baseUrl}/v5/order/history?category=spot&symbol=${symbol}&orderId=${id}`,
          method: FetcherRequisitionMethods.GET,
        }),
      );
    }

    if (!res.result || !res.result.list || res.result.list.length === 0) {
      throw new ConnectorError(
        ConnectorErrors.ERROR_TYPES.API_RESPONSE_ERROR,
        "Order not found",
      );
    }

    const order = res.result.list[0];
    if (!order) {
      throw new Error("Order not found");
    }

    let status: OrderStatus;
    switch (order.orderStatus.toUpperCase()) {
      case "FILLED":
        status = OrderStatus.FILLED;
        break;
      case "PARTIALLY_FILLED":
        status = OrderStatus.PARTIAL;
        break;
      case "CANCELLED":
      case "REJECTED":
      case "DEACTIVATED":
        status = OrderStatus.CANCELED;
        break;
      case "NEW":
      case "ACTIVE":
      default:
        status = OrderStatus.EMPTY;
        break;
    }

    return {
      status,
      side: order.side.toUpperCase() === "BUY" ? OrderSide.BUY : OrderSide.SELL,
      amount: Number(order.qty),
      executed: Number(order.cumExecQty),
      price: Number(order.price),
    };
  }

  private createSignature(parameters: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(parameters).digest("hex");
  }
}
