import StudyScheduler from "@/components/admin/studies/StudyScheduler";
import { requireAdmin } from "@/lib/auth";
import {
  listPublishedFormVersions,
  listStudyPeriodSummaries,
} from "@/lib/repositories/study-admin.repository";

export default async function StudiesPage() {
  await requireAdmin();

  const [studies, formVersions] = await Promise.all([
    listStudyPeriodSummaries(),
    listPublishedFormVersions(),
  ]);

  return (
    <div className="w-full pb-16">
      <StudyScheduler initialData={{ studies, formVersions }} />
    </div>
  );
}
