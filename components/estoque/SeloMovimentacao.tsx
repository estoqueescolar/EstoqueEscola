import { ArrowDownToLineIcon, ArrowUpFromLineIcon, ScaleIcon, Trash2Icon } from "lucide-react";
import type { TipoMovimentacao } from "@/lib/regras/movimentacoes";
import { cn } from "@/lib/utils";

export const NOMES_TIPO: Record<TipoMovimentacao, string> = {
  entrada: "Entrada",
  saida: "Saída",
  perda: "Perda",
  ajuste: "Ajuste",
};

const VISUAL = {
  entrada: { Icone: ArrowDownToLineIcon, classe: "border-primary bg-ok-fundo text-foreground" },
  saida: { Icone: ArrowUpFromLineIcon, classe: "border-frio bg-frio-fundo text-frio" },
  perda: { Icone: Trash2Icon, classe: "border-destructive bg-perigo-fundo text-destructive" },
  ajuste: { Icone: ScaleIcon, classe: "border-alerta bg-alerta-fundo text-alerta-texto" },
} as const;

export function SeloMovimentacao({ tipo }: { tipo: TipoMovimentacao }) {
  const { Icone, classe } = VISUAL[tipo];
  return (
    <span className={cn("inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold", classe)}>
      <Icone className="size-4" aria-hidden="true" />
      {NOMES_TIPO[tipo]}
    </span>
  );
}
