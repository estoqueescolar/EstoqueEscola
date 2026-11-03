"use client";

import { useState, type ComponentProps, type KeyboardEvent } from "react";
import { EyeIcon, EyeOffIcon, TriangleAlertIcon } from "lucide-react";
import { Botao } from "./Botao";
import { CampoTexto } from "./CampoTexto";

type Props = Omit<ComponentProps<typeof CampoTexto>, "type" | "acessorio">;

// Senha com botão "Mostrar senha" e aviso de Caps Lock: com mãos molhadas e teclado de celular,
// errar a digitação é comum.
export function CampoSenha({ rotulo, onKeyUp, onKeyDown, ...props }: Props) {
  const [visivel, setVisivel] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  function verificarCapsLock(evento: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(evento.getModifierState?.("CapsLock") ?? false);
  }

  return (
    <div className="flex flex-col gap-1">
      <CampoTexto
        rotulo={rotulo}
        type={visivel ? "text" : "password"}
        onKeyUp={(e) => {
          verificarCapsLock(e);
          onKeyUp?.(e);
        }}
        onKeyDown={(e) => {
          verificarCapsLock(e);
          onKeyDown?.(e);
        }}
        acessorio={
          <Botao
            type="button"
            variant="ghost"
            tamanho="icone"
            className="text-muted-foreground hover:text-foreground"
            aria-pressed={visivel}
            aria-label={visivel ? `Ocultar ${rotulo.toLowerCase()}` : `Mostrar ${rotulo.toLowerCase()}`}
            onClick={() => setVisivel((v) => !v)}
          >
            {visivel ? <EyeOffIcon className="size-5" aria-hidden="true" /> : <EyeIcon className="size-5" aria-hidden="true" />}
          </Botao>
        }
        {...props}
      />
      <p aria-live="polite" className="text-sm text-alerta-texto">
        {capsLock && (
          <span className="inline-flex items-center gap-1.5">
            <TriangleAlertIcon className="size-4" aria-hidden="true" /> Caps Lock está ativado.
          </span>
        )}
      </p>
    </div>
  );
}
