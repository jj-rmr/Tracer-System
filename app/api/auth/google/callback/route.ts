import { Account, ID, Query, Users } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/appwrite/admin";
import { AUTH_COOKIE, COOKIE_OPTIONS, getRole } from "@/lib/auth";
import { createGoogleSignInClient } from "@/lib/google/oauth";
import { ROLES } from "@/types";

const STATE_COOKIE = "google_oauth_state";

function redirectAfterOAuth(url: URL) {
  const response = NextResponse.redirect(url);

  response.headers.set("Cache-Control", "no-store");
  response.cookies.delete(STATE_COOKIE);

  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const returnedState = searchParams.get("state");
  const storedState = request.cookies.get(STATE_COOKIE)?.value;
  const code = searchParams.get("code");

  if (!code) {
    return redirectAfterOAuth(new URL("/signin?error=oauth_failed", origin));
  }

  if (!returnedState || !storedState || returnedState !== storedState) {
    return redirectAfterOAuth(
      new URL("/signin?error=invalid_oauth_state", origin),
    );
  }

  try {
    const googleClient = createGoogleSignInClient();
    const { tokens } = await googleClient.getToken(code);

    if (!tokens.access_token) {
      throw new Error("Google token exchange did not return an access token");
    }

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    const googleUser = await userResponse.json();

    if (!userResponse.ok) {
      throw new Error("Failed to retrieve Google user information");
    }

    if (!googleUser.email_verified || !googleUser.email) {
      return redirectAfterOAuth(
        new URL("/signin?error=unverified_email", origin),
      );
    }

    const email = googleUser.email.trim().toLowerCase();

    if (!email.endsWith("@parsu.edu.ph")) {
      return redirectAfterOAuth(
        new URL("/signin?error=unauthorized_domain", origin),
      );
    }

    const users = new Users(createAdminClient());
    const existingUsers = await users.list({
      queries: [Query.equal("email", [email])],
    });

    let appwriteUser = existingUsers.users[0];

    if (!appwriteUser) {
      appwriteUser = await users.create({
        userId: ID.unique(),
        email,
        name: googleUser.name ?? email.split("@")[0],
      });

      appwriteUser = await users.updateLabels({
        userId: appwriteUser.$id,
        labels: [ROLES.ALUMNI],
      });

      appwriteUser = await users.updateEmailVerification({
        userId: appwriteUser.$id,
        emailVerification: true,
      });
    }

    const googleName = googleUser.name ?? email.split("@")[0];

    if (appwriteUser.name !== googleName) {
      appwriteUser = await users.updateName({
        userId: appwriteUser.$id,
        name: googleName,
      });
    }

    const token = await users.createToken({
      userId: appwriteUser.$id,
    });
    const account = new Account(createAdminClient());
    const session = await account.createSession({
      userId: token.userId,
      secret: token.secret,
    });
    const role = getRole(appwriteUser);
    const destination =
      role === ROLES.ADMIN
        ? "/admin"
        : role === ROLES.ALUMNI
          ? "/alumni"
          : "/unauthorized";
    const response = redirectAfterOAuth(new URL(destination, origin));

    response.cookies.set(AUTH_COOKIE, session.secret, {
      ...COOKIE_OPTIONS,
      expires: new Date(session.expire),
    });
    return response;
  } catch (error) {
    console.error(
      "Google OAuth callback error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return redirectAfterOAuth(new URL("/signin?error=oauth_failed", origin));
  }
}
