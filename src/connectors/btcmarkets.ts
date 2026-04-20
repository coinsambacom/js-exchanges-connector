import {
  Exchange,
  IExchangeImplementationConstructorArgs,
} from "../interfaces/exchange";
import {
  FetcherRequisitionMethods,
  IOrderbook,
  IOrderbookOrder,
  ITicker,
} from "../utils/DTOs";

type BtcMarketsMarketRes = {
  marketId: string;
  baseAssetName: string;
  quoteAssetName: string;
  minOrderAmount: string;
  maxOrderAmount: string;
  amountDecimals: string;
  priceDecimals: string;
  status: string;
};

type BtcMarketsTicker = {
  marketId: string;
  bestBid: string;
  bestAsk: string;
  lastPrice: string;
  volume24h: string;
  volumeQte24h: string;
  price24h: string;
  pricePct24h: string;
  low24h: string;
  high24h: string;
  timestamp: string;
};

type BtcMarketsOrderBookRes = {
  marketId: string;
  snapshotId: number;
  asks: BtcMarketsOrderBookEntry[];
  bids: BtcMarketsOrderBookEntry[];
};

type BtcMarketsOrderBookEntry = [string, string];

export class btcmarkets<T = any> extends Exchange<T> {
  constructor(args?: IExchangeImplementationConstructorArgs<T>) {
    super({
      id: "btcmarkets",
      baseUrl: "https://api.btcmarkets.net/v3",
      opts: args?.opts,
    });
  }

  private parseTicker(ticker: BtcMarketsTicker): ITicker {
    const [base, quote] = ticker.marketId.split("-");

    return {
      exchangeId: this.id,
      base: base!,
      quote: quote!,
      ask: Number(ticker.bestAsk),
      bid: Number(ticker.bestBid),
      last: Number(ticker.lastPrice),
      vol: Number(ticker.volume24h),
    };
  }

  async getAllTickers(): Promise<ITicker[]> {
    const markets = await this.fetch<BtcMarketsMarketRes[]>({
      url: `${this.baseUrl}/markets`,
      method: FetcherRequisitionMethods.GET,
    });

    const fetchTickersForMarkets = async (
      marketsBatch: BtcMarketsMarketRes[],
    ) => {
      const url = new URL(`${this.baseUrl}/markets/tickers`);
      marketsBatch.forEach((market) =>
        url.searchParams.append("marketId", market.marketId),
      );

      return this.fetch<BtcMarketsTicker[]>({
        url: url.toString(),
        method: FetcherRequisitionMethods.GET,
      });
    };

    const batchSize = 10;
    const batchedMarkets = Array.from(
      { length: Math.ceil(markets.length / batchSize) },
      (_, i) => markets.slice(i * batchSize, i * batchSize + batchSize),
    );

    const results = await Promise.allSettled(
      batchedMarkets.map((batch) => fetchTickersForMarkets(batch)),
    );

    const tickers: BtcMarketsTicker[] = results
      .filter(
        (result): result is PromiseFulfilledResult<BtcMarketsTicker[]> =>
          result.status === "fulfilled",
      )
      .flatMap((result) => result.value);

    return tickers.map((ticker) => this.parseTicker(ticker));
  }

  async getTicker(base: string, quote: string): Promise<ITicker> {
    const res = await this.fetch<BtcMarketsTicker>({
      url: `${this.baseUrl}/markets/${base}-${quote}/ticker`,
      method: FetcherRequisitionMethods.GET,
    });

    return this.parseTicker(res);
  }

  private parseOrderbookOrder([
    price,
    amount,
  ]: BtcMarketsOrderBookEntry): IOrderbookOrder {
    return {
      price: Number(price),
      amount: Number(amount),
    };
  }

  async getBook(base: string, quote: string): Promise<IOrderbook> {
    const res = await this.fetch<BtcMarketsOrderBookRes>({
      url: `${this.baseUrl}/markets/${base}-${quote}/orderbook`,
      method: FetcherRequisitionMethods.GET,
    });

    return {
      asks: res.asks.map(this.parseOrderbookOrder),
      bids: res.bids.map(this.parseOrderbookOrder),
    };
  }
}
