import { expect } from "chai";
import { IExchange } from "../src/utils/DTOs";

import { expectPropertyTypes, testBook, testTicker } from "./utils/helpers";

const CONNECTOR = "bybit",
  BASE = "BTC",
  QUOTE = "USDT";

describe(CONNECTOR, () => {
  let exchange: IExchange;

  beforeEach(async () => {
    const imported = await import(`../src/connectors/${CONNECTOR}`);

    const ExchangeClass = Object.values(imported)[0] as { new (): IExchange };

    exchange = new ExchangeClass();
  });

  describe("getTicker", () => {
    it("should return an ITicker object", async () => {
      const ticker = await exchange.getTicker!(BASE, QUOTE);

      testTicker(ticker);
    });
  });

  describe("getAllTickersByQuote", () => {
    it("should return an array of ITicker objects", async () => {
      const tickers = await exchange.getAllTickersByQuote!(QUOTE);

      expect(Array.isArray(tickers)).to.be.true;

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
