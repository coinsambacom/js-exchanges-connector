import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";

import { expectPropertyTypes, testBook } from "./utils/helpers.ts";
import type { IExchange } from "../src/utils/DTOs.ts";

const CONNECTOR = "upbit",
  BASE = "BTC",
  QUOTE = "KRW";

describe.only(CONNECTOR, () => {
  let exchange: IExchange;

  beforeEach(async () => {
    const imported = await import(`../dist/connectors/${CONNECTOR}.js`);

    const ExchangeClass = Object.values(imported)[0] as { new (): IExchange };

    exchange = new ExchangeClass();
  });

  describe("getAllTickersByQuote", () => {
    it("should return an array of ITicker objects", async () => {
      const tickers = await exchange.getAllTickersByQuote!(QUOTE);

      assert.ok(Array.isArray(tickers));

      const ticker = tickers[0];

      expectPropertyTypes(ticker, ["exchangeId", "base", "quote"], "string");
      expectPropertyTypes(ticker, ["last", "ask", "bid", "vol"], "number");
    });
  });

  describe("getBook", () => {
    it("should return an IOrderbook object", async () => {
      const book = await exchange.getBook!(BASE, QUOTE);

      testBook(book);
    });
  });
});
