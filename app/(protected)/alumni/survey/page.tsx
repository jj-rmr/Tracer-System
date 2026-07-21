// app/alumni/survey/page.tsx

import { requireUser } from "@/lib/auth";
import { getSurveyByUserId } from "@/lib/repositories/surveys.repository";
import { defaultSurvey } from "@/lib/survey/defaults";
import SurveyContainer from "@/components/surveys/SurveyContainer";

export default async function SurveyPage() {
  const { user } = await requireUser();

  const existingSurvey = await getSurveyByUserId(user.$id);

  return (
    <div className="flex flex-col gap-8 items-center justify-center">
      <div className="text-left w-full max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Alumni Tracer Survey
        </h1>
        <p className="text-slate-500">
          Please answer all fields completely and accurately.
        </p>
      </div>
      <SurveyContainer
        survey={{
          ...defaultSurvey,
          ...(existingSurvey ?? {}),
          userId: user.$id,
        }}
        isNew={!existingSurvey}
        updatedAt={existingSurvey?.updatedAt}
        surveyId={existingSurvey?.id}
        readOnly={false}
      />
    </div>
  );
}
