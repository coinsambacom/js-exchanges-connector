import { IOrderbook, IOrderbookOrder, ITicker } from "../utils/DTOs";
import { Exchange, IExchangeBaseConstructorArgs } from "./exchange";

function alternativeRandomInt(min: number, max: number) {
  const timestamp = Date.now();
  const randomFraction = Math.random();
  const scaledRandom = min + Math.floor((max - min + 1) * randomFraction);
  const finalRandom = (scaledRandom + timestamp) % (max - min + 1);
  return finalRandom;
}

const WEBSOCKET_TIMEOUT_MS = 5000;

interface IAlphapointConstructorArgs<T>
  extends IExchangeBaseConstructorArgs<T> {
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

type SubscribeLevel2 = [
  number, // MDUpdateId
  number, // Number of Accounts
  number, // ActionDateTime in Posix format X 1000
  number, // ActionType 0 (New), 1 (Update), 2(Delete)
  number, // LastTradePrice
  number, // Number of Orders
  number, // Price
  number, // ProductPairCode
  number, // Quantity
  number, // Side 0 bid, 1 ask
];

enum ALPHAPOINT_METHOD {
  REQUEST = 0,
  REPLY = 1,
  SUBSCRIBE = 2,
  EVENT = 3,
  UNSUBSCRIBE_FROM_EVENT = 4,
}

export class alphapoint<T> extends Exchange<T> {
  public websocketUrl?: string;
  private ws?: WebSocket;
  public wsReady?: boolean;
  private wsPingInterval?: NodeJS.Timer;
  private resolveMap?: Map<number, (value: unknown) => void>;
  private wsBooks!: Map<number, AlphapointOrderbook>;
  private wsBooksCbs!: Map<number, ((book: IOrderbook) => void)[]>;

  constructor(args: IAlphapointConstructorArgs<T>) {
    super({ ...args });
    this.eraseWebsocket();
  }

  private async ensureWebsocket() {
    if (!this.ws) {
      await this.initWebsocket();
    }
  }

  private eraseWebsocket() {
    this.ws = undefined;
    this.wsReady = false;
    if (this.wsPingInterval) {
      clearTimeout(this.wsPingInterval);
    }
    this.resolveMap = new Map();
    this.wsBooks = new Map();
    this.wsBooksCbs = new Map();
  }

  private initWebsocket(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const rejectTimer = setTimeout(() => {
        reject("websocket connection timeout");
      }, WEBSOCKET_TIMEOUT_MS);

      this.ws = new WebSocket(this.websocketUrl!);
      this.ws.onmessage = (event) => {
        const parsedData = JSON.parse(event.data.toString()) as IMessageFrame;

        if (this.id === "foxbit" && parsedData.m === 0) {
          parsedData.m = 1;
        }

        if (parsedData.n === "Ping") {
          this.resolveMap!.delete(parsedData.i);
        } else if (parsedData.m === ALPHAPOINT_METHOD.REPLY) {
          const prms = this.resolveMap?.get(parsedData.i);

          if (prms) {
            this.resolveMap?.delete(parsedData.i);
            prms(parsedData.o ? JSON.parse(parsedData.o) : null);
          }
        } else if (parsedData.m === ALPHAPOINT_METHOD.EVENT) {
          this.parseEvent(parsedData);
        }
      };
      this.resolveMap = new Map();
      this.ws.onopen = () => {
        this.wsPingInterval = setInterval(() => {
          this.sendFrameToWs({
            m: 0,
            n: "Ping",
            o: {},
          }).catch(() => null);
        }, 15000);

        this.wsReady = true;

        clearTimeout(rejectTimer);
        resolve(this.wsReady);
      };

      this.ws.onclose = () => this.eraseWebsocket();
      this.ws.onerror = () => this.eraseWebsocket();
    });
  }

  private parseEvent(frame: IMessageFrame) {
    if (frame.n === "Level2UpdateEvent") {
      const parsedO = JSON.parse(frame.o) as SubscribeLevel2[];
      for (const o of parsedO) {
        const InstrumentId = o[7];
        const book = this.wsBooks.get(InstrumentId);
        book!.parseL2(o);
        const cbs = this.wsBooksCbs.get(InstrumentId) ?? [];

        cbs.forEach((cb) => cb(book!.parsedBook));
      }
    }
  }

  public async subscribeBook(
    base: string,
    quote: string,
    cb: (book: IOrderbook) => void,
  ): Promise<() => Promise<void>> {
    const InstrumentId = this.normalizeAsset(base) as number;
    await this.ensureWebsocket();
    this.sendFrameToWs<number>({
      m: ALPHAPOINT_METHOD.SUBSCRIBE,
      n: "SubscribeLevel2",
      o: { OMSId: 1, InstrumentId, Depth: 500 },
    });

    this.wsBooks.set(InstrumentId, new AlphapointOrderbook());

    if (!this.wsBooksCbs.has(InstrumentId)) {
      this.wsBooksCbs.set(InstrumentId, []);
    }

    this.wsBooksCbs.get(InstrumentId)!.push(cb);

    return async () => {
      this.unsubscribeBook(InstrumentId);
    };
  }

  private async unsubscribeBook(InstrumentId: number) {
    this.wsBooks.delete(InstrumentId);
    await this.sendFrameToWs({
      m: ALPHAPOINT_METHOD.UNSUBSCRIBE_FROM_EVENT,
      n: "SubscribeLevel2",
      o: {},
    });
  }

  private buildMessageFrame(rawFrame: IRawMessageFrame): IMessageFrame {
    return {
      m: rawFrame.m,
      i: alternativeRandomInt(2, 999999),
      n: rawFrame.n,
      o: JSON.stringify(rawFrame.o),
    };
  }

  private async sendFrameToWs<T>(rawFrame: IRawMessageFrame): Promise<T> {
    const promise = new Promise<T>((resolve, reject) => {
      const frame = this.buildMessageFrame(rawFrame);

      if (rawFrame.m === ALPHAPOINT_METHOD.REQUEST) {
        this.resolveMap!.set(frame.i, (v) => resolve(v as T));
      }

      const rejectTimer = setTimeout(() => {
        if (
          rawFrame.m === ALPHAPOINT_METHOD.REQUEST &&
          this.resolveMap!.delete(frame.i)
        ) {
          reject("websocket reply timeout");
        }
      }, WEBSOCKET_TIMEOUT_MS);

      try {
        this.ws?.send(JSON.stringify(frame));
      } catch (err) {
        this.resolveMap!.delete(frame.i);
        clearTimeout(rejectTimer);
        reject(err);
      }
    });

    return promise;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  normalizeAsset(asset: string | number): string | number {
    throw new Error("this method must be overrided");
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const normalizedBase = this.normalizeAsset(base) as string;

    const res = await this.fetch(
      `${this.baseUrl}/GetLevel1?OMSId=1&InstrumentId=${normalizedBase} `,
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
    await this.ensureWebsocket();

    base = this.normalizeAsset(base) as string;

    const res = await this.sendFrameToWs<IAlphapointOrderbookRes>({
      m: ALPHAPOINT_METHOD.REQUEST,
      n: "GetL2Snapshot",
      o: { OMSId: 1, InstrumentId: base, Depth: 100 },
    });

    const normalizedBook = {
      asks: [] as IOrderbookOrder[],
      bids: [] as IOrderbookOrder[],
    };

    if (Array.isArray(res)) {
      res.forEach((order) => {
        if (order[9] === 1) {
          normalizedBook.asks.push(this.parseOrder(order));
        } else {
          normalizedBook.bids.push(this.parseOrder(order));
        }
      });
    }

    return normalizedBook;
  }
}

class AlphapointOrderbook {
  private book: { asks: SubscribeLevel2[]; bids: SubscribeLevel2[] };

  constructor() {
    this.book = {
      asks: [],
      bids: [],
    };
  }

  parseL2(l2: SubscribeLevel2) {
    if (l2[3] === 0) {
      this.insertOrder(l2);
    } else if (l2[3] === 1) {
      this.updateOrder(l2);
    } else if (l2[3] === 2) {
      this.removeOrder(l2);
    }
  }

  private insertOrder(order: SubscribeLevel2) {
    if (order[9] === 0) {
      this.book.bids.push(order);
      this.book.bids.sort((a, b) => b[6] - a[6]);
    } else {
      this.book.asks.push(order);
      this.book.asks.sort((a, b) => a[6] - b[6]);
    }
  }

  private removeOrder(order: SubscribeLevel2) {
    if (order[9] === 0) {
      this.book.bids = this.book.bids.filter((o) => o[0] != o[0]);
    } else {
      this.book.asks = this.book.asks.filter((o) => o[0] != o[0]);
    }
  }

  private updateOrder(order: SubscribeLevel2) {
    let orderFound: SubscribeLevel2 | undefined;
    if (order[9] === 0) {
      orderFound = this.book.bids.find((o) => o[0] === order[0]);
    } else {
      orderFound = this.book.asks.find((o) => o[0] === order[0]);
    }

    if (orderFound) {
      orderFound[8] = order[8];
      orderFound[6] = order[6];
    }
  }

  private parseSingleOrder(order: SubscribeLevel2): IOrderbookOrder {
    return {
      amount: order[8],
      price: order[6],
    };
  }

  get parsedBook() {
    return {
      asks: this.book.asks.map(this.parseSingleOrder),
      bids: this.book.bids.map(this.parseSingleOrder),
    };
  }
}
