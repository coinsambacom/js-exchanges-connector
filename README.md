# js-exchanges-connector

An open source JavaScript library for fetching cryptocurrency exchanges

# Instalation

`yarn add @coinsamba/js-exchanges-connector`

or

`npm i @coinsamba/js-exchanges-connector`

# Usage

Import your favorite exchange connector

```JavaScript
import { bitpreco } from '@coinsamba/js-exchanges-connector';
```

Getters: all connectors have this same getters used to verify if the connector have an implementation of desired method.

```JavaScript
/**
 * will return true if this exchange has the method that return all * tickers with all available quote
 */
console.log(bitpreco.hasAllTickers);

/**
 * will return true if this exchange has the method that return all * tickers with specific quote as argument
 */
console.log(bitpreco.hasAllTickersByQuote);
```

```JavaScript
import { pagcripto, binance } from '@coinsamba/js-exchanges-connector';

pagcripto.getTicker('BTC', 'BRL').them(ticker => console.log(ticker));
// will return the ticker in the specified market
// {
//     exchangeId: "pagcripto",
//     base: "BTC",
//     quote: "BRL",
//     last: 100000,
//     ask: 100000,
//     bid: 100000,
//     vol: 16,
// }

pagcripto.getBook('BTC', 'BRL').them(book => console.log(book));
// will return orderbook of specified market
// {
//     asks: [{price: 1000, amount: 1}],
//     bids: [{price: 1000, amount: 1}],
// }


pagcripto.getAllTickersByQuote('BRL').them(tickers => console.log(tickers));
// will return all tickers in the specified market
// [
//     {
//         exchangeId: "pagcripto",
//         base: "BTC",
//         quote: "BRL",
//         last: 100000,
//         ask: 100000,
//         bid: 100000,
//         vol: 16,
//     },
//     {
//         exchangeId: "pagcripto",
//         base: "ETH",
//         quote: "BRL",
//         last: 100000,
//         ask: 100000,
//         bid: 100000,
//         vol: 16,
//     }
// ]


binance.getAllTickers().them(tickers => console.log(tickers));
// will return all tickers in all markets
// [
//     {
//         exchangeId: "binance",
//         base: "BTC",
//         quote: "BRL",
//         last: 100000,
//         ask: 100000,
//         bid: 100000,
//         vol: 16,
//     },
//     {
//         exchangeId: "binance",
//         base: "ETH",
//         quote: "BTC",
//         last: 100000,
//         ask: 100000,
//         bid: 100000,
//         vol: 16,
//     }
// ]

```

## Who is using?

- Coinsamba

## Implementations

| id             | getTicker | getAllTickers | getAllTickersByQuote | getBook |
| -------------- | --------- | ------------- | -------------------- | ------- |
| alterbank      | 1         |               |                      | 1       |
| binance_je     | 1         | 1             |                      | 1       |
| binance_us     | 1         | 1             |                      | 1       |
| binance_us     | 1         | 1             |                      | 1       |
| bipa           | 1         |               |                      | 1       |
| biscoint       | 1         |               |                      | 1       |
| bitbay         | 1         |               |                      | 1       |
| bitblue        | 1         |               |                      | 1       |
| bitcointoyou   | 1         |               |                      | 1       |
| bitcointrade   | 1         |               |                      | 1       |
| bitmonedero    | 1         |               |                      | 1       |
| bitnuvem       | 1         |               |                      | 1       |
| bitpreco       | 1         |               | 1                    | 1       |
| bitrecife      | 1         |               | 1                    | 1       |
| bitso          | 1         |               |                      | 1       |
| bitstamp       | 1         |               |                      | 1       |
| bittrex        | 1         | 1             |                      | 1       |
| bleutrade      | 1         |               | 1                    | 1       |
| blocktane      | 1         |               |                      |         |
| brasilbitcoin  | 1         |               |                      | 1       |
| buda           | 1         |               |                      | 1       |
| bullgain       | 1         |               | 1                    | 1       |
| cexio          | 1         |               | 1                    | 1       |
| citcoin        | 1         |               |                      | 1       |
| coinbase_pro   | 1         |               |                      | 1       |
| coinbene       | 1         |               |                      | 1       |
| coinext        | 1         |               | 1                    | 1       |
| coinsbank      | 1         |               |                      | 1       |
| comprarbitcoin | 1         |               | 1                    | 1       |
| cryptomarket   | 1         |               |                      | 1       |
| decrypto       |           |               |                      | 1       |
| exmo           | 1         | 1             |                      | 1       |
| flowbtc        | 1         |               | 1                    | 1       |
| foxbit         | 1         |               | 1                    | 1       |
| ftx            | 1         |               |                      | 1       |
| gateio         | 1         | 1             |                      | 1       |
| isbit          | 1         |               |                      | 1       |
| kraken         | 1         |               |                      | 1       |
| kucoin         | 1         | 1             |                      | 1       |
| liqi           | 1         | 1             |                      | 1       |
| makesexchange  | 1         |               |                      | 1       |
| mercadobitcoin | 1         |               |                      | 1       |
| novadax        | 1         | 1             |                      | 1       |
| noxbitcoin     | 1         |               |                      |         |
| pagcripto_otc  | 1         |               |                      | 1       |
| pagcripto      | 1         |               |                      | 1       |
| poloniex       | 1         | 1             |                      | 1       |
| satoshitango   |           |               | 1                    | 1       |
| stonoex        | 1         |               | 1                    | 1       |
| tauros         |           | 1             |                      | 1       |
| upcambio       | 1         |               |                      | 1       |
| youbtrade      |           | 1             |                      | 1       |

## Known Whitelabel Platforms

- alphapoint
- bnb
- bws
- kfex
- peatio
- upex
