import { expect } from "chai";
import { quidax } from "../src/connectors/quidax";

import { expectPropertyTypes, testBook } from "./utils/helpers";

const BASE = "BTC",
  QUOTE = "NGN";

describe("quidax", () => {
  let exchange: quidax;

  beforeEach(() => {
    exchange = new quidax();
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
