import { expect } from "chai";
import { isistrade } from "../src/connectors/isistrade";

import { expectPropertyTypes } from "./utils/helpers";

describe.skip("isistrade", () => {
  let exchange: isistrade;

  beforeEach(() => {
    exchange = new isistrade();
  });

  describe("getAllTickersByQuote", () => {
    it("should return an array of ITicker objects", async () => {
      const tickers = await exchange.getAllTickersByQuote("BRL");

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
      const book = await exchange.getBook("BTC", "BRL");

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
