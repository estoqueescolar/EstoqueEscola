import type { ComponentProps } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentProps<typeof Button>, "size"> & {
  // "principal": ação principal da tela (44px, padding maior); "normal": demais ações (44px); "icone": só ícone (44×44)
  tamanho?: "principal" | "normal" | "icone";
  carregando?: boolean;
  textoCarregando?: string;
};

const TAMANHOS = {
  principal: "min-h-11 px-5 text-base",
  normal: "min-h-11 px-4 text-base",
  icone: "size-11",
} as const;

// Botão com alvo de toque acessível. Use no lugar de components/ui/button nas telas.
export function Botao({
  tamanho = "normal",
  carregando = false,
  textoCarregando,
  disabled,
  children,
  className,
  ...props
}: Props) {
  return (
    <Button
      {...props}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={cn(TAMANHOS[tamanho], "gap-2", className)}
    >
      {carregando && <Loader2Icon className="size-5 animate-spin" aria-hidden="true" />}
      {carregando && textoCarregando ? textoCarregando : children}
    </Button>
  );
}
