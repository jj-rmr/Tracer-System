// success.ts
import { NextResponse } from "next/server";

export function ok(data: unknown) {
  return NextResponse.json({
    success: true,
    data,
  });
}
