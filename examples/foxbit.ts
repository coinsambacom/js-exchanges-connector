// @ts-ignore
import { foxbit } from "../src/index";

const ex = new foxbit();

ex.getBook("BTC", "BRL").then((book) => console.log("book from foxbit", book));
ex.getAllTickers().then((tickers) =>
  console.log("tickers from foxbit", tickers),
);
