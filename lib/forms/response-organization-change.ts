const ORGANIZATION_FIELD_KEYS = [
  "firstName",
  "middleName",
  "lastName",
  "extensionName",
  "program",
] as const;

export function hasResponseOrganizationChanged(
  previousAnswers: Record<string, unknown> | null,
  nextAnswers: Record<string, unknown>,
) {
  if (!previousAnswers) return true;

  return ORGANIZATION_FIELD_KEYS.some(
    (key) => previousAnswers[key] !== nextAnswers[key],
  );
}
