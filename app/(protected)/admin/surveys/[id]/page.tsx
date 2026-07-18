import SurveyContainer from "@/components/surveys/SurveyContainer";
import SurveyDetails from "@/components/surveys/SurveyDetails";
import { getSurveyByUserId } from "@/lib/repositories/surveys.repository";
import { defaultSurvey } from "@/lib/survey/defaults";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function SurveyDetailsPage({ params }: Props) {
  const user = await params;
  const existingSurvey = await getSurveyByUserId(user.id);

  return (
    <SurveyContainer
      survey={{
        ...defaultSurvey,
        ...(existingSurvey ?? {}),
      }}
      isNew={!existingSurvey}
      updatedAt={existingSurvey?.updatedAt}
      surveyId={existingSurvey?.id}
      readOnly={true}
    />
  );
}
