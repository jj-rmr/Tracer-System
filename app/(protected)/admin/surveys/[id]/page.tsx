import SurveyDetails from "@/components/surveys/SurveyDetails";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function SurveyDetailsPage({ params }: Props) {
  const { id } = await params;

  return <SurveyDetails id={id} />;
}
