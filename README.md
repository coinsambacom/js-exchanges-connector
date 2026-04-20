# js-exchanges-connector

An open source JavaScript library for fetching cryptocurrency exchanges

## Advantages

- **Zero Dependencies**: This library has no external dependencies, making it lightweight and reducing security risks
- Simple and consistent API across all supported exchanges
- Typescript support

# Instalation

`yarn add @coinsamba/js-exchanges-connector`

or

`npm i @coinsamba/js-exchanges-connector`

# Usage

Import your favorite exchange connector

```JavaScript
import { gateio } from '@coinsamba/js-exchanges-connector';
```

Getters: all connectors have this same getters used to verify if the connector have an implementation of desired method.

```JavaScript
/**
 * will return true if this exchange has the method that return all tickers with all available quote
 */
console.log(gateio.hasAllTickers);

/**
 * will return true if this exchange has the method that return all tickers with specific quote as argument
 */
console.log(gateio.hasAllTickersByQuote);
```

```JavaScript
import { bybit, binance } from '@coinsamba/js-exchanges-connector';

bybit.getTicker('BTC', 'USDT').then(ticker => console.log(ticker));
// will return the ticker in the specified market
// {
//     exchangeId: "bybit",
//     base: "BTC",
//     quote: "USDT",
//     last: 100000,
//     ask: 100000,
//     bid: 100000,
//     vol: 16,
// }

bybit.getBook('BTC', 'USDT').then(book => console.log(book));
// will return orderbook of specified market
// {
//     asks: [{price: 1000, amount: 1}],
//     bids: [{price: 1000, amount: 1}],
// }


bybit.getAllTickersByQuote('USDT').then(tickers => console.log(tickers));
// will return all tickers in the specified market
// [
//     {
//         exchangeId: "bybit",
//         base: "BTC",
//         quote: "USDT",
//         last: 100000,
//         ask: 100000,
//         bid: 100000,
//         vol: 16,
//     },
//     {
//         exchangeId: "bybit",
//         base: "ETH",
//         quote: "USDT",
//         last: 100000,
//         ask: 100000,
//         bid: 100000,
//         vol: 16,
//     }
// ]


binance.getAllTickers().then(tickers => console.log(tickers));
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

# Custom fetcher

You can use a custom fetcher, just create a class that implement `ICustomFetcher` interface, and call `FetcherHandler.setFetcher(new MyFetcher());` to start using your custom fetcher.
This is cool because you can define proxy or any different strategy to fetch the exchanges APIs.

```JavaScript
import {
  FetcherHandler,
} from "@coinsamba/js-exchanges-connector";
import {
  FetcherArgs,
  FetcherRequisitionMethods,
  ICustomFetcher,
} from "@coinsamba/js-exchanges-connector/types";
import Axios, { AxiosError } from "axios";

export class MyFetcher implements ICustomFetcher {
  private parseAxiosError(e: AxiosError) {
    let message = `E - ${e.code}`;
    if (e.response) {
      message += ` - ${e.response.status} - ${e.config!.url} ${
        typeof e.response.data === "object"
          ? `- ${JSON.stringify(e.response.data)}`
          : ""
      }`;
    } else {
      message += ` - ${e.config!.url}`;
    }
    return new Error(message);
  }

  // fetch must handle with get and post methods
  // must be able to receive string paramter and handle as GET method
  async fetch<ResponseType>(args: FetcherArgs): Promise<ResponseType> {
    try {
      if (typeof args == "string") {
        const { data } = await Axios.get<ResponseType>(args);
        return data;
      } else {
        const { data } = await Axios.request<ResponseType>({
          headers: args.headers,
          url: args.url,
          method: args.method,
          [args.method === FetcherRequisitionMethods.GET ? "params" : "data"]:
            args.data,
        });
        return data;
      }
    } catch (error: any) {
      throw this.parseAxiosError(error as unknown as AxiosError);
    }
  }
}


