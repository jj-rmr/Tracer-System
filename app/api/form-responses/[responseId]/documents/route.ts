import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message:
        "This upload method is no longer available. Refresh the page and try again.",
    },
    { status: 410 },
  );
}
