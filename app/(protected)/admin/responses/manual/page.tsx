import ManualResponseEntry from "@/components/admin/responses/ManualResponseEntry";
import { getAllowedProgramValues, requireStaff } from "@/lib/auth";
import { listStudyPeriodsForFormVersion } from "@/lib/repositories/forms.repository";

export default async function ManualResponsePage() {
  const staff = await requireStaff();

  const studies = (
    await listStudyPeriodsForFormVersion("graduate-tracer", 1)
  ).filter((study) => study.status !== "archived");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Add Manual Response
        </h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">
          Transcribe a historical response collected through Google Forms.
        </p>
      </header>

      <ManualResponseEntry
        studies={studies}
        allowedProgramValues={getAllowedProgramValues(staff)}
      />
    </div>
  );
}
