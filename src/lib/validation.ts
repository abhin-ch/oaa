/** Parse a string to a non-negative number, returning 0 for invalid/negative values. */
export function parsePositiveNumber(raw: string): number {
  const num = parseFloat(raw);
  return isNaN(num) || num < 0 ? 0 : num;
}
