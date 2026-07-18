import { ID, Account, Users } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/appwrite/admin";
import { createSessionClient } from "@/lib/appwrite/session";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";
import { ROLES } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const { firstName, middleName, lastName, extensionName, email, password } =
      await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required fields.",
        },
        { status: 400 },
      );
    }

    if (!email.toLowerCase().endsWith("@parsu.edu.ph")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Only ParSU institutional email addresses are allowed.",
        },
        { status: 400 },
      );
    }

    let formattedExtension = "";

    const ext = extensionName?.trim() ?? "";

    if (ext) {
      const isJrSr = /^(jr|sr)\.?$/i.test(ext);
      const isRomanNumeral = /^[ivxldcm]+\.?$/i.test(ext);

      if (isJrSr) {
        const clean = ext.replace(/\.$/, "");

        formattedExtension =
          clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() + ".";
      } else if (isRomanNumeral) {
        formattedExtension = ext.replace(/\.$/, "").toUpperCase();
      } else {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid Extension Name. Only Jr., Sr., or Roman numerals are allowed.",
          },
          { status: 400 },
        );
      }
    }

    const fullName = [
      firstName.trim(),
      middleName?.trim(),
      lastName.trim(),
      formattedExtension,
    ]
      .filter(Boolean)
      .join(" ");

    const adminClient = createAdminClient();

    const adminAccount = new Account(adminClient);
    const users = new Users(adminClient);

    // Create account
    const createdUser = await adminAccount.create(
      ID.unique(),
      email,
      password,
      fullName,
    );

    // Assign default role FIRST
    await users.updateLabels(createdUser.$id, [ROLES.ALUMNI]);
    // Add user preferences
    await users.updatePrefs(createdUser.$id, {
      firstName,
      middleName,
      lastName,
      extensionName,
    });
    // Verify labels
    const updatedUser = await users.get(createdUser.$id);

    // Create session after role assignment
    const session = await adminAccount.createEmailPasswordSession(
      email,
      password,
    );

    const sessionAccount = new Account(createSessionClient(session.secret));

    const user = await sessionAccount.get();

    console.log("REGISTERED USER:", {
      id: user.$id,
      labels: updatedUser.labels,
    });

    const response = NextResponse.json({
      success: true,
      user: updatedUser,
    });

    response.cookies.set(AUTH_COOKIE, session.secret, {
      ...COOKIE_OPTIONS,
      expires: new Date(session.expire),
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message ?? "Failed to create account.",
      },
      {
        status: 400,
      },
    );
  }
}
