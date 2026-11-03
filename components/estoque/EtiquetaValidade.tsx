import { CalendarCheckIcon, OctagonAlertIcon, TriangleAlertIcon } from "lucide-react";
import { formatarData } from "@/lib/regras/datas";
import { classificarValidade, descreverValidade } from "@/lib/regras/validade";
import { cn } from "@/lib/utils";

const VISUAL = {
  vencido: { Icone: OctagonAlertIcon, classe: "border-destructive bg-perigo-fundo text-destructive" },
  proximo: { Icone: TriangleAlertIcon, classe: "border-alerta bg-alerta-fundo text-alerta-texto" },
  ok: { Icone: CalendarCheckIcon, classe: "border-input bg-card text-foreground" },
} as const;

interface Props {
  dataValidade: string;
  hoje: string;
  diasAlerta: number;
  // mostra também a data absoluta ("até 06/11/2026")
  comData?: boolean;
}

// Etiqueta de validade "da prateleira": data relativa + ícone + cor. Nunca só cor.
export function EtiquetaValidade({ dataValidade, hoje, diasAlerta, comData = true }: Props) {
  const situacao = classificarValidade({ data_validade: dataValidade }, hoje, diasAlerta);
  const { Icone, classe } = VISUAL[situacao];
  const texto = situacao === "ok" ? `Validade ${formatarData(dataValidade)}` : descreverValidade(dataValidade, hoje);
  return (
    <span className={cn("inline-flex min-h-8 flex-wrap items-center gap-x-1.5 rounded-full border px-3 py-0.5 text-sm font-semibold", classe)}>
      <Icone className="size-4 shrink-0" aria-hidden="true" />
      {texto}
      {comData && situacao !== "ok" && <span className="font-normal">({formatarData(dataValidade)})</span>}
    </span>
  );
}
