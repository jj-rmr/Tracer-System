import "server-only";

import { supabase } from "@/lib/supabase/server";

export async function recordSecurityAuditEvent({
  actorUserId,
  action,
  targetType,
  targetId,
  metadata = {},
}: {
  actorUserId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("security_audit_events").insert({
    actor_user_id: actorUserId,
    action,
    target_type: targetType,
    target_id: targetId ?? null,
    metadata,
  });

  if (error) throw error;
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
