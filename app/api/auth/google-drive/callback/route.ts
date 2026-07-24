import { NextRequest, NextResponse } from "next/server";

import { createGoogleDriveAuthorizationClient } from "@/lib/google/oauth";

const STATE_COOKIE = "google_drive_oauth_state";

function noStoreJson(body: object, status = 200) {
  const response = NextResponse.json(body, { status });

  response.headers.set("Cache-Control", "no-store");
  response.cookies.delete(STATE_COOKIE);

  return response;
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }

  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(STATE_COOKIE)?.value;
  const googleError = request.nextUrl.searchParams.get("error");

  if (googleError) {
    return noStoreJson(
      { success: false, message: `Google authorization failed: ${googleError}` },
      400,
    );
  }

  if (!returnedState || !storedState || returnedState !== storedState) {
    return noStoreJson(
      { success: false, message: "Invalid Google Drive OAuth state." },
      400,
    );
  }

  if (!code) {
    return noStoreJson(
      { success: false, message: "Missing authorization code." },
      400,
    );
  }

  try {
    const googleClient = createGoogleDriveAuthorizationClient();
    const { tokens } = await googleClient.getToken(code);

    if (!tokens.refresh_token) {
      return noStoreJson(
        {
          success: false,
          message:
            "Google did not issue a refresh token. Revoke the app's access in your Google account, then authorize it again.",
        },
        400,
      );
    }

    return noStoreJson({
      success: true,
      environmentVariable: "GOOGLE_DRIVE_REFRESH_TOKEN",
      refreshToken: tokens.refresh_token,
      message:
        "Copy this refresh token into .env.local, then restart the development server. This response is not cached.",
    });
  } catch (error) {
    console.error(
      "Google Drive authorization callback failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noStoreJson(
      { success: false, message: "Google Drive authorization failed." },
      500,
    );
  }
}
