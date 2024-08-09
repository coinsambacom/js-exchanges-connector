import { expect } from "chai";
import { paxos } from "../src/connectors/paxos";

import { expectPropertyTypes } from "./utils/helpers";

describe("paxos", () => {
  let exchange: paxos;

  beforeEach(() => {
    exchange = new paxos();
  });

  describe("getTicker", () => {
    it("should return an ITicker object", async () => {
      const ticker = await exchange.getTicker("BTC", "USD");

      expectPropertyTypes(ticker, ["exchangeId", "base", "quote"], "string");
      expectPropertyTypes(ticker, ["last", "ask", "bid", "vol"], "number");
    });
  });

  describe("getBook", () => {
    it("should return an IOrderbook object", async () => {
      const book = await exchange.getBook("BTC", "USD");

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
