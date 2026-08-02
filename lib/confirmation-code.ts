const CONFIRMATION_CODE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function createConfirmationCode() {
  const values = crypto.getRandomValues(new Uint32Array(8));
  return Array.from(
    values,
    (value) =>
      CONFIRMATION_CODE_CHARACTERS[value % CONFIRMATION_CODE_CHARACTERS.length],
  ).join("");
}

export function isValidConfirmationPhrase(value: unknown, action: string) {
  return (
    typeof value === "string" &&
    new RegExp(`^${action} [A-Z0-9]{8}$`).test(value)
  );
}
