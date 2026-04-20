import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { quidax } from "../src/connectors/quidax.js";

import { expectPropertyTypes, testBook } from "./utils/helpers.js";

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

      assert.ok(Array.isArray(tickers));

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
