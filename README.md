# js-exchanges-connector

An open source JavaScript library for fetching cryptocurrency exchanges

[<img src="https://api.gitsponsors.com/api/badge/img?id=390396345" height="20">](https://api.gitsponsors.com/api/badge/link?p=KrgdKlAz9G5H8q8A2PbjU28NjwMmxDN2xMI9xH8RJr4I3bXEyBialV9vw5uOkSBVdAd0jzYXT/PsCK1OyrUL2lB3mEZLCXRjpDCMNbP5tYGxK2pdXaPdf6SqImkwWWTk03xubKCDI7dkvwHTER/KrQ==)

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
 * will return true if this exchange has the method that return all tickers with all available quote
 */
console.log(bitpreco.hasAllTickers);

/**
 * will return true if this exchange has the method that return all tickers with specific quote as argument
 */
console.log(bitpreco.hasAllTickersByQuote);
```

```JavaScript
import { pagcripto, binance } from '@coinsamba/js-exchanges-connector';

pagcripto.getTicker('BTC', 'BRL').then(ticker => console.log(ticker));
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

pagcripto.getBook('BTC', 'BRL').then(book => console.log(book));
// will return orderbook of specified market
// {
//     asks: [{price: 1000, amount: 1}],
//     bids: [{price: 1000, amount: 1}],
// }


pagcripto.getAllTickersByQuote('BRL').then(tickers => console.log(tickers));
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

You can use a custom fetcher, just create a class that implement `ICustomFetcher` interface, and call ` FetcherHandler.setFetcher(new MyFetcher());` to start using your custom fetcher.
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
| brasilbitcoin 🇧🇷  | ✓         |               |                      | ✓       |
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
| upcambio 🇧🇷       | ✓         |               |                      | ✓       |

## Known Whitelabel Platforms

- alphapoint
- bnb
- peatio
- upex
