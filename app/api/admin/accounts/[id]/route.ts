import { NextRequest, NextResponse } from "next/server";
import { requireUser, type AuthUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/roles";
import {
  deleteAccount,
  getAccount,
  replaceAccountAccess,
  updateAccountName,
  setAccountEnabled,
} from "@/lib/repositories/accounts.repository";
import { deleteAccountDraftResponses } from "@/lib/forms/account-role-change";
import { recordSecurityAuditEventSafely } from "@/lib/repositories/audit.repository";
import { isValidConfirmationPhrase } from "@/lib/confirmation-code";
import { isValidOrganizationGrant } from "@/lib/programs/catalog";
import {
  COORDINATOR_SCOPE_TYPES,
  ROLES,
  type CoordinatorScopeGrant,
  type CoordinatorScopeType,
  type Role,
} from "@/types";

async function authorize(): Promise<AuthUser | NextResponse> {
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
      role?: unknown;
      coordinatorGrants?: unknown;
    };

    if (
      body.action === "set_access" ||
      body.action === "promote" ||
      body.action === "demote"
    ) {
      const requestedRole =
        body.action === "promote"
          ? ROLES.ADMIN
          : body.action === "demote"
            ? ROLES.ALUMNI
            : body.role;
      const validRoles = new Set<Role>([
        ROLES.ADMIN,
        ROLES.COORDINATOR,
        ROLES.ALUMNI,
      ]);
      if (!validRoles.has(requestedRole as Role)) {
        return NextResponse.json(
          { success: false, message: "Select a valid account role." },
          { status: 400 },
        );
      }
      const targetRole = requestedRole as Role;
      const account = await getAccount(id);
      const expectedConfirmation =
        account.role === targetRole && targetRole === ROLES.COORDINATOR
          ? "UPDATE COORDINATOR ACCESS"
          : targetRole === ROLES.ADMIN
            ? "PROMOTE TO ADMIN"
            : targetRole === ROLES.COORDINATOR
              ? "PROMOTE TO COORDINATOR"
              : "DEMOTE TO ALUMNI";

      if (!isValidConfirmationPhrase(body.confirmation, expectedConfirmation)) {
        return NextResponse.json(
          {
            success: false,
            message: "The role-change confirmation is invalid.",
          },
          { status: 400 },
        );
      }

      if (auth.id === id && targetRole !== ROLES.ADMIN) {
        return NextResponse.json(
          { success: false, message: "You cannot demote your own account." },
          { status: 400 },
        );
      }

      if (account.role === targetRole && targetRole !== ROLES.COORDINATOR) {
        return NextResponse.json(
          { success: false, message: `This account is already ${targetRole}.` },
          { status: 409 },
        );
      }

      const rawGrants =
        targetRole === ROLES.COORDINATOR ? body.coordinatorGrants : [];
      if (!Array.isArray(rawGrants)) {
        return NextResponse.json(
          { success: false, message: "Coordinator assignments are required." },
          { status: 400 },
        );
      }
      if (rawGrants.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message: "Coordinator assignments cannot exceed 100 entries.",
          },
          { status: 400 },
        );
      }

      const scopeTypes = new Set<CoordinatorScopeType>(
        Object.values(COORDINATOR_SCOPE_TYPES),
      );
      const coordinatorGrants: CoordinatorScopeGrant[] = [];
      for (const value of rawGrants) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return NextResponse.json(
            { success: false, message: "A coordinator assignment is invalid." },
            { status: 400 },
          );
        }
        const grant = value as Record<string, unknown>;
        const normalized: CoordinatorScopeGrant = {
          scopeType: grant.scopeType as CoordinatorScopeType,
          campus: typeof grant.campus === "string" ? grant.campus.trim() : "",
          college:
            typeof grant.college === "string" && grant.college.trim()
              ? grant.college.trim()
              : null,
          program:
            typeof grant.program === "string" && grant.program.trim()
              ? grant.program.trim()
              : null,
        };
        if (
          !scopeTypes.has(normalized.scopeType) ||
          !isValidOrganizationGrant(normalized)
        ) {
          return NextResponse.json(
            { success: false, message: "A coordinator assignment is invalid." },
            { status: 400 },
          );
        }
        coordinatorGrants.push(normalized);
      }

      const uniqueGrants = [
        ...new Map(
          coordinatorGrants.map((grant) => [
            [grant.scopeType, grant.campus, grant.college, grant.program].join(
              "\u0000",
            ),
            grant,
          ]),
        ).values(),
      ];
      if (targetRole === ROLES.COORDINATOR && uniqueGrants.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Add at least one coordinator assignment.",
          },
          { status: 400 },
        );
      }

      const roleChanged = account.role !== targetRole;
      const updatedAccount = await replaceAccountAccess({
        id,
        role: targetRole,
        coordinatorGrants: uniqueGrants,
        actorUserId: auth.id,
      });
      const deletedDrafts = roleChanged
        ? await deleteAccountDraftResponses(id)
        : 0;
      await recordSecurityAuditEventSafely({
        actorUserId: auth.id,
        action: "account.role_changed",
        targetType: "account",
        targetId: id,
        metadata: {
          previousRole: account.role,
          role: targetRole,
          previousCoordinatorGrants: account.coordinatorGrants,
          coordinatorGrants: uniqueGrants,
          deletedDrafts,
        },
      });
      return NextResponse.json({
        success: true,
        account: updatedAccount,
        message:
          targetRole === ROLES.ADMIN
            ? "Account promoted to administrator."
            : targetRole === ROLES.COORDINATOR
              ? `${roleChanged ? "Account promoted" : "Access updated"} with ${uniqueGrants.length} coordinator assignment${uniqueGrants.length === 1 ? "" : "s"}.`
              : "Account changed to an alumni account.",
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

    if (!isValidConfirmationPhrase(body?.confirmation, "DELETE")) {
      return NextResponse.json(
        { success: false, message: "The deletion confirmation is invalid." },
        { status: 400 },
      );
    }

    const account = await getAccount(id);

    if (account.role !== ROLES.ALUMNI) {
      return NextResponse.json(
        {
          success: false,
          message: "Privileged accounts must be demoted before deletion.",
        },
        { status: 409 },
      );
    }

    if (user.id === id) {
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

    await setAccountEnabled(id, false);
    let deletedDrafts = 0;
    try {
      deletedDrafts = await deleteAccountDraftResponses(id);
      await deleteAccount(id);
    } catch (error) {
      await setAccountEnabled(id, true).catch(() => undefined);
      throw error;
    }
    await recordSecurityAuditEventSafely({
      actorUserId: user.id,
      action: "account.deleted",
      targetType: "account",
      targetId: id,
      metadata: { deletedDrafts },
    });

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
