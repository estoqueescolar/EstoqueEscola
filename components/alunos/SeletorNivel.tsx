"use client";

import { NIVEIS_RESTRICAO, type NivelRestricao } from "@/lib/regras/alunos";
import { cn } from "@/lib/utils";
import { ESTILO_NIVEL } from "./EtiquetaRestricao";

interface Props {
  // nome da restrição: entra no rótulo do grupo para o leitor de tela saber de qual se trata
  restricao: string;
  nome: string;
  valor: NivelRestricao;
  aoMudar: (nivel: NivelRestricao) => void;
}

// Três opções lado a lado (rádio nativo: setas do teclado e leitor de tela funcionam sem código extra).
export function SeletorNivel({ restricao, nome, valor, aoMudar }: Props) {
  const ajuda = NIVEIS_RESTRICAO.find((n) => n.valor === valor)!.ajuda;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">
        Nível<span className="sr-only"> de {restricao}</span>
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {NIVEIS_RESTRICAO.map((n) => {
          const { classe, Icone } = ESTILO_NIVEL[n.valor];
          const marcado = valor === n.valor;
          return (
            <label
              key={n.valor}
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-base font-medium transition-colors motion-reduce:transition-none",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                marcado ? cn(classe, "ring-1 ring-current") : "border-input bg-card text-muted-foreground hover:bg-accent",
              )}
            >
              <input type="radio" name={nome} value={n.valor} checked={marcado} onChange={() => aoMudar(n.valor)} className="sr-only" />
              <Icone className="size-4 shrink-0" aria-hidden="true" />
              {n.texto}
            </label>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">{ajuda}</p>
    </fieldset>
  );
}
