import { mercadobitcoin } from "../src/exchanges";

const ex = new mercadobitcoin();

ex.getBook("BTC", "BRL").then((book) =>
  console.log("book from mercadobitcoin", book),
);

// ex.getAllTickers().then((tickers) =>
//   console.log("tickers from mercadobitcoin", tickers),
// );
