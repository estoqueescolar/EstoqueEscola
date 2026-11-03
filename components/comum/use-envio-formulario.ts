"use client";

import { useState, useTransition } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { ResultadoAcao } from "@/lib/erros";

const MSG_FALHA_REDE = "Sem conexão com o servidor. Confira a internet e tente de novo.";

// Envia os valores para uma server action e distribui os erros devolvidos pelos campos.
export function useEnvioFormulario<T extends FieldValues>(
  form: UseFormReturn<T>,
  acao: (dados: T) => Promise<ResultadoAcao<unknown>>,
) {
  const [enviando, iniciar] = useTransition();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);

  const enviar = form.handleSubmit((dados) => {
    setAviso(null);
    iniciar(async () => {
      try {
        // Em sucesso com redirect(), a action não retorna.
        const resultado = await acao(dados);
        if (!resultado) return;
        if (resultado.ok) {
          if (resultado.mensagem) setAviso({ tipo: "sucesso", texto: resultado.mensagem });
          return;
        }
        Object.entries(resultado.erros ?? {}).forEach(([campo, mensagem]) =>
          form.setError(campo as Path<T>, { message: mensagem }),
        );
        setAviso({ tipo: "erro", texto: resultado.mensagem });
      } catch (erro) {
        // redirect() do Next sinaliza por exceção: deixa passar
        if (erro instanceof Error && "digest" in erro && String(erro.digest).startsWith("NEXT_REDIRECT")) throw erro;
        setAviso({ tipo: "erro", texto: MSG_FALHA_REDE });
      }
    });
  });

  return { enviar, enviando, aviso };
}
