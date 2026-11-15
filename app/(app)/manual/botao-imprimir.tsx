"use client";

import { PrinterIcon } from "lucide-react";

export function BotaoImprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-input bg-card px-4 text-sm font-medium hover:border-primary"
    >
      <PrinterIcon className="size-4" aria-hidden="true" />
      Imprimir / Salvar PDF
    </button>
  );
}
