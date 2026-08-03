import "server-only";

import type { AuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
import type { SecurityAuditEvent } from "@/types";

interface SecurityAuditEventRow {
  id: string;
  actor_user_id: string;
  actor_name: string | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

type AuditActor = Pick<AuthUser, "id" | "name" | "email">;

type AuditEventDetails = {
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

export async function recordSecurityAuditEvent({
  actorUserId,
  actorName,
  actorEmail,
  action,
  targetType,
  targetId,
  metadata = {},
}: {
  actorUserId: string;
  actorName?: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("security_audit_events").insert({
    actor_user_id: actorUserId,
    actor_name: actorName ?? null,
    actor_email: actorEmail ?? null,
    action,
    target_type: targetType,
    target_id: targetId ?? null,
    metadata,
  });

  if (error) throw error;
}

export function recordUserAuditEvent(
  actor: AuditActor,
  event: AuditEventDetails,
) {
  return recordSecurityAuditEvent({
    actorUserId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    ...event,
  });
}

export async function recordSecurityAuditEventSafely(
  event: Parameters<typeof recordSecurityAuditEvent>[0],
) {
  try {
    await recordSecurityAuditEvent(event);
    return true;
  } catch (error) {
    console.error("Failed to record security audit event:", {
      action: event.action,
      targetType: event.targetType,
      error,
    });
    return false;
  }
}

export function recordUserAuditEventSafely(
  actor: AuditActor,
  event: AuditEventDetails,
) {
  return recordSecurityAuditEventSafely({
    actorUserId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    ...event,
  });
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function mapAuditEvent(row: SecurityAuditEventRow): SecurityAuditEvent {
  return {
    id: row.id,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    actorEmail: row.actor_email,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

export async function listSecurityAuditEvents({
  page,
  limit,
  search,
  category,
}: {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}) {
  const from = (page - 1) * limit;
  let query = supabase
    .from("security_audit_events")
    .select(
      "id,actor_user_id,actor_name,actor_email,action,target_type,target_id,metadata,created_at",
      { count: "exact" },
    );

  if (search) {
    query = query.ilike(
      "search_text",
      `%${escapeLikePattern(search.toLowerCase())}%`,
    );
  }

  if (category) {
    if (category === "account") {
      query = query.or("action.like.account.%,action.like.accounts.%");
    } else if (category === "response") {
      query = query.or("action.like.response.%,action.like.responses.%");
    } else {
      query = query.like("action", `${escapeLikePattern(category)}.%`);
    }
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw error;

  return {
    events: (data as SecurityAuditEventRow[]).map(mapAuditEvent),
    total: count ?? 0,
  };
}
