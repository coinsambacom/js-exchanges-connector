import { expect } from "chai";
import { luno } from "../src/connectors/luno";

import { expectPropertyTypes, testBook } from "./utils/helpers";

const BASE = "BTC",
  QUOTE = "NGN";

describe("luno", () => {
  let exchange: luno;

  beforeEach(() => {
    exchange = new luno();
  });

  describe("getAllTickersByQuote", () => {
    it("should return an array of ITicker objects", async () => {
      const tickers = await exchange.getAllTickersByQuote(QUOTE);

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
      const book = await exchange.getBook(BASE, QUOTE);

      testBook(book);
    });
  });
});
