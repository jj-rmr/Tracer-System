const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export type RateLimitClass = "auth" | "export" | "mutation";

export function classifyRateLimitedRequest(
  pathname: string,
  method: string,
): RateLimitClass | null {
  if (pathname.startsWith("/api/auth/")) return "auth";
  if (pathname.endsWith("/export")) return "export";
  if (MUTATING_METHODS.has(method.toUpperCase())) return "mutation";
  return null;
}
