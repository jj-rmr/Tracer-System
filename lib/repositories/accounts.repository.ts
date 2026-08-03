import type { AuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
import {
  ROLES,
  type CoordinatorScopeGrant,
  type CoordinatorScopeType,
  type Role,
} from "@/types";
import { EXTERNAL_TIMEOUTS, withExternalTimeout } from "@/lib/server/timeouts";

interface AccountRow {
  id: string;
  provider_user_id: string | null;
  name: string;
  email: string;
  picture_url: string | null;
  role: Role;
  email_verified: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  coordinator_scope_grants?: CoordinatorGrantRow[];
}

interface CoordinatorGrantRow {
  id: string;
  scope_type: CoordinatorScopeType;
  campus: string;
  college: string | null;
  program: string | null;
}

function mapCoordinatorGrant(
  grant: CoordinatorGrantRow,
): CoordinatorScopeGrant {
  return {
    id: grant.id,
    scopeType: grant.scope_type,
    campus: grant.campus,
    college: grant.college,
    program: grant.program,
  };
}

export function getProfilePictureUrl(user: AuthUser) {
  return user.pictureUrl;
}

export function formatAccount(row: AccountRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    pictureUrl: row.picture_url,
    role: row.role,
    coordinatorGrants: (row.coordinator_scope_grants ?? []).map(
      mapCoordinatorGrant,
    ),
    verified: row.email_verified,
    enabled: row.enabled,
    labels: [row.role],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAccount(id: string) {
  const { data, error } = await withExternalTimeout(
    Promise.resolve(
      supabase
        .from("auth_accounts")
        .select(
          "*, coordinator_scope_grants!coordinator_scope_grants_account_id_fkey(*)",
        )
        .eq("id", id)
        .single<AccountRow>(),
    ),
    EXTERNAL_TIMEOUTS.authentication,
  );
  if (error) throw error;
  return formatAccount(data);
}

export async function getAllAccounts() {
  const { data, error } = await withExternalTimeout(
    Promise.resolve(
      supabase
        .from("auth_accounts")
        .select(
          "*, coordinator_scope_grants!coordinator_scope_grants_account_id_fkey(*)",
        )
        .order("created_at"),
    ),
    EXTERNAL_TIMEOUTS.authentication,
  );
  if (error) throw error;
  return (data as AccountRow[]).map(formatAccount);
}

export async function updateAccountName(id: string, name: string) {
  const { error } = await withExternalTimeout(
    Promise.resolve(
      supabase.from("auth_accounts").update({ name }).eq("id", id),
    ),
    EXTERNAL_TIMEOUTS.authentication,
  );
  if (error) throw error;
}

export async function replaceAccountAccess({
  id,
  role,
  coordinatorGrants,
  actorUserId,
}: {
  id: string;
  role: Role;
  coordinatorGrants: CoordinatorScopeGrant[];
  actorUserId: string;
}) {
  const roleChangeNotice =
    role === ROLES.ADMIN
      ? "You have been promoted to admin."
      : role === ROLES.COORDINATOR
        ? "Your coordinator access has been updated."
        : "You have been changed to an alumni account.";
  const { error } = await withExternalTimeout(
    Promise.resolve(
      supabase.rpc("replace_account_access", {
        target_account_id: id,
        next_role: role,
        next_grants: coordinatorGrants,
        actor_account_id: actorUserId,
        next_notice: roleChangeNotice,
      }),
    ),
    EXTERNAL_TIMEOUTS.authentication,
  );
  if (error) throw error;
  return getAccount(id);
}

export async function deleteAccount(id: string) {
  const { data, error } = await supabase
    .from("auth_accounts")
    .select("provider_user_id")
    .eq("id", id)
    .single<{ provider_user_id: string | null }>();
  if (error) throw error;

  if (data.provider_user_id) {
    const { error: authError } = await supabase.auth.admin.deleteUser(
      data.provider_user_id,
    );
    if (authError) throw authError;
  }

  const { error: deleteError } = await supabase
    .from("auth_accounts")
    .delete()
    .eq("id", id);
  if (deleteError) throw deleteError;
}

export async function setAccountEnabled(id: string, enabled: boolean) {
  const { error } = await withExternalTimeout(
    Promise.resolve(
      supabase.from("auth_accounts").update({ enabled }).eq("id", id),
    ),
    EXTERNAL_TIMEOUTS.authentication,
  );
  if (error) throw error;
}
