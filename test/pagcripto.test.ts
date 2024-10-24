import { expect } from "chai";
import { pagcripto } from "../src/connectors/pagcripto";

import { expectPropertyTypes, testBook, testTicker } from "./utils/helpers";

const BASE = "BTC",
  QUOTE = "BRL";

describe("pagcripto", () => {
  let exchange: pagcripto;

  beforeEach(() => {
    exchange = new pagcripto();
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

  describe("getTicker", () => {
    it("should return an ITicker object", async () => {
      const ticker = await exchange.getTicker(BASE, QUOTE);

      testTicker(ticker);
    });
  });

  describe("getBook", () => {
    it("should return an IOrderbook object", async () => {
      const book = await exchange.getBook(BASE, QUOTE);

      testBook(book);
    });
  });
});
