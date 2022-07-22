export const isNumber = (value: any) =>
  value != null && !Number.isNaN(Number(value));
