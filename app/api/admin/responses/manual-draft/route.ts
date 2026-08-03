import { NextResponse } from "next/server";

import { canManageResponse, requireStaff } from "@/lib/auth";
import { formResponseToSurvey } from "@/lib/forms/graduate-tracer-adapter";
import {
  getLatestOpenManualDraftForAdmin,
  getFormResponseDocuments,
} from "@/lib/repositories/form-responses.repository";

export async function GET() {
  try {
    const staff = await requireStaff();
    const draft = await getLatestOpenManualDraftForAdmin(staff.id);

    if (!draft || !canManageResponse(staff, draft.response)) {
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
