import { okx } from "../src/connectors/okx";
import { FetcherHandler } from "../src/utils/DTOs";
import { MyFetcher } from "./utils/MyFetcher";
import { testAllTickers, testBook, testTicker } from "./utils/helpers";

const BASE = "BTC",
  QUOTE = "BRL";

describe("okx", () => {
  let exchange: okx;

  beforeEach(() => {
    exchange = new okx();
    const fetcher = new MyFetcher();

    FetcherHandler.setFetcher(fetcher);
  });

  describe("getAllTickers", () => {
    it("should return an array of ITicker objects", async () => {
      const tickers = await exchange.getAllTickers();

      testAllTickers(tickers);
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
