type PostgrestError = {
  code?: unknown;
  message?: unknown;
};

export function isFutureIssuedJwtError(payload: unknown) {
  if (!payload || typeof payload !== "object") return false;

  const error = payload as PostgrestError;
  return (
    error.code === "PGRST303" &&
    typeof error.message === "string" &&
    error.message.toLowerCase().includes("jwt issued at future")
  );
}
