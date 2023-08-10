import { fluyez } from "../src/exchanges";

const ex = new fluyez();

ex.getBook("BTC", "USD").then((book) => console.log("book from fluyez", book));
ex.getAllTickers().then((tickers) =>
  console.log("tickers from fluyez", tickers),
);
