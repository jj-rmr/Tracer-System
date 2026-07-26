import "server-only";

export function requiredServerEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(`Missing required server environment variable: ${name}`);
  return value;
}