FetcherHandler.setFetcher(new MyFetcher());
```

## Who is using?

- Coinsamba

## Implementations

| id                | getTicker | getAllTickers | getAllTickersByQuote | getBook |
| ----------------- | --------- | ------------- | -------------------- | ------- |
| binance_us 🇺🇸     | ✓         | ✓             |                      | ✓       |
| binance 🌐        | ✓         | ✓             |                      | ✓       |
| bisq 🌐           | ✓         |               |                      | ✓       |
| bitbay            | ✓         |               |                      | ✓       |
| bitblue 🇧🇷        | ✓         |               |                      | ✓       |
| bitcointoyou 🇧🇷   | ✓         |               |                      | ✓       |
| bitcointrade 🇧🇷   | ✓         |               |                      | ✓       |
| bitget 🌐         |           | ✓             |                      | ✓       |
| bitmonedero 🇦🇷    | ✓         |               |                      | ✓       |
| bitnuvem 🇧🇷       | ✓         |               |                      | ✓       |
| bitpreco 🇧🇷       | ✓         |               | ✓                    | ✓       |
| bitso 🇲🇽          | ✓         |               |                      | ✓       |
| bitstamp          | ✓         |               |                      | ✓       |
| brasilbitcoin 🇧🇷  | ✓         | ✓             |                      | ✓       |
| btcmarkets 🇦🇺     | ✓         | ✓             |                      | ✓       |
| buda 🇨🇴🇵🇪🇦🇷🇨🇱     | ✓         |               |                      | ✓       |
| bybit 🌐          | ✓         |               | ✓                    | ✓       |
| cexio 🌐          | ✓         |               | ✓                    | ✓       |
| citcoin 🇧🇷        | ✓         |               |                      | ✓       |
| coinbase_pro      | ✓         |               |                      | ✓       |
| coinext 🇧🇷        | ✓         |               | ✓                    | ✓       |
| coinsbank 🌐      | ✓         |               |                      | ✓       |
| cryptomarket 🇦🇷   | ✓         |               |                      | ✓       |
| decrypto 🇦🇷       |           |               |                      | ✓       |
| digitra 🇧🇷        | ✓         | ✓             |                      | ✓       |
| exmo 🌐           | ✓         | ✓             |                      | ✓       |
| flowbtc 🇧🇷        | ✓         |               | ✓                    | ✓       |
| foxbit 🇧🇷         | ✓         | ✓             |                      | ✓       |
| gateio 🌐         | ✓         | ✓             |                      | ✓       |
| isbit 🇲🇽          | ✓         |               |                      | ✓       |
| isistrade 🇧🇷      |           |               | ✓                    | ✓       |
| kraken 🌐         | ✓         |               |                      | ✓       |
| kucoin 🌐         | ✓         | ✓             |                      | ✓       |
| luno 🇿🇦           |           |               | ✓                    | ✓       |
| mercadobitcoin 🇧🇷 | ✓         | ✓             |                      | ✓       |
| novadax 🇧🇷        | ✓         | ✓             |                      | ✓       |
| noxbitcoin 🇧🇷     | ✓         |               |                      |         |
| okx 🌐            | ✓         | ✓             |                      | ✓       |
| pagcripto_otc 🇧🇷  | ✓         |               |                      | ✓       |
| pagcripto 🇧🇷      | ✓         |               | ✓                    | ✓       |
| paxos 🌐          | ✓         |               |                      | ✓       |
| poloniex 🌐       | ✓         | ✓             |                      | ✓       |
| quidax 🇳🇬         |           |               | ✓                    | ✓       |
| satoshitango 🇦🇷   |           |               | ✓                    | ✓       |
| trubit 🌐         | ✓         | ✓             |                      | ✓       |
| upbit 🇰🇷          |           |               | ✓                    | ✓       |
| upbit_id 🇮🇩       |           |               | ✓                    | ✓       |
| upbit_sg 🇸🇬       |           |               | ✓                    | ✓       |
| upcambio 🇧🇷       | ✓         |               |                      | ✓       |

## Known Whitelabel Platforms

- alphapoint
- bnb
- peatio
- upex
