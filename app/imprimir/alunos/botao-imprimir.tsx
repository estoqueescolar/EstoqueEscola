"use client";

import { PrinterIcon } from "lucide-react";
import { Botao } from "@/components/comum/Botao";

export function BotaoImprimir() {
  return (
    <Botao type="button" tamanho="principal" onClick={() => window.print()}>
      <PrinterIcon className="size-5" aria-hidden="true" /> Imprimir
    </Botao>
  );
}
