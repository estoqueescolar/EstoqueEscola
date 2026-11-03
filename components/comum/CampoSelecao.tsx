import { useId, type ComponentProps } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Opcao {
  valor: string;
  texto: string;
}

type Props = Omit<ComponentProps<"select">, "children"> & {
  rotulo: string;
  opcoes: readonly Opcao[];
  erro?: string;
  textoVazio?: string;
  ocultarRotulo?: boolean;
};

// Seleção com <select> nativo: abre o seletor do próprio celular/tablet, que é mais fácil de tocar
// do que um menu suspenso. Mesmo visual dos campos do shadcn/ui.
export function CampoSelecao({ rotulo, opcoes, erro, textoVazio, ocultarRotulo, id, className, required, ...props }: Props) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idErro = erro ? `${idCampo}-erro` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={idCampo} className={cn("text-sm font-medium", ocultarRotulo && "sr-only")}>
        {rotulo}
        {required && <span className="text-destructive" aria-hidden="true"> *</span>}
      </Label>
      <div className="relative">
        <select
          id={idCampo}
          required={required}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idErro}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border border-input bg-card pr-10 pl-3 text-base",
            "aria-invalid:border-destructive disabled:bg-muted disabled:text-muted-foreground",
            className,
          )}
          {...props}
        >
          {textoVazio !== undefined && <option value="">{textoVazio}</option>}
          {opcoes.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.texto}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      {erro && (
        <p id={idErro} className="text-sm font-medium text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
