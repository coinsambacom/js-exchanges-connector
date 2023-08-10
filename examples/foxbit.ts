import { foxbit } from "../src/exchanges";
import { FetcherHandler } from "../src/types";
import { MyFetcher } from "../test/utils/MyFetcher";
// import { OrderSide } from "../src/types/common";

FetcherHandler.setFetcher(new MyFetcher());

const ex = new foxbit();

ex.getBook("BTC", "BRL").then((book) => console.log("book from foxbit", book));
ex.getAllTickers().then((tickers) =>
  console.log("tickers from foxbit", tickers),
);
