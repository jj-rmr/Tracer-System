export function isNetworkError(error: unknown) {
  return (
    (typeof navigator !== "undefined" && navigator.onLine === false) ||
    error instanceof TypeError
  );
}

export function friendlyRequestMessage(error: unknown, fallback: string) {
  if (isNetworkError(error)) {
    return "Your network connection was lost. Check your connection and try again.";
  }

  return fallback;
}

export async function readApiJson<T>(response: Response, fallback: string) {
  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error(fallback);
  }

  if (!response.ok) {
    const message =
      result &&
      typeof result === "object" &&
      "message" in result &&
      typeof result.message === "string"
        ? result.message
        : fallback;
    throw new Error(message);
  }

  return result as T;
}
