import { cn } from "@/lib/utils";

// Indicador de passos do fluxo de recuperação de senha ("Passo 1 de 2").
export function EtapasFluxo({ atual, etapas }: { atual: number; etapas: readonly string[] }) {
  return (
    <ol aria-label={`Passo ${atual} de ${etapas.length}`} className="flex gap-2">
      {etapas.map((nome, i) => (
        <li key={nome} aria-current={i + 1 === atual ? "step" : undefined} className="flex flex-1 flex-col gap-1.5">
          <span className={cn("h-1 rounded-full", i + 1 <= atual ? "bg-primary" : "bg-border")} aria-hidden="true" />
          <span className={cn("text-sm", i + 1 === atual ? "font-medium text-foreground" : "text-muted-foreground")}>
            {i + 1}. {nome}
          </span>
        </li>
      ))}
    </ol>
  );
}

export const ETAPAS_RECUPERACAO = ["Pedir o link", "Criar a nova senha"] as const;
