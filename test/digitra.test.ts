import { IExchange } from "../src/utils/DTOs";

import { testBook, testTicker } from "./utils/helpers";

const CONNECTOR = "digitra",
  BASE = "BTC",
  QUOTE = "BRL";

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

  describe("getBook", () => {
    it("should return an IOrderbook object", async () => {
      const book = await exchange.getBook!(BASE, QUOTE);

      testBook(book);
    });
  });
});
