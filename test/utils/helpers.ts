import { expect } from "chai";
import { IOrderbook, ITicker } from "../../src/utils/DTOs";

/**
 * Verifies the property types of an object using Jest assertions.
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
    /**
     * Checks if the property is present in the object using Jest's `expect(obj).toHaveProperty(prop)`.
     */
    expect(obj).to.have.property(String(prop));

    /**
     * Checks if the property type matches the expected type using Jest's `expect(typeof obj[prop]).toBe(type)`.
     */
    expect(typeof obj[prop]).to.equal(type);
  }
}

/**
 *
 * TODO update typescript, use another package builder and uncomment this function:
 */

// export function expectPropertyTypes<T = ITicker | IOrderbookOrder>(
//   obj: T,
//   properties: (keyof T)[],
//   type: string,
// ) {
//   for (const prop of properties) {
//     /**
//      * Checks if the property is present in the object using Jest's `expect(obj).toHaveProperty(prop)`.
//      */
//     expect(obj).to.have.property(String(prop));

//     /**
//      * Checks if the property type matches the expected type using Jest's `expect(typeof obj[prop]).toBe(type)`.
//      */
//     expect(typeof obj[prop]).to.equal(type);
//   }
// }

export const testAllTickers = (tickers: ITicker[]) => {
  expect(Array.isArray(tickers)).to.be.true;

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
  expect(book).to.have.property("asks");
  expect(book).to.have.property("bids");
  expect(Array.isArray(book.asks)).to.be.true;
  expect(Array.isArray(book.bids)).to.be.true;

  if (book.asks.length > 0) {
    const ask = book.asks[0];
    expectPropertyTypes(ask, ["price", "amount"], "number");
  }

  if (book.bids.length > 0) {
    const bid = book.bids[0];
    expectPropertyTypes(bid, ["price", "amount"], "number");
  }
};
