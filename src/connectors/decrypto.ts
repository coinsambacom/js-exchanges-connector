import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import { IOrderbook } from "../types/common";

interface IDecryptoOrderbookOrder {
  precio: number;
  cantidad: number;
}
interface IDecryptoOrderbookRes {
  asks: IDecryptoOrderbookOrder[];
  bids: IDecryptoOrderbookOrder[];
}

export class decrypto<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "decrypto",
      baseUrl: "https://api.decrypto.la:8081/1.0/frontend",
      opts: args?.opts,
    });
  }

  private parseOrder({ precio, cantidad }: IDecryptoOrderbookOrder) {
    return {
      price: precio,
      amount: cantidad,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<IDecryptoOrderbookRes>(
      `${this.baseUrl}/order-book/${base.toLowerCase()}/vNotk8EefltHVXTM7bat`,
    );

    return {
      asks: res.asks.map(this.parseOrder),
      bids: res.bids.map(this.parseOrder),
    };
  }
}
