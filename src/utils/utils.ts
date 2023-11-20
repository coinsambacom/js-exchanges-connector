export const parseBRLNumberString = (numberInString: string) => {
  const strFormatted = numberInString.replace(/\./g, "").replace(",", ".");

  return parseFloat(strFormatted);
};
