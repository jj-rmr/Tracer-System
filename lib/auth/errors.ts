export function isInvalidSessionError(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return false;

  return error.code === 401;
}
