# API Documentation

## Base API URL
The base URL for the API is: 
```
https://api.toobit.com
```

## 1. How to Get a Single Ticker

### Endpoint URL
```
GET /quote/v1/ticker/price
```

### HTTP Method
`GET`

### Description
This endpoint retrieves the latest price for a specific trading pair. If no symbol is provided, it returns prices for all trading pairs.

### Parameters
- **symbol**: (STRING, optional) The specific trading pair symbol. If omitted, all symbols' data will be returned.

### Example Request using `curl`
```sh
curl -X GET 'https://api.toobit.com/quote/v1/ticker/price?symbol=BTCUSDT'
```

### Example JSON Response
```json
[
  {
    "s": "BTCUSDT",
    "p": "40000.00"
  }
]
```

## 2. How to Get the Book (Order Book)

### Endpoint URL
```
GET /quote/v1/ticker/bookTicker
```

### HTTP Method
`GET`

### Description
This endpoint retrieves the order book ticker, including the highest bid and lowest ask prices for a specific trading pair or all pairs.

### Parameters
- **symbol**: (STRING, optional) The specific trading pair symbol. If omitted, all symbols' order book data will be returned.

### Example Request using `curl`
```sh
curl -X GET 'https://api.toobit.com/quote/v1/ticker/bookTicker?symbol=BTCUSDT'
```

### Example JSON Response
```json
{
  "symbol": "BTCUSDT",
  "bidPrice": "39950.00",
  "askPrice": "40000.00"
}
```

## Conclusion
This document provides the necessary endpoints for retrieving ticker and order book information from the TooBit API. By utilizing the specified endpoints and following the provided examples, developers can easily access market data for their desired trading pairs.