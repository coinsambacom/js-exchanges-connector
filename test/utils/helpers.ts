import { expect } from "chai";

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
    expect(obj).to.have.property(prop);

    /**
     * Checks if the property type matches the expected type using Jest's `expect(typeof obj[prop]).toBe(type)`.
     */
    expect(typeof obj[prop]).to.equal(type);
  }
}
