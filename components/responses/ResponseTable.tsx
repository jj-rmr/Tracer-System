"use client";

import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { AdminResponseFilters, AdminResponseSummary, Survey } from "@/types";
import ManualResponseEditor from "@/components/admin/responses/ManualResponseEditor";
import ReadOnlyResponseDetails, {
  TracerResponseModalHeader,
} from "@/components/responses/ReadOnlyResponseDetails";
import { LuEye, LuPencil, LuRefreshCw, LuTrash2 } from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import { friendlyRequestMessage } from "@/lib/api/client-errors";
import { TableActionMenu } from "@/components/ui/table-action-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { PROGRAMS } from "@/lib/programs/catalog";

interface ServerDataResponse {
  success: boolean;
  responses: AdminResponseSummary[];
  total: number;
  message?: string;
}

interface ResponseTableProps {
  currentPage: number;
  filters: AdminResponseFilters;
  onPageChange: (newPage: number) => void;
}

export default function ResponseTable({
  currentPage,
  filters,
  onPageChange,
}: ResponseTableProps) {
  const [responses, setResponses] = useState<AdminResponseSummary[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [loadingSurvey, setLoadingSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState<Survey | null>(null);
  const [responseMetadata, setResponseMetadata] = useState<{
    source: "alumni" | "admin_import";
    respondentEmail: string;
    studyStatus: "open" | "closed";
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [organizingResponseId, setOrganizingResponseId] = useState<
    string | null
  >(null);

  const { showToast } = useToast();
  const router = useRouter();

  const itemsPerPage = 10;

  useEffect(() => {
    if (!selectedSurveyId) return;

    async function fetchSurvey() {
      try {
        setLoadingSurvey(true);

        try {
          const res = await fetch(`/api/admin/responses/${selectedSurveyId}`, {
            credentials: "include",
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message ?? "Failed to load response.");
          }

          setSurveyData(data.response);
          setResponseMetadata(data.metadata);
        } catch (error: unknown) {
          showToast({
            message:
              error instanceof Error
                ? error.message
                : "Failed to load response.",
            type: "error",
          });

          setSelectedSurveyId(null);
          setSurveyData(null);
          setResponseMetadata(null);
        } finally {
          setLoadingSurvey(false);
        }
      } finally {
        setLoadingSurvey(false);
      }
    }

    fetchSurvey();
  }, [selectedSurveyId, showToast]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSurveys() {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
        });

        if (filters.search) searchParams.set("search", filters.search);
        if (filters.studyPeriodId) {
          searchParams.set("study", filters.studyPeriodId);
        }
        if (filters.program) searchParams.set("program", filters.program);
        if (filters.source) searchParams.set("source", filters.source);
        if (filters.status) searchParams.set("status", filters.status);
        if (filters.employmentStatus) {
          searchParams.set("employmentStatus", filters.employmentStatus);
        }

        const res = await fetch(
          `/api/admin/responses?${searchParams.toString()}`,
          {
            cache: "no-store",
            credentials: "include",
            signal: controller.signal,
          },
        );

        const data: ServerDataResponse = await res.json();

        if (!res.ok) {
          throw new Error(data.message ?? "Failed to load responses.");
        }

        setResponses(data.responses);
        setTotalRows(data.total);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        setError(
          friendlyRequestMessage(
            error,
            "An error occurred on our end and we couldn’t retrieve the responses.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchSurveys();

    return () => {
      controller.abort();
    };
  }, [currentPage, filters, reloadKey]);

  const confirmDelete = async (id: string) => {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/responses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to delete response.");
      }

      setResponses((previous) =>
        previous.filter((response) => response.id !== id),
      );
      setTotalRows((prev) => Math.max(0, prev - 1));

      setSurveyToDelete(null);
      setShowDeleteModal(false);

      showToast({
        message: "Response deleted successfully.",
        type: "success",
      });

      router.refresh();
    } catch (error: unknown) {
      showToast({
        message:
          error instanceof Error ? error.message : "Failed to delete response.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const retryDriveOrganization = async (id: string) => {
    setOrganizingResponseId(id);

    try {
      const response = await fetch(`/api/admin/responses/${id}/organize`, {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Failed to organize Drive folder.");
      }

      setResponses((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                driveOrganizationStatus: "organized",
                driveOrganizationError: null,
              }
            : item,
        ),
      );
      showToast({ message: "Response folder organized.", type: "success" });
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to organize Drive folder.",
        type: "error",
      });
    } finally {
      setOrganizingResponseId(null);
    }
  };

  if (loading) {
    return <LoadingState className="min-h-72" message="Loading responses..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        retryLabel="Refresh responses"
        onRetry={() => setReloadKey((current) => current + 1)}
      />
    );
  }

  const totalPages = Math.ceil(totalRows / itemsPerPage) || 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  if (totalRows === 0) {
    return (
      <div className="text-center w-full p-12 text-muted-foreground bg-muted/50 rounded-2xl border border-dashed border-border">
        {Object.values(filters).some(Boolean) ? (
          <>
            <h3 className="text-base font-semibold text-muted-foreground">
              No matching responses found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search terms or clear the search to view all
              response records.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold text-muted-foreground">
              No response records yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Responses will appear here once alumni complete the tracer form.
            </p>
          </>
        )}
      </div>
    );
  }

  const formatFullName = (response: AdminResponseSummary) => {
    if (response.respondentName?.trim()) return response.respondentName;

    const parts = [
      response.firstName,
      response.middleName,
      response.lastName,
      response.extensionName,
    ]
      .map((p) => p?.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Unnamed Respondent";
  };

  const programLabels = new Map(
    PROGRAMS.map((program) => [program.value, program.label]),
  );

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <Table className="min-w-280 table-auto">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Full Name</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Employment Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Drive</TableHead>
            <TableHead className="text-center">Menu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.id} className="group">
              <TableCell className="font-semibold text-foreground">
                {formatFullName(response)}
              </TableCell>
              <TableCell className="font-medium text-muted-foreground">
                {response.academicYear}
              </TableCell>
              <TableCell className="max-w-xs text-muted-foreground">
                <span className="line-clamp-2">
                  {programLabels.get(response.program) ||
                    response.program ||
                    "Unspecified"}
                </span>
              </TableCell>
              <TableCell className="font-medium text-muted-foreground">
                <span className="capitalize">
                  {response.employmentStatus || "unspecified"}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {response.createdAt
                  ? new Date(response.createdAt).toLocaleDateString()
                  : "N/A"}
              </TableCell>

              <TableCell>
                <span
                  title={response.driveOrganizationError ?? undefined}
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    response.driveOrganizationStatus === "organized"
                      ? "bg-success/15 text-success"
                      : response.driveOrganizationStatus === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/15 text-warning"
                  }`}
                >
                  {response.driveOrganizationStatus}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex justify-center">
                  <TableActionMenu
                    label={`Actions for ${formatFullName(response)}`}
                    items={[
                      ...(response.driveOrganizationStatus !== "organized"
                        ? [
                            {
                              label: "Retry Drive Organization",
                              variant: "secondary" as const,
                              disabled: organizingResponseId !== null,
                              icon: (
                                <LuRefreshCw
                                  aria-hidden="true"
                                  size={16}
                                  animated={
                                    organizingResponseId !== response.id
                                  }
                                  className={
                                    organizingResponseId === response.id
                                      ? "animate-spin"
                                      : undefined
                                  }
                                />
                              ),
                              onSelect: () =>
                                void retryDriveOrganization(response.id),
                            },
                          ]
                        : []),
                      {
                        label:
                          response.source === "admin_import"
                            ? "Edit Response"
                            : "View Response",
                        icon:
                          response.source === "admin_import" ? (
                            <LuPencil aria-hidden="true" size={16} animated />
                          ) : (
                            <LuEye aria-hidden="true" size={16} animated />
                          ),
                        onSelect: () => setSelectedSurveyId(response.id),
                      },
                      ...(response.studyStatus === "open"
                        ? [
                            {
                              label: "Delete Response",
                              variant: "destructive" as const,
                              disabled: isDeleting,
                              icon: (
                                <LuTrash2
                                  aria-hidden="true"
                                  size={16}
                                  animated
                                />
                              ),
                              onSelect: () => {
                                setSurveyToDelete(response.id);
                                setShowDeleteModal(true);
                              },
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal
        open={Boolean(selectedSurveyId)}
        onClose={() => {
          setSelectedSurveyId(null);
          setSurveyData(null);
          setResponseMetadata(null);
        }}
        title={
          responseMetadata?.source === "admin_import"
            ? "Edit Manual Response"
            : "View Tracer Response"
        }
        headerContent={
          surveyData && responseMetadata?.source !== "admin_import" ? (
            <TracerResponseModalHeader response={surveyData} />
          ) : undefined
        }
        headerVariant={
          surveyData && responseMetadata?.source !== "admin_import"
            ? "accent"
            : "default"
        }
        width="xl"
      >
        {loadingSurvey ? (
          <LoadingState className="min-h-72" message="Loading response..." />
        ) : (
          <div className="mx-auto w-full max-w-5xl">
            {surveyData &&
            responseMetadata?.source === "admin_import" &&
            selectedSurveyId ? (
              <ManualResponseEditor
                responseId={selectedSurveyId}
                initialData={surveyData}
                initialRespondentEmail={responseMetadata.respondentEmail}
                onComplete={() => {
                  setSelectedSurveyId(null);
                  setSurveyData(null);
                  setResponseMetadata(null);
                  setReloadKey((current) => current + 1);
                }}
              />
            ) : surveyData ? (
              <ReadOnlyResponseDetails
                response={surveyData}
                respondentEmail={responseMetadata?.respondentEmail}
              />
            ) : null}
          </div>
        )}
      </Modal>

      <div className="flex flex-wrap gap-3 border-t border-border bg-muted/40 p-4 text-sm sm:px-6">
        {totalRows > 1 ? (
          <span className="w-full rounded-lg bg-muted/60 px-4 py-2 font-semibold whitespace-nowrap text-muted-foreground sm:w-fit">
            Showing <span>{responses.length}</span> of{" "}
            <span>{totalRows} Entries</span>
          </span>
        ) : (
          <span className="w-full rounded-lg bg-muted/60 px-4 py-2 font-semibold whitespace-nowrap text-muted-foreground sm:w-fit">
            Showing 1 Entry
          </span>
        )}

        <div className="flex w-full gap-2 sm:ml-auto sm:w-fit">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            Previous
          </Button>

          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            variant="default"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            Next
          </Button>
        </div>
      </div>
      <ConfirmationDialog
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSurveyToDelete(null);
        }}
        onConfirm={() => {
          if (surveyToDelete) void confirmDelete(surveyToDelete);
        }}
        title="Delete response?"
        description="This response and its document records will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete Response"
        busy={isDeleting}
        tone="danger"
      />
    </div>
  );
}
