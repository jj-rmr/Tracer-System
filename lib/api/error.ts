// error.ts
import { NextResponse } from "next/server";

export function fail(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    },
  );
}
