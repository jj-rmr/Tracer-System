import { NextResponse } from "next/server";
import { createDownloadResponse } from "@/lib/upload";

export async function POST(req: Request) {
  const formData = await req.formData();
  const name = formData.get("name")?.toString().trim() || "unknown";
  const formName = formData.get("formName")?.toString().trim() || "form";
  const file = formData.get("doc");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  return createDownloadResponse(file, name, formName);
}
