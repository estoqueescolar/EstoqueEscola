"use client";

import { FileSpreadsheetIcon, FileTextIcon } from "lucide-react";

export function ExportarLista() {
  return (
    <div className="flex gap-2">
      <a
        href="/api/lista-compras?formato=pdf"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-input bg-card px-4 text-sm font-medium hover:bg-accent"
      >
        <FileTextIcon className="size-4" aria-hidden="true" /> PDF
      </a>
      <a
        href="/api/lista-compras?formato=xlsx"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-input bg-card px-4 text-sm font-medium hover:bg-accent"
      >
        <FileSpreadsheetIcon className="size-4" aria-hidden="true" /> Excel
      </a>
    </div>
  );
}
