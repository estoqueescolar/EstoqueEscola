"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { PauseIcon, PlayIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// A cena 3D (three.js) só carrega no navegador, sob demanda, para não atrasar o formulário.
const Despensa3D = dynamic(() => import("./despensa-3d"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />,
});

const LEGENDAS = ["Chegou mercadoria", "Sai o que vence antes", "Aviso de validade", "Hora de comprar"] as const;
const SELOS = [
  { texto: "Leite · lote novo guardado", classe: "bg-ok-fundo text-primary" },
  { texto: "Feijão · vence antes, sai primeiro", classe: "bg-ok-fundo text-primary" },
  { texto: "Leite · vence em 3 dias", classe: "bg-alerta-fundo text-alerta-texto" },
  { texto: "Arroz · comprar 6 kg", classe: "bg-perigo-fundo text-destructive" },
] as const;
const CONSULTA_MOVIMENTO = "(prefers-reduced-motion: reduce)";

function assinarMovimento(aviso: () => void) {
  const consulta = window.matchMedia(CONSULTA_MOVIMENTO);
  consulta.addEventListener("change", aviso);
  return () => consulta.removeEventListener("change", aviso);
}

export function CenaDespensa() {
  const [etapa, setEtapa] = useState(0);
  const [pausadoPelaPessoa, setPausado] = useState<boolean | null>(null);
  const menosMovimento = useSyncExternalStore(assinarMovimento, () => window.matchMedia(CONSULTA_MOVIMENTO).matches, () => false);
  // Sem escolha da pessoa, fica parada para quem pediu menos movimento no sistema.
  const pausado = pausadoPelaPessoa ?? menosMovimento;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative min-h-0 flex-1 cursor-grab active:cursor-grabbing">
        <Despensa3D pausado={pausado} aoMudarEtapa={setEtapa} />
        {/* etiqueta da situação atual, no estilo das etiquetas do sistema */}
        <p
          key={etapa}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-4 right-0 inline-flex animate-in items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-lg duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none",
            SELOS[etapa].classe,
          )}
        >
          {SELOS[etapa].texto}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPausado(!pausado)}
          aria-label={pausado ? "Continuar animação" : "Pausar animação"}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border text-primary hover:bg-accent"
        >
          {pausado ? <PlayIcon className="size-4" aria-hidden="true" /> : <PauseIcon className="size-4" aria-hidden="true" />}
        </button>
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {LEGENDAS.map((legenda, i) => (
            <span key={legenda} className={cn("h-1 flex-1 rounded-full transition-colors duration-500 motion-reduce:transition-none", i === etapa ? "bg-primary" : "bg-primary/20")} />
          ))}
        </div>
        <p className="w-44 shrink-0 text-right text-sm text-muted-foreground" aria-live={pausado ? "polite" : "off"}>
          {LEGENDAS[etapa]}
        </p>
      </div>
    </div>
  );
}
