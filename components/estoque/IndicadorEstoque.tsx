import { CircleAlertIcon, CircleCheckIcon, CircleSlashIcon } from "lucide-react";
import { formatarQuantidade } from "@/lib/regras/quantidades";
import { cn } from "@/lib/utils";

export type SituacaoEstoque = "zerado" | "baixo" | "ok";

export function situacaoEstoque(estoque: number, minimo: number): SituacaoEstoque {
  if (estoque <= 0) return "zerado";
  return estoque <= minimo ? "baixo" : "ok";
}

const VISUAL = {
  zerado: { texto: "Sem estoque", Icone: CircleSlashIcon, classe: "border-destructive bg-perigo-fundo text-destructive" },
  baixo: { texto: "Estoque baixo", Icone: CircleAlertIcon, classe: "border-destructive bg-perigo-fundo text-destructive" },
  ok: { texto: "Em dia", Icone: CircleCheckIcon, classe: "border-primary bg-ok-fundo text-foreground" },
} as const;

interface Props {
  estoque: number;
  minimo: number;
  sigla: string;
}

// Quantidade em estoque + mínimo + selo com ícone e texto (nunca só cor).
export function IndicadorEstoque({ estoque, minimo, sigla }: Props) {
  const situacao = situacaoEstoque(estoque, minimo);
  const { texto, Icone, classe } = VISUAL[situacao];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <p>
        <span className="font-heading text-2xl font-semibold">{formatarQuantidade(estoque)}</span>{" "}
        <span className="text-muted-foreground">{sigla}</span>
        <span className="block text-sm text-muted-foreground">mínimo {formatarQuantidade(minimo, sigla)}</span>
      </p>
      <span className={cn("inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold", classe)}>
        <Icone className="size-4" aria-hidden="true" />
        {texto}
      </span>
    </div>
  );
}
