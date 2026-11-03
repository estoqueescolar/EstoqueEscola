import { useId, type ComponentProps } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Textarea> & { rotulo: string; erro?: string; ajuda?: string };

// Texto de várias linhas (observações). Mesmo padrão de rótulo/ajuda/erro do CampoTexto.
export function CampoTextoLongo({ rotulo, erro, ajuda, id, className, ...props }: Props) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idAjuda = ajuda ? `${idCampo}-ajuda` : undefined;
  const idErro = erro ? `${idCampo}-erro` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={idCampo} className="text-sm font-medium">
        {rotulo}
      </Label>
      <Textarea
        id={idCampo}
        rows={3}
        aria-invalid={erro ? true : undefined}
        aria-describedby={[idAjuda, idErro].filter(Boolean).join(" ") || undefined}
        className={cn("min-h-24 bg-card text-base md:text-base", className)}
        {...props}
      />
      {ajuda && (
        <p id={idAjuda} className="text-sm text-muted-foreground">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={idErro} className="text-sm font-medium text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
