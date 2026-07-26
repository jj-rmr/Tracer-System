import type { FormResponseSource, StudyPeriodStatus } from "@/types";

export function canChangeResponseDocuments({
  source,
  studyStatus,
}: {
  source: FormResponseSource;
  studyStatus: StudyPeriodStatus;
}) {
  return source === "admin_import" || studyStatus === "open";
}
