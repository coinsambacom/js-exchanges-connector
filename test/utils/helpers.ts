import assert from "node:assert";
import { IOrderbook, ITicker, IOrderbookOrder } from "../../src/utils/DTOs.js";

/**
 * Verifies the property types of an object using Node.js assertions.
 *
 * @param obj The object to be checked.
 * @param properties A list of object properties to be verified.
 * @param type The expected type of the properties.
 */
export function expectPropertyTypes(
  obj: any,
  properties: string[],
  type: string,
) {
  for (const prop of properties) {
    assert.ok(prop in obj, `Object should have property: ${prop}`);
    assert.strictEqual(
      typeof obj[prop],
      type,
      `Property ${prop} should be type ${type}`,
    );
  }
}

export function expectPropertyTypesGeneric<T = ITicker | IOrderbookOrder>(
  obj: T,
  properties: (keyof T)[],
  type: string,
) {
  for (const prop of properties) {
    assert.ok(
      prop in (obj as object),
      `Object should have property: ${String(prop)}`,
    );
    assert.strictEqual(
      typeof obj[prop],
      type,
      `Property ${String(prop)} should be type ${type}`,
    );
  }
}

export const testAllTickers = (tickers: ITicker[]) => {
  assert.ok(Array.isArray(tickers), "Tickers should be an array");

  if (tickers.length > 0) {
    for (const ticker of tickers) {
      testTicker(ticker);
    }
  }
};

export const testTicker = (ticker: ITicker) => {
  expectPropertyTypes(ticker, ["exchangeId", "base", "quote"], "string");
  expectPropertyTypes(ticker, ["last", "ask", "bid", "vol"], "number");
};

export const testBook = (book: IOrderbook) => {
  assert.ok("asks" in book, "Book should have asks property");
  assert.ok("bids" in book, "Book should have bids property");
  assert.ok(Array.isArray(book.asks), "Book.asks should be an array");
  assert.ok(Array.isArray(book.bids), "Book.bids should be an array");

  if (book.asks.length > 0) {
    const ask = book.asks[0];
    expectPropertyTypes(ask, ["price", "amount"], "number");
  }

  if (book.bids.length > 0) {
    const bid = book.bids[0];
    expectPropertyTypes(bid, ["price", "amount"], "number");
  }
};
