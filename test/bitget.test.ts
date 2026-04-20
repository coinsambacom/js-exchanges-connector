import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { bitget } from "../src/connectors/bitget.js";
import { expectPropertyTypes, testBook } from "./utils/helpers.js";

const BASE = "BTC",
  QUOTE = "BRL";

describe("bitget", () => {
  let exchange: bitget;

  beforeEach(() => {
    exchange = new bitget();
  });

  describe("getAllTickersByQuote", () => {
    it("should return an array of ITicker objects", async () => {
      const tickers = await exchange.getAllTickers();

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
