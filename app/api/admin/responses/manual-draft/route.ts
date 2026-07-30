import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { formResponseToSurvey } from "@/lib/forms/graduate-tracer-adapter";
import {
  getFormResponseDocuments,
  listManualDraftsForAdmin,
} from "@/lib/repositories/form-responses.repository";
import { getStudyContext } from "@/lib/repositories/forms.repository";

export async function GET() {
  try {
    const admin = await requireAdmin();
    const drafts = await listManualDraftsForAdmin(admin.id);
    let draft = null;

    for (const candidate of drafts) {
      const context = await getStudyContext(candidate.response.studyPeriodId);
      if (context?.study.status === "open") {
        draft = candidate;
        break;
      }
    }

    if (!draft) {
      return NextResponse.json({ success: true, data: null });
    }

    const documents = await getFormResponseDocuments(draft.response.id);

    return NextResponse.json({
      success: true,
      data: {
        responseId: draft.response.id,
        studyId: draft.response.studyPeriodId,
        respondentEmail: draft.response.respondentEmail ?? "",
        importToken: draft.importToken,
        updatedAt: draft.response.updatedAt,
        response: formResponseToSurvey(draft.response, documents),
      },
    });
  } catch (error) {
    console.error("Failed to load manual response draft:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load the manual response draft." },
      { status: 500 },
    );
  }
}
