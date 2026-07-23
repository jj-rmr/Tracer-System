import { NextRequest, NextResponse } from "next/server";
import { Models } from "node-appwrite";

import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/roles";
import {
  deleteAccount,
  getAccount,
  updateAccountName,
} from "@/lib/repositories/accounts.repository";
import {
  getFormResponseDocuments,
  listFormResponsesByUser,
} from "@/lib/repositories/form-responses.repository";
import { formResponseToSurvey } from "@/lib/forms/graduate-tracer-adapter";

async function authorize(): Promise<
  Models.User<Models.Preferences> | NextResponse
> {
  const { user } = await requireUser();

  if (!isAdmin(user)) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  return user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize();

  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const { id } = await params;

    const account = await getAccount(id);

    const response = (await listFormResponsesByUser(id))[0];
    const survey = response
      ? formResponseToSurvey(
          response,
          await getFormResponseDocuments(response.id),
        )
      : null;

    return NextResponse.json({
      success: true,
      account,
      survey,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load account details.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize();

  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const { id } = await params;
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required.",
        },
        {
          status: 400,
        },
      );
    }

    await updateAccountName(id, name.trim());

    return NextResponse.json({
      success: true,
      message: "Account updated successfully.",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update account.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize();

  if (auth instanceof NextResponse) {
    return auth;
  }

  const user = auth;

  try {
    const { id } = await params;

    if (user.$id === id) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot delete your own account.",
        },
        {
          status: 400,
        },
      );
    }

    await deleteAccount(id);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete account.",
      },
      {
        status: 500,
      },
    );
  }
}
