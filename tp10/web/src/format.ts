/**
 * Given. Numbers written the French way: a comma for decimals, a space every
 * three digits. toLocaleString puts a narrow no-break space there; it is
 * turned into a plain space, the one the tests look for.
 */

function fr(value: number): string {
  return value.toLocaleString('fr-FR').replace(/\s/g, ' ');
}

/** 7.25 → "7,25 milliards", 0.615 → "615 millions" */
export function formatParameters(billions: number): string {
  if (billions >= 1) return `${fr(billions)} milliards`;
  return `${fr(Math.round(billions * 1000))} millions`;
}

/** 1420000 → "1 420 000" */
export function formatDownloads(downloads: number): string {
  return fr(downloads);
}
