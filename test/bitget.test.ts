import { expect } from "chai";
import { bitget } from "../src/connectors/bitget";
import { expectPropertyTypes } from "./utils/helpers";

const QUOTE = "BRL";

describe("bitget", () => {
  let exchange: bitget;

  beforeEach(() => {
    exchange = new bitget();
  });

  describe("getAllTickersByQuote", () => {
    it("should return an array of ITicker objects", async () => {
      const tickers = await exchange.getAllTickers();

      expect(Array.isArray(tickers)).to.be.true;

      if (tickers.length > 0) {
        const ticker = tickers[0];

        expectPropertyTypes(ticker, ["exchangeId", "base", "quote"], "string");
        expectPropertyTypes(ticker, ["last", "ask", "bid", "vol"], "number");
      }
    });
  });

  describe("getBook", () => {
    it("should return an IOrderbook object", async () => {
      const book = await exchange.getBook("BTC", QUOTE);

      expect(book).to.have.property("asks");
      expect(book).to.have.property("bids");
      expect(Array.isArray(book.asks)).to.be.true;
      expect(Array.isArray(book.bids)).to.be.true;

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
