import { paxos } from "../src/connectors/paxos";

import { testBook, testTicker } from "./utils/helpers";

const BASE = "BTC",
  QUOTE = "USD";

describe("paxos", () => {
  let exchange: paxos;

  beforeEach(() => {
    exchange = new paxos();
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
