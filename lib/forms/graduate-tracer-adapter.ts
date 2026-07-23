import { graduateTracerV1 } from "@/lib/forms/registry";
import { defaultSurvey } from "@/lib/surveys/defaults";
import { FormResponse, Survey, SurveyDocument } from "@/types";

const answerKeys = graduateTracerV1.sections.flatMap(
  (section) => section.fieldKeys,
);

export function surveyToAnswers(survey: Survey): Record<string, unknown> {
  const values = survey as unknown as Record<string, unknown>;

  return Object.fromEntries(answerKeys.map((key) => [key, values[key]]));
}

export function formResponseToSurvey(
  response: FormResponse,
  documents: SurveyDocument[] = [],
): Survey {
  return {
    ...defaultSurvey,
    ...(response.answers as Partial<Survey>),
    id: response.id,
    userId: response.userId ?? "",
    documents,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
}
