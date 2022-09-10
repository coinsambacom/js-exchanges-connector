// @ts-ignore
import { fluyez } from "../src/index";

const ex = new fluyez();

ex.getBook("BTC", "USD").then((book) => console.log("book from fluyez", book));
ex.getAllTickers().then((tickers) =>
  console.log("tickers from fluyez", tickers),
);
