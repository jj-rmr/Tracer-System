import "server-only";

export const EXTERNAL_TIMEOUTS = {
  database: 10_000,
  authentication: 10_000,
  mutation: 15_000,
  driveMetadata: 15_000,
  driveTransfer: 60_000,
} as const;

export function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs: number = EXTERNAL_TIMEOUTS.database,
) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;

  return fetch(input, { ...init, signal });
}

export async function withExternalTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = EXTERNAL_TIMEOUTS.mutation,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("External service request timed out.")),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
