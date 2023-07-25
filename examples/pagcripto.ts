// @ts-ignore
import { pagcripto } from "../src/index";

const ex = new pagcripto();

ex.getBook("BTC", "BRL").then((v) => console.log("book from", ex.id, v));

ex.getBalance().then((v) => console.log("balance from", ex.id, v));

// ex.getAllTickers().then((tickers) =>
//   console.log("tickers from mercadobitcoin", tickers),
// );
