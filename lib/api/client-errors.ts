export function isNetworkError(error: unknown) {
  return (
    (typeof navigator !== "undefined" && !navigator.onLine) ||
    error instanceof TypeError
  );
}

export function friendlyRequestMessage(error: unknown, fallback: string) {
  if (isNetworkError(error)) {
    return "Your network connection was lost. Check your connection and try again.";
  }

  return fallback;
}
