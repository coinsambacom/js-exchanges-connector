import { walltime } from "../src/index";

const ex = new walltime();

ex.getBook("BTC", "USD").then((book) => console.log("book", book));
ex.getTicker("BTC", "USD").then((ticker) => console.log("ticker", ticker));
