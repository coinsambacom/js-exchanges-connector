// @ts-ignore
import { flowbtc } from "../src/index";

const ex = new flowbtc();

ex.getBook("BTC", "BRL").then((book) => console.log("book", book));
ex.getTicker("BTC", "BRL").then((tickers) => console.log("tickers", tickers));
