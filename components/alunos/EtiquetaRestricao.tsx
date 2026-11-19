import { CircleAlertIcon, InfoIcon, TriangleAlertIcon, type LucideIcon } from "lucide-react";
import { textoNivel, type NivelRestricao } from "@/lib/regras/alunos";
import { cn } from "@/lib/utils";

// Nível sempre com cor + ícone + texto (nunca só cor). Reaproveitado no seletor e nos cartões.
export const ESTILO_NIVEL: Record<NivelRestricao, { classe: string; Icone: LucideIcon }> = {
  leve: { classe: "border-input bg-card text-foreground", Icone: InfoIcon },
  media: { classe: "border-alerta bg-alerta-fundo text-alerta-texto", Icone: CircleAlertIcon },
  grave: { classe: "border-destructive bg-perigo-fundo text-destructive", Icone: TriangleAlertIcon },
};

interface Props {
  nome: string;
  nivel: NivelRestricao;
  // "compacta": só o nível (quando o nome da restrição já está no título do grupo)
  compacta?: boolean;
}

export function EtiquetaRestricao({ nome, nivel, compacta = false }: Props) {
  const { classe, Icone } = ESTILO_NIVEL[nivel];
  return (
    <span className={cn("inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm", classe)}>
      <Icone className="size-4 shrink-0" aria-hidden="true" />
      {compacta ? (
        <span className="font-medium">{textoNivel(nivel)}</span>
      ) : (
        <>
          <span>{nome}</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold">{textoNivel(nivel)}</span>
        </>
      )}
    </span>
  );
}
