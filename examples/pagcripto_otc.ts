import { pagcripto_otc } from "../src/exchanges";
import { FetcherHandler } from "../src/utils/DTOs";
import { MyFetcher } from "../test/utils/MyFetcher";
// import { OrderSide } from "../src/types/common";

FetcherHandler.setFetcher(new MyFetcher());

const ex = new pagcripto_otc();

// ex.getBook("BTC", "BRL").then((book) => console.log("book from", ex.id, book));
ex.getAllTickers().then((tickers) =>
  console.log("tickers from ", ex.id, tickers),
);
