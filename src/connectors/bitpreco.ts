import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import {
  IBalance,
  IOrderbook,
  ITicker,
  SignerArguments,
  SignerReturn,
} from "../types/common";
import { FetcherRequisitionMethods } from "../utils/FetcherHandler";

export class bitpreco<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "bitpreco",
      baseUrl: "https://api.bitpreco.com",
      opts: args?.opts,
    });
  }

  async getAllTickersByQuote(quote: string): Promise<ITicker[]> {
    const res = await this.fetch(
      `${this.baseUrl}/all-${quote.toLowerCase()}/ticker`,
    );

    const tickers: ITicker[] = [];
    for (const pair in res) {
      if (pair !== "success") {
        const ticker = res[pair];
        tickers.push({
          exchangeId: this.id,
          base: ticker.market.split("-")[0],
          quote,
          last: ticker.last,
          ask: ticker.sell,
          bid: ticker.buy,
          vol: ticker.vol,
        });
      }
    }
    return tickers;
  }

  async getBalance(): Promise<IBalance> {
    const res = await this.fetch<Record<string, any>>(
      this.signer({
        url: `${this.baseUrl}/v1/trading/balance`,
        method: FetcherRequisitionMethods.POST,
      }),
    );

    const balance: IBalance = {};

    for (const symbol in res) {
      if (symbol !== "success" && !symbol.includes("_locked")) {
        balance[symbol] = Number(res[symbol]);
      }
    }

    return balance;
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch(
      `${this.baseUrl}/${base.toLowerCase()}-${quote.toLowerCase()}/ticker`,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.last,
      ask: res.sell,
      bid: res.buy,
      vol: res.vol,
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch(
      `${this.baseUrl}/${base.toLowerCase()}-${quote.toLowerCase()}/orderbook`,
    );

    return {
      asks: res.asks.map(({ price, amount }) => ({
        price,
        amount,
      })),
      bids: res.bids.map(({ price, amount }) => ({
        price,
        amount,
      })),
    };
  }

  private signer(args: SignerArguments): SignerReturn {
    const headers = { auth_token: this.key! + this.secret! };

    return { ...args, headers };
  }
}
