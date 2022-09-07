import { IOrderbook, IOrderbookOrder, ITicker } from "../types/common";
import { Exchange, IExchangeBaseConstructorArgs } from "./exchange";
import WebSocket from "ws";
import crypto from "crypto";

interface IAlphapointConstructorArgs<T>
  extends IExchangeBaseConstructorArgs<T> {
  /**
   * alphapoint websocket url
   */
  websocketUrl: string;
}

type IAlphapointOrderbookRes = number[][];

interface IMessageFrame {
  m: number;
  i: number;
  n: string;
  o: string;
}

type IRawMessageFrame = Omit<IMessageFrame, "i" | "o"> & { o: any };

export class alphapoint<T> extends Exchange<T> {
  public baseUrl: any;
  public websocketUrl?: string;

  private ws?: WebSocket;
  public wsReady?: boolean;
  private wsPingInterval?: NodeJS.Timer;
  private resolveMap?: Map<number, (value: unknown) => void>;

  constructor(args: IAlphapointConstructorArgs<T>) {
    super({ ...args });
  }

  private async ensureWebsocket() {
    if (!this.ws) {
      await this.initWebsocket();
    }

    while (this.ws?.readyState === this.ws?.CONNECTING) {
      // wait connection
    }
  }

  private initWebsocket(): Promise<boolean> {
    return new Promise((resolve) => {
      this.ws = new WebSocket(this.websocketUrl!);
      this.ws.on("message", (data) => {
        //data contém o payload de resposta
        const parsedData = JSON.parse(data.toString()) as IMessageFrame;

        if (parsedData.n === "Ping") {
          this.resolveMap!.delete(parsedData.i);
        }

        console.log(parsedData);
      });
      this.resolveMap = new Map();
      this.ws.on("open", () => {
        this.wsPingInterval = setInterval(() => {
          this.sendFrameToWs({
            m: 0,
            n: "Ping",
            o: {},
          });
        }, 15000);

        this.wsReady = true;
        resolve(this.wsReady);
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async subscribeBook(base: string, _quote: string) {
    await this.ensureWebsocket();
    this.sendFrameToWs({
      m: 2,
      n: "SubscribeLevel2",
      o: { OMSId: 1, InstrumentId: this.normalizeAsset(base), Depth: 50 },
    });
  }

  private buildMessageFrame(rawFrame: IRawMessageFrame): IMessageFrame {
    return {
      m: rawFrame.m,
      i: crypto.randomInt(2, 999999),
      n: rawFrame.n,
      o: JSON.stringify(rawFrame.o),
    };
  }

  private async sendFrameToWs(rawFrame: IRawMessageFrame) {
    const promise = new Promise((resolve, reject) => {
      const frame = this.buildMessageFrame(rawFrame);

      this.resolveMap!.set(frame.i, resolve);

      const rejectTimer = setTimeout(() => {
        if (rawFrame.m === 0 && this.resolveMap!.delete(frame.i)) {
          reject("Websocket reply timeout");
        }
      }, 5000);

      this.ws?.send(JSON.stringify(frame), (err) => {
        if (err) {
          this.resolveMap!.delete(frame.i);
          clearTimeout(rejectTimer);
          reject(err);
        }
      });
    });

    return promise;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  normalizeAsset(asset: string | number): string | number {
    throw new Error("this method must be overrided");
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    base = this.normalizeAsset(base) as string;

    const res = await this.fetch(
      `${this.baseUrl}/GetLevel1?OMSId=1&InstrumentId=${base} `,
    );

    return {
      exchangeId: this.id,
      base,
      quote,
      last: res.LastTradedPx,
      ask: res.BestOffer,
      bid: res.BestBid,
      vol: res.Volume,
    };
  }

  private parseOrder(order: number[]): IOrderbookOrder {
    return {
      price: order[6] as number,
      amount: order[8] as number,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBook(base: string, quote: string): Promise<IOrderbook> {
    base = this.normalizeAsset(base) as string;

    const res = await this.fetch<IAlphapointOrderbookRes>(
      `${this.baseUrl}/GetL2Snapshot?OMSId=1&InstrumentId=${base}&Depth=50`,
    );

    const normalizedBook = {
      asks: [] as IOrderbookOrder[],
      bids: [] as IOrderbookOrder[],
    };

    res.forEach((order) => {
      if (order[9] === 1) {
        normalizedBook.asks.push(this.parseOrder(order));
      } else {
        normalizedBook.bids.push(this.parseOrder(order));
      }
    });

    return normalizedBook;
  }
}
