import { permanentRedirect } from "next/navigation";

export default function LegacySurveyPage() {
  permanentRedirect("/alumni/responses");
}
