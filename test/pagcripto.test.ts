import { pagcripto } from "../src/connectors/pagcripto";
import { FetcherHandler } from "../src/utils/FetcherHandler";
import { MyFetcher } from "./utils/MyFetcher";
import { expectPropertyTypes } from "./utils/helpers";

describe("pagcripto", () => {
  let exchange: pagcripto;

  beforeEach(() => {
    exchange = new pagcripto();
    const fetcher = new MyFetcher();

    FetcherHandler.setFetcher(fetcher);
  });

  describe("getAllTickersByQuote", () => {
    it("should return an array of ITicker objects", async () => {
      const tickers = await exchange.getAllTickersByQuote("BRL");

      expect(Array.isArray(tickers)).toBe(true);

      if (tickers.length > 0) {
        const ticker = tickers[0];

        expectPropertyTypes(ticker, ["exchangeId", "base", "quote"], "string");
        expectPropertyTypes(ticker, ["last", "ask", "bid", "vol"], "number");
      }
    });
  });

  describe("getTicker", () => {
    it("should return an ITicker object", async () => {
      const ticker = await exchange.getTicker("BTC", "BRL");

      expectPropertyTypes(ticker, ["exchangeId", "base", "quote"], "string");
      expectPropertyTypes(ticker, ["last", "ask", "bid", "vol"], "number");
    });
  });

  describe("getBook", () => {
    it("should return an IOrderbook object", async () => {
      const book = await exchange.getBook("BTC", "BRL");

      expect(book).toHaveProperty("asks");
      expect(book).toHaveProperty("bids");
      expect(Array.isArray(book.asks)).toBe(true);
      expect(Array.isArray(book.bids)).toBe(true);

      if (book.asks.length > 0) {
        const ask = book.asks[0];
        expectPropertyTypes(ask, ["price", "amount"], "number");
      }

      if (book.bids.length > 0) {
        const bid = book.bids[0];
        expectPropertyTypes(bid, ["price", "amount"], "number");
      }
    });
  });
});
