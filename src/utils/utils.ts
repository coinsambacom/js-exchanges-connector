export const parseBRLNumberString = (numberInString: string) => {
  const strFormatted = numberInString.replace(/\./g, "").replace(",", ".");

  return parseFloat(strFormatted);
};

export const isNumber = (value: any) =>
  typeof value === "number" && !isNaN(value);

export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = {} as Omit<T, K>;
  for (const key in obj) {
    if (!keys.includes(key as unknown as K)) {
      (result as any)[key] = obj[key];
    }
  }
  return result;
};
