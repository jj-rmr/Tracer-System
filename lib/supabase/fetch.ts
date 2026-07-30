import { fetchWithTimeout } from "@/lib/server/timeouts";
import { isFutureIssuedJwtError } from "./errors";

const CLOCK_SKEW_RETRY_DELAYS_MS = [750, 1_500] as const;

async function responseHasFutureIssuedJwtError(response: Response) {
  if (response.status !== 401) return false;

  try {
    return isFutureIssuedJwtError(await response.clone().json());
  } catch {
    return false;
  }
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function fetchSupabase(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  for (let attempt = 0; ; attempt += 1) {
    const request = input instanceof Request ? input.clone() : input;
    const response = await fetchWithTimeout(request, init);

    if (!(await responseHasFutureIssuedJwtError(response))) return response;

    const delay = CLOCK_SKEW_RETRY_DELAYS_MS[attempt];
    if (delay === undefined) return response;

    await wait(delay);
  }
}
