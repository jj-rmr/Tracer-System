const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function spreadsheetSafeValue(value: unknown) {
  if (typeof value !== "string" || !FORMULA_PREFIX.test(value)) return value;
  return `'${value}`;
}

export function spreadsheetSafeRecord(
  record: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      spreadsheetSafeValue(value),
    ]),
  );
}
