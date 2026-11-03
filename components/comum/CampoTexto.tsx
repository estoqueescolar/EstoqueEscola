import { useId, type ComponentProps, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Input> & {
  rotulo: string;
  erro?: string;
  ajuda?: ReactNode;
  // elemento dentro do campo, à direita (ex.: botão "Mostrar senha")
  acessorio?: ReactNode;
};

// Campo com rótulo, ajuda e mensagem de erro ligados por aria. 44px de altura e texto de 16px.
export function CampoTexto({ rotulo, erro, ajuda, acessorio, id, className, required, "aria-describedby": descricaoExtra, ...props }: Props) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idAjuda = ajuda ? `${idCampo}-ajuda` : undefined;
  const idErro = erro ? `${idCampo}-erro` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={idCampo} className="text-sm font-medium">
        {rotulo}
        {required && <span className="text-destructive" aria-hidden="true"> *</span>}
      </Label>
      <div className="relative">
      <Input
        id={idCampo}
        required={required}
        aria-invalid={erro ? true : undefined}
        aria-describedby={[idAjuda, idErro, descricaoExtra].filter(Boolean).join(" ") || undefined}
        className={cn("h-11 bg-card text-base md:text-base", acessorio && "pr-12", className)}
        {...props}
      />
      {acessorio && <div className="absolute inset-y-0 right-0 flex items-center">{acessorio}</div>}
      </div>
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
