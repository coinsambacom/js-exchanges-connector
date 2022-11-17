// @ts-ignore
import { bisq } from "../src/index";

const ex = new bisq();

ex.getBook("BTC", "USD").then((book) => console.log("book from bisq", book));
ex.getTicker("BTC", "USD").then((ticker) =>
  console.log("tickers from bisq", ticker),
);
