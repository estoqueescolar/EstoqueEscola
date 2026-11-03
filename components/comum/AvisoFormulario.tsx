"use client";

import { useEffect, useRef } from "react";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  tipo: "erro" | "sucesso";
  children: React.ReactNode;
  // leva o foco até a mensagem (use quando ela substitui o formulário)
  focar?: boolean;
}

// Mensagem no topo do formulário. Ícone + texto (nunca só cor) e anunciada por leitores de tela.
export function AvisoFormulario({ tipo, children, focar = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focar) ref.current?.focus();
  }, [focar]);
  const Icone = tipo === "erro" ? CircleAlertIcon : CircleCheckIcon;
  return (
    <div
      ref={ref}
      tabIndex={focar ? -1 : undefined}
      role={tipo === "erro" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-base",
        tipo === "erro" ? "border-destructive bg-perigo-fundo text-destructive" : "border-primary bg-ok-fundo text-foreground",
      )}
    >
      <Icone className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
