"use client";

import { useState } from "react";
import {
  LuDownload,
  LuFileSpreadsheet,
  LuFileText,
} from "@/components/ui/icons";

import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";

interface ExportButtonProps {
  baseUrl: string;
  label?: string;
}

function withFormat(baseUrl: string, format: "csv" | "xlsx") {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}format=${format}`;
}

export default function ExportButton({
  baseUrl,
  label = "Export",
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  function download(format: "csv" | "xlsx") {
    setOpen(false);
    window.location.assign(withFormat(baseUrl, format));
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} variant="success">
        <LuDownload animated />
        {label}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Export data"
        description="Choose the file format for this export."
        width="sm"
        fitContent
      >
        <div className="grid gap-5">
          <div>
            <Button
              type="button"
              variant="success"
              size="option"
              onClick={() => download("xlsx")}
            >
              <LuFileSpreadsheet />
              Export to Excel
            </Button>
            <p className="mt-2 px-1 text-sm leading-5 text-muted-foreground">
              A styled workbook with readable headers and fitted rows and
              columns.
            </p>
          </div>

          <div>
            <Button
              type="button"
              variant="success"
              size="option"
              onClick={() => download("csv")}
            >
              <LuFileText />
              Export to CSV
            </Button>
            <p className="mt-2 px-1 text-sm leading-5 text-muted-foreground">
              A lightweight file compatible with spreadsheet and data tools.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
