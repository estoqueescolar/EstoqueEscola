"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Botao } from "@/components/comum/Botao";

// Copia a lista em texto para colar no WhatsApp ou no e-mail do fornecedor.
export function CopiarLista({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<"parado" | "copiado" | "erro">("parado");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("erro");
    }
  }

  return (
    <div className="flex flex-col gap-1 sm:items-end">
      <Botao type="button" variant="outline" onClick={copiar}>
        {estado === "copiado" ? <CheckIcon className="size-5" aria-hidden="true" /> : <CopyIcon className="size-5" aria-hidden="true" />}
        {estado === "copiado" ? "Lista copiada" : "Copiar lista"}
      </Botao>
      <p aria-live="polite" className="text-sm text-muted-foreground empty:hidden">
        {estado === "copiado" && "Pronto para colar no WhatsApp ou no e-mail."}
        {estado === "erro" && "Não foi possível copiar. Selecione a lista e copie manualmente."}
      </p>
    </div>
  );
}
