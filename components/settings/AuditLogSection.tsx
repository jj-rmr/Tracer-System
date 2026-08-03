"use client";

import { useEffect, useState } from "react";

import ExportButton from "@/components/admin/ExportButton";
import { SelectField } from "@/components/forms/SelectField";
import { Button } from "@/components/ui/button";
import { LuEye, LuHistory } from "@/components/ui/icons";
import Modal from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableContentState } from "@/components/ui/table-content-state";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { SecurityAuditEvent } from "@/types";

const ACTION_LABELS: Record<string, string> = {
  "account.deleted": "Deleted an account",
  "account.name_changed": "Changed an account name",
  "account.role_changed": "Changed account access",
  "accounts.exported": "Exported accounts",
  "activity_log.exported": "Exported the activity log",
  "authentication.signed_in": "Signed in",
  "authentication.signed_out": "Signed out",
  "document.deleted": "Deleted a response document",
  "document.uploaded": "Uploaded a response document",
  "file.deleted": "Deleted an Admin Files item",
  "file.folder_created": "Created an Admin Files folder",
  "file.hierarchy_generated": "Generated Admin Files folders",
  "file.hierarchy_initialized": "Initialized Drive folders",
  "file.moved": "Moved an Admin Files item",
  "file.renamed": "Renamed an Admin Files item",
  "file.uploaded": "Uploaded an Admin Files item",
  "response.deleted": "Deleted a response",
  "response.drive_organized": "Organized a response folder",
  "response.manual_created": "Created a manual response",
  "response.manual_import_status_changed": "Changed manual import status",
  "response.manual_updated": "Updated a manual response",
  "response.saved": "Saved a tracer response",
  "responses.exported": "Exported tracer responses",
  "study.archived": "Archived a study period",
  "study.created": "Created a study period",
  "study.deleted": "Deleted a study period",
  "study.schedule_changed": "Changed a study schedule",
  "study.status_changed": "Changed study status",
};

const CATEGORY_OPTIONS = [
  { value: "", label: "All activity" },
  { value: "authentication", label: "Authentication" },
  { value: "account", label: "Accounts" },
  { value: "study", label: "Studies" },
  { value: "response", label: "Responses" },
  { value: "document", label: "Documents" },
  { value: "file", label: "Admin Files" },
];

interface AuditResponse {
  success: boolean;
  events?: SecurityAuditEvent[];
  total?: number;
  message?: string;
}

function actionLabel(action: string) {
  return (
    ACTION_LABELS[action] ??
    action
      .replaceAll(".", " ")
      .replaceAll("_", " ")
      .replace(/^./, (letter) => letter.toUpperCase())
  );
}

function targetLabel(event: SecurityAuditEvent) {
  const type = event.targetType.replaceAll("_", " ");
  return event.targetId ? `${type} / ${event.targetId}` : type;
}

function metadataText(metadata: Record<string, unknown>) {
  const text = JSON.stringify(metadata, null, 2);
  return text.length > 4000 ? `${text.slice(0, 4000)}\n...` : text;
}

export function AuditLogSection() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<SecurityAuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const search = useDebouncedValue(searchInput, 250);
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (!open || searchInput !== search) return;

    let cancelled = false;
    const controller = new AbortController();

    async function loadEvents() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (search.trim()) params.set("search", search.trim());
        if (category) params.set("category", category);

        const response = await fetch(`/api/admin/audit-events?${params}`, {
          cache: "no-store",
          credentials: "include",
          signal: controller.signal,
        });
        const data = (await response.json()) as AuditResponse;
        if (!response.ok || !data.success) {
          throw new Error(data.message ?? "Failed to load the activity log.");
        }

        if (!cancelled) {
          setEvents(data.events ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (loadError) {
        if (controller.signal.aborted) return;
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load the activity log.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvents();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [category, open, page, reloadKey, search, searchInput]);

  const exportParams = new URLSearchParams();
  if (search.trim()) exportParams.set("search", search.trim());
  if (category) exportParams.set("category", category);
  const exportUrl = `/api/admin/audit-events/export${
    exportParams.size > 0 ? `?${exportParams}` : ""
  }`;

  return (
    <>
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-2xl bg-secondary p-3 text-muted-foreground">
              <LuHistory aria-hidden="true" size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                Activity log
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Review completed sign-ins, data changes, exports, uploads, and
                administrative operations.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setLoading(true);
              setOpen(true);
            }}
          >
            <LuEye aria-hidden="true" animated />
            View activity log
          </Button>
        </div>
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Activity log"
        description="Review sign-ins, data changes, exports, uploads, and administrative operations."
        width="xl"
        bodyClassName="p-0"
        footerClassName="justify-between"
        footer={
          <>
            <p className="text-sm text-muted-foreground">
              {total === 0
                ? "0 events"
                : `${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total} events`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <span className="min-w-20 text-center text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </>
        }
      >
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-[minmax(0,1fr)_15rem_auto] md:items-end md:p-6">
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Search activity
            </span>
            <SearchInput
              aria-label="Search activity"
              placeholder="Actor, action, or record ID"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <SelectField
            id="audit-category"
            label="Activity type"
            value={category}
            onChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            options={CATEGORY_OPTIONS}
            placeholder="All activity"
          />
          <ExportButton
            baseUrl={exportUrl}
            formats={["csv"]}
            label="Export CSV"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableContentState
                colSpan={4}
                loadingMessage="Loading activity..."
              />
            ) : error ? (
              <TableContentState
                colSpan={4}
                error={error}
                retryLabel="Try again"
                onRetry={() => setReloadKey((value) => value + 1)}
              />
            ) : events.length === 0 ? (
              <TableContentState colSpan={4}>
                <div className="flex min-h-64 items-center justify-center text-center text-sm text-muted-foreground">
                  No matching activity was found.
                </div>
              </TableContentState>
            ) : (
              events.map((event) => {
                const hasMetadata = Object.keys(event.metadata).length > 0;
                return (
                  <TableRow key={event.id}>
                    <TableCell className="min-w-44 whitespace-nowrap text-muted-foreground">
                      <time dateTime={event.createdAt}>
                        {new Intl.DateTimeFormat(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(event.createdAt))}
                      </time>
                    </TableCell>
                    <TableCell className="min-w-52">
                      <p className="font-medium text-foreground">
                        {event.actorName ?? "Unknown user"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.actorEmail ?? event.actorUserId}
                      </p>
                    </TableCell>
                    <TableCell className="min-w-64">
                      <p className="font-medium text-foreground">
                        {actionLabel(event.action)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {targetLabel(event)}
                      </p>
                    </TableCell>
                    <TableCell className="min-w-40">
                      {hasMetadata ? (
                        <details>
                          <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                            View details
                          </summary>
                          <pre className="mt-2 max-w-md overflow-auto whitespace-pre-wrap break-words rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">
                            {metadataText(event.metadata)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Modal>
    </>
  );
}
