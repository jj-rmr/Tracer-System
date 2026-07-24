import ResponseWorkspace from "@/components/responses/ResponseWorkspace";
import { requireUser } from "@/lib/auth";
import {
  formResponseToSurvey,
} from "@/lib/forms/graduate-tracer-adapter";
import {
  getFormResponse,
  getFormResponseDocuments,
  listFormResponsesByUser,
} from "@/lib/repositories/form-responses.repository";
import {
  getOpenStudyByFormSlug,
  getStudyContext,
} from "@/lib/repositories/forms.repository";
import { defaultSurvey } from "@/lib/surveys/defaults";

export default async function SurveyPage() {
  const { user } = await requireUser();
  const openContext = await getOpenStudyByFormSlug("graduate-tracer");
  const previousResponses = await listFormResponsesByUser(user.$id);
  const response = openContext
    ? await getFormResponse(openContext.study.id, user.$id)
    : previousResponses[0] ?? null;
  const context = openContext ??
    (response ? await getStudyContext(response.studyPeriodId) : null);
  const documents = response
    ? await getFormResponseDocuments(response.id)
    : [];

  if (!context) {
    return (
      <div className="w-full max-w-5xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-900">
        <h1 className="text-2xl font-semibold">No tracer study available</h1>
        <p className="mt-2 text-sm">
          There is no open study or previous response to display right now.
        </p>
      </div>
    );
  }

  const survey = response
    ? formResponseToSurvey(response, documents)
    : { ...defaultSurvey, userId: user.$id };
  const readOnly = context.study.status !== "open";

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="w-full max-w-5xl text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
          Academic Year {context.study.academicYear}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {context.study.title}
        </h1>
        <p className="text-slate-500">
          {readOnly
            ? "This study is closed. Your response is available in read-only mode."
            : "Please answer all fields completely and accurately."}
        </p>
      </div>
      <ResponseWorkspace
        survey={survey}
        isNew={!response}
        updatedAt={response?.updatedAt}
        responseId={response?.id}
        studyId={context.study.id}
        readOnly={readOnly}
      />
    </div>
  );
}
