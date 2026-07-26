import { NextRequest, NextResponse } from "next/server";
import { Models } from "node-appwrite";

import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/roles";
import {
  deleteAccount,
  getAccount,
  updateAccountRole,
  updateAccountName,
} from "@/lib/repositories/accounts.repository";
import { deleteAccountDraftResponses } from "@/lib/forms/account-role-change";

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

    return NextResponse.json({
      success: true,
      account,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load account details.",
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
    const body = (await request.json()) as {
      action?: unknown;
      confirmation?: unknown;
      name?: unknown;
    };

    if (body.action === "promote" || body.action === "demote") {
      const targetRole = body.action === "promote" ? "admin" : "alumni";
      const expectedConfirmation =
        targetRole === "admin" ? "PROMOTE TO ADMIN" : "DEMOTE TO ALUMNI";

      if (body.confirmation !== expectedConfirmation) {
        return NextResponse.json(
          {
            success: false,
            message: "The role-change confirmation is invalid.",
          },
          { status: 400 },
        );
      }

      if (auth.$id === id && targetRole !== "admin") {
        return NextResponse.json(
          { success: false, message: "You cannot demote your own account." },
          { status: 400 },
        );
      }

      const account = await getAccount(id);
      if (account.role === targetRole) {
        return NextResponse.json(
          { success: false, message: `This account is already ${targetRole}.` },
          { status: 409 },
        );
      }

      const deletedDrafts = await deleteAccountDraftResponses(id);
      await updateAccountRole(id, targetRole);
      return NextResponse.json({
        success: true,
        message:
          targetRole === "admin"
            ? `Account promoted to administrator. ${deletedDrafts} draft response${deletedDrafts === 1 ? " was" : "s were"} permanently deleted.`
            : `Administrator changed to an alumni account. ${deletedDrafts} draft response${deletedDrafts === 1 ? " was" : "s were"} permanently deleted.`,
      });
    }

    const name = typeof body.name === "string" ? body.name : "";

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
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update account.",
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
    const body = (await request.json().catch(() => null)) as {
      confirmation?: unknown;
    } | null;

    if (body?.confirmation !== "DELETE ACCOUNT") {
      return NextResponse.json(
        { success: false, message: "The deletion confirmation is invalid." },
        { status: 400 },
      );
    }

    const account = await getAccount(id);

    if (account.role === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator accounts must be demoted before deletion.",
        },
        { status: 409 },
      );
    }

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

    const deletedDrafts = await deleteAccountDraftResponses(id);
    await deleteAccount(id);

    return NextResponse.json({
      success: true,
      message: `Account deleted successfully. ${deletedDrafts} draft response${deletedDrafts === 1 ? " was" : "s were"} permanently deleted.`,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete account.",
      },
      {
        status: 500,
      },
    );
  }
}
