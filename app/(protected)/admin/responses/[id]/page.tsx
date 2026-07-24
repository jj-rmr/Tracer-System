import { notFound } from "next/navigation";

import ResponseWorkspace from "@/components/responses/ResponseWorkspace";
import { formResponseToSurvey } from "@/lib/forms/graduate-tracer-adapter";
import {
  getFormResponseById,
  getFormResponseDocuments,
} from "@/lib/repositories/form-responses.repository";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResponseDetailsPage({ params }: Props) {
  const { id } = await params;
  const response = await getFormResponseById(id);
  if (!response) notFound();

  const responseView = formResponseToSurvey(
    response,
    await getFormResponseDocuments(response.id),
  );

  return (
    <ResponseWorkspace
      survey={responseView}
      isNew={false}
      updatedAt={response.updatedAt}
      responseId={response.id}
      readOnly
    />
  );
}
