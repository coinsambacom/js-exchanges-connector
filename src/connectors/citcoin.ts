import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";

export class citcoin<T> extends Exchange<T> implements ExchangeBase {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "citcoin",
      baseUrl: "https://api.citcoin.com.br/v1",
      opts: args?.opts,
      limiter: args?.limiter,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTicker(base: string, quote: string) {
    const res = await this.fetch(
      `${this.baseUrl}/${base.toLowerCase()}/ticker`,
    );

    return {
      last: res.close,
      ask: res.close,
      bid: res.close,
      vol: res.vol,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string) {
    const res = await this.fetch(
      `${this.baseUrl}/${base.toLowerCase()}/orderbook`,
    );

    return {
      asks: res.asks.map((o: { btc_price: string; btc: string }) => ({
        price: Number(o.btc_price),
        amount: Number(o.btc),
      })),
      bids: res.bids.map((o: { btc_price: string; btc: string }) => ({
        price: Number(o.btc_price),
        amount: Number(o.btc),
      })),
    };
  }
}
