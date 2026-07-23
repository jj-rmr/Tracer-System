import { NextRequest, NextResponse } from "next/server";
import { ID, Query, Users } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite/admin";
import { Account } from "node-appwrite";

import { AUTH_COOKIE, COOKIE_OPTIONS, getRole } from "@/lib/auth";
import { ROLES } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const returnedState = searchParams.get("state");
  const storedState = request.cookies.get("google_oauth_state")?.value;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/signin?error=oauth_failed", origin));
  }

  if (!returnedState || !storedState || returnedState !== storedState) {
    return NextResponse.redirect(
      new URL("/signin?error=invalid_oauth_state", origin),
    );
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_AUTH_CLIENT_ID!,
        client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_AUTH_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok || !tokens.access_token) {
      throw new Error("Google token exchange failed");
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
      return NextResponse.redirect(
        new URL("/signin?error=unverified_email", origin),
      );
    }

    const email = googleUser.email.trim().toLowerCase();

    if (!email.endsWith("@parsu.edu.ph")) {
      console.log("Rejected unauthorized email:", email);

      return NextResponse.redirect(
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

    const response = NextResponse.redirect(new URL(destination, origin));

    response.cookies.set(AUTH_COOKIE, session.secret, {
      ...COOKIE_OPTIONS,
      expires: new Date(session.expire),
    });
    response.cookies.delete("google_oauth_state");

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);

    return NextResponse.redirect(new URL("/signin?error=oauth_failed", origin));
  }
}
