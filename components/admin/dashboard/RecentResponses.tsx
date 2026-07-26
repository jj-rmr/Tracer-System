"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight } from "react-icons/lu";

import ManualResponseEditor from "@/components/admin/responses/ManualResponseEditor";
import ReadOnlyResponseDetails from "@/components/responses/ReadOnlyResponseDetails";
import LoadingState from "@/components/ui/LoadingState";
import Modal from "@/components/ui/Modal";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { AdminResponseSummary, Survey } from "@/types";

interface RecentResponsesProps {
  responses: AdminResponseSummary[];
}

interface ResponseMetadata {
  source: "alumni" | "admin_import";
  respondentEmail: string;
  studyStatus: "open" | "closed";
}

export default function RecentResponses({ responses }: RecentResponsesProps) {
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    null,
  );
  const [response, setResponse] = useState<Survey | null>(null);
  const [metadata, setMetadata] = useState<ResponseMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  function closeModal() {
    setSelectedResponseId(null);
    setResponse(null);
    setMetadata(null);
  }

  useEffect(() => {
    if (!selectedResponseId) return;

    const controller = new AbortController();

    async function loadResponse() {
      setLoading(true);

      try {
        const request = await fetch(
          `/api/admin/responses/${selectedResponseId}`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );
        const result = await request.json();

        if (!request.ok) {
          throw new Error(result.message ?? "Failed to load response.");
        }

        setResponse(result.response);
        setMetadata(result.metadata);
      } catch (error) {
        if (controller.signal.aborted) return;

        showToast({
          message:
            error instanceof Error ? error.message : "Failed to load response.",
          type: "error",
        });
        closeModal();
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadResponse();
    return () => controller.abort();
  }, [selectedResponseId, showToast]);

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border p-5 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Recent responses
          </h2>
          <p className="text-sm text-muted-foreground">
            Latest records added to the tracer system
          </p>
        </div>
        <Link
          href="/admin/responses"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-primary hover:bg-primary/10 hover:text-primary",
          )}
        >
          View all
          <LuArrowRight aria-hidden="true" />
        </Link>
      </div>

      {responses.length > 0 ? (
        <div className="divide-y divide-border">
          {responses.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={`${item.source === "admin_import" ? "Edit" : "View"} response from ${item.respondentName || item.respondentEmail || "unnamed respondent"}`}
              onDoubleClick={() => setSelectedResponseId(item.id)}
              onPointerUp={(event) => {
                if (event.pointerType !== "mouse") {
                  setSelectedResponseId(item.id);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedResponseId(item.id);
                }
              }}
              className="flex cursor-pointer flex-col gap-3 px-5 py-4 outline-none transition-colors duration-200 hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:items-center sm:px-6"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                {(item.respondentName ?? item.respondentEmail ?? "R")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {item.respondentName ||
                    item.respondentEmail ||
                    "Unnamed respondent"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {item.studyTitle} · {item.academicYear}
                </span>
              </span>
              <span className="flex items-center gap-3 text-xs text-muted-foreground">
                <span
                  className={`rounded-full px-2.5 py-1 font-semibold ${
                    item.status === "submitted"
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {item.status}
                </span>
                {new Date(item.createdAt).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Responses will appear here when alumni begin participating.
        </div>
      )}

      <Modal
        open={Boolean(selectedResponseId)}
        onClose={closeModal}
        title={
          metadata?.source === "admin_import"
            ? "Edit Manual Response"
            : "View Tracer Response"
        }
        width="xl"
      >
        {loading ? (
          <LoadingState className="min-h-72" message="Loading response..." />
        ) : (
          <div className="mx-auto w-full max-w-5xl">
            {response &&
            metadata?.source === "admin_import" &&
            selectedResponseId ? (
              <ManualResponseEditor
                responseId={selectedResponseId}
                initialData={response}
                initialRespondentEmail={metadata.respondentEmail}
                onComplete={closeModal}
              />
            ) : response ? (
              <ReadOnlyResponseDetails
                response={response}
                respondentEmail={metadata?.respondentEmail}
              />
            ) : null}
          </div>
        )}
      </Modal>
    </section>
  );
}
