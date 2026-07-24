import ManualResponseEntry from "@/components/admin/responses/ManualResponseEntry";
import { requireAdmin } from "@/lib/auth";
import { listStudyPeriodsForFormVersion } from "@/lib/repositories/forms.repository";

export default async function ManualResponsePage() {
  await requireAdmin();

  const studies = (
    await listStudyPeriodsForFormVersion("graduate-tracer", 1)
  ).filter((study) => study.status !== "archived");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Add Manual Response
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Transcribe a historical response collected through Google Forms.
        </p>
      </header>

      <ManualResponseEntry studies={studies} />
    </div>
  );
}
