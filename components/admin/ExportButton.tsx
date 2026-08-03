"use client";

import { useState } from "react";
import {
  LuDownload,
  LuFileSpreadsheet,
  LuFileText,
} from "@/components/ui/icons";

import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { friendlyRequestMessage } from "@/lib/api/client-errors";

interface ExportButtonProps {
  baseUrl: string;
  label?: string;
  formats?: readonly ExportFormat[];
}

type ExportFormat = "csv" | "xlsx";

function withFormat(baseUrl: string, format: ExportFormat) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}format=${format}`;
}

function downloadFilename(response: Response, format: ExportFormat) {
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const quoted = disposition.match(/filename="([^"]+)"/i)?.[1];
  const plain = disposition.match(/filename=([^;]+)/i)?.[1]?.trim();

  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {}
  }

  return quoted ?? plain ?? `tracer-export.${format}`;
}

export default function ExportButton({
  baseUrl,
  label = "Export",
  formats = ["xlsx", "csv"],
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);
  const { showToast } = useToast();
  const availableFormats: readonly ExportFormat[] =
    formats.length > 0 ? formats : ["xlsx", "csv"];
  const directFormat =
    availableFormats.length === 1 ? availableFormats[0] : null;

  async function download(format: ExportFormat) {
    if (downloading) return;

    setDownloading(format);
    try {
      const response = await fetch(withFormat(baseUrl, format), {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message ?? "Failed to export data.");
      }

      if (
        !response.headers.get("Content-Disposition")?.includes("attachment")
      ) {
        throw new Error(
          "Your session may have expired. Sign in and try again.",
        );
      }

      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadFilename(response, format);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);

      setOpen(false);
      showToast({ message: "Export downloaded.", type: "success" });
    } catch (error) {
      showToast({
        message:
          error instanceof Error && error.message !== "Failed to fetch"
            ? error.message
            : friendlyRequestMessage(error, "Failed to export data."),
        type: "error",
      });
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          if (directFormat) {
            void download(directFormat);
          } else {
            setOpen(true);
          }
        }}
        variant="success"
        disabled={downloading !== null}
      >
        <LuDownload animated />
        {downloading ? `Preparing ${downloading.toUpperCase()}...` : label}
      </Button>

      {!directFormat && (
        <Modal
          open={open}
          onClose={() => {
            if (!downloading) setOpen(false);
          }}
          title="Export data"
          description="Choose the file format for this export."
          width="sm"
          fitContent
        >
          <div className="grid gap-5">
            {availableFormats.includes("xlsx") && (
              <div>
                <Button
                  type="button"
                  variant="success"
                  size="option"
                  onClick={() => void download("xlsx")}
                  disabled={downloading !== null}
                >
                  <LuFileSpreadsheet />
                  {downloading === "xlsx"
                    ? "Preparing Excel..."
                    : "Export to Excel"}
                </Button>
                <p className="mt-2 px-1 text-sm leading-5 text-muted-foreground">
                  A styled workbook with readable headers and fitted rows and
                  columns.
                </p>
              </div>
            )}

            {availableFormats.includes("csv") && (
              <div>
                <Button
                  type="button"
                  variant="success"
                  size="option"
                  onClick={() => void download("csv")}
                  disabled={downloading !== null}
                >
                  <LuFileText />
                  {downloading === "csv" ? "Preparing CSV..." : "Export to CSV"}
                </Button>
                <p className="mt-2 px-1 text-sm leading-5 text-muted-foreground">
                  A lightweight file compatible with spreadsheet and data tools.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
