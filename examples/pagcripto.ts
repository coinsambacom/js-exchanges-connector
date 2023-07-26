import "dotenv/config";
import { pagcripto, FetcherHandler } from "../src/index";
import { MyFetcher } from "../test/utils/MyFetcher";
// import { OrderSide } from "../src/types/common";

FetcherHandler.setFetcher(new MyFetcher());

console.log(process.env.PAGCRIPTO_KEY);

const ex = new pagcripto({ key: process.env.PAGCRIPTO_KEY });

ex.getAllTickersByQuote("BRL").then((tickers) =>
  console.log("tickers from ", ex.id, tickers),
);

ex.getBook("BTC", "BRL").then((v) => console.log("book from", ex.id, v));

ex.getBalance().then((v) => console.log("balance from", ex.id, v));

// ex.cancelOrder({ id: "asasdas", base: "BTC", quote: "BRL" }).then((v) =>
//   console.log("cancel order from", ex.id, v),
// );

// ex.placeOrder({
//   price: 50,
//   amount: 1,
//   side: OrderSide.BUY,
//   base: "BTC",
//   quote: "BRL",
// }).then((v) => console.log("place order from", ex.id, v));

ex.getOrder({
  id: "64c041e3dfe35",
  base: "BTC",
  quote: "BRL",
}).then((v) => console.log("get order from", ex.id, v));

ex.getHistory({
  page: 1,
  base: "BTC",
  quote: "BRL",
}).then((v) => console.log("get history from", ex.id, v));
