import omit from "lodash/omit";
import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook, ITicker } from "../utils/DTOs";
import { ConnectorError, ERROR_TYPES } from "../utils/ConnectorError";
import { isNumber } from "lodash";

interface IPagCriptoOTCTickerRes {
  otc_ticker: {
    crypto: string;
    volume: number;
    last: string;
    buy: string;
    sell: string;
  };
  debug: {
    environment: string;
    error: number;
    execution_time: number;
    t: string;
  };
}

export class pagcripto_otc<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "pagcripto_otc",
      baseUrl: "https://api.pagcripto.com.br/v2/otc",
      opts: args?.opts,
    });
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<IPagCriptoOTCTickerRes>(
      `${this.baseUrl}/ticker/${base}`,
    );

    const ticker = omit(res.otc_ticker, ["crypto"]);

    const isValid = Object.values(ticker).every((value) => isNumber());

    if (!isValid) {
      throw new ConnectorError(
        ERROR_TYPES.API_RESPONSE_ERROR,
        "ticker got invalid number",
      );
    }

    return {
      exchangeId: this.id,
      base,
      quote,
      last: Number(ticker.last),
      ask: Number(ticker.sell),
      bid: Number(ticker.buy),
      vol: Number(ticker.volume),
    };
  }

  private amountByCurreny(currency: string): number {
    if (currency === "BTC") return 1001;
    if (currency === "ETH") return 10000;
    if (currency === "LTC") return 5000;
    return 500000;
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    try {
      const ticker = await this.getTicker(base, quote);
      const amount = this.amountByCurreny(base);
      return {
        asks: [{ amount, price: ticker.ask }],
        bids: [{ amount, price: ticker.bid }],
      };
    } catch (error) {
      throw new ConnectorError(
        ERROR_TYPES.API_RESPONSE_ERROR,
        "this method relays to getTicker",
        error,
      );
    }
  }
}
