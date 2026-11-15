"use client";

import { useState, useTransition } from "react";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { cn } from "@/lib/utils";
import { REFEICOES_RESTRICAO, type TipoRefeicaoRestricao } from "@/lib/validacoes/cardapio";
import { salvarContagens } from "./actions";

interface Tipo {
  id: string;
  nome: string;
  descricao: string | null;
}

interface Props {
  data: string;
  tipos: Tipo[];
  // valores[tipo_refeicao][tipo_restricao_id] = quantidade
  valores: Record<string, Record<string, number>>;
}

export function FormularioContagens({ data, tipos, valores }: Props) {
  const [aba, setAba] = useState<TipoRefeicaoRestricao>("cafe_manha");
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [erros, setErros] = useState<Record<string, string>>({});

  // estado local dos inputs: [tipo_refeicao][tipo_restricao_id] -> string
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    for (const r of REFEICOES_RESTRICAO) {
      init[r.valor] = {};
      for (const t of tipos) {
        init[r.valor][t.id] = String(valores[r.valor]?.[t.id] ?? 0);
      }
    }
    return init;
  });

  function totalAba(refeicao: string) {
    return Object.values(inputs[refeicao] ?? {}).reduce((s, v) => s + (parseInt(v) || 0), 0);
  }

  function salvar() {
    setAviso(null);
    setErros({});
    const contagens = tipos.map((t) => ({
      tipo_restricao_id: t.id,
      quantidade_alunos: inputs[aba]?.[t.id] ?? "0",
    }));
    startTransition(async () => {
      const r = await salvarContagens({ data, tipo_refeicao: aba, contagens });
      if (r.ok) {
        setAviso({ tipo: "ok", texto: r.mensagem ?? "Salvo." });
      } else {
        setAviso({ tipo: "erro", texto: r.mensagem ?? "Erro ao salvar." });
        if (r.erros) setErros(r.erros as Record<string, string>);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Abas de refeição */}
      <div role="tablist" aria-label="Refeições" className="flex flex-wrap gap-1.5">
        {REFEICOES_RESTRICAO.map((r) => {
          const total = totalAba(r.valor);
          return (
            <button
              key={r.valor}
              role="tab"
              aria-selected={aba === r.valor}
              onClick={() => { setAba(r.valor); setAviso(null); }}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors",
                aba === r.valor
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card text-foreground hover:border-primary",
              )}
            >
              {r.texto}
              {total > 0 && (
                <span className={cn("rounded-full px-1.5 py-0.5 text-xs", aba === r.valor ? "bg-primary-foreground/20" : "bg-primary/10 text-primary")}>
                  {total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Painel da aba ativa */}
      <div role="tabpanel" className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-6">
        {aviso && <AvisoFormulario tipo={aviso.tipo === "ok" ? "sucesso" : "erro"}>{aviso.texto}</AvisoFormulario>}

        <div className="grid gap-4 sm:grid-cols-2">
          {tipos.map((tipo) => {
            const valor = inputs[aba]?.[tipo.id] ?? "0";
            const erroKey = `contagens.${tipos.indexOf(tipo)}.quantidade_alunos`;
            return (
              <div key={tipo.id} className="flex flex-col gap-1.5">
                <label htmlFor={`${aba}-${tipo.id}`} className="text-sm font-medium">{tipo.nome}</label>
                {tipo.descricao && <p className="text-xs text-muted-foreground">{tipo.descricao}</p>}
                <input
                  id={`${aba}-${tipo.id}`}
                  inputMode="numeric"
                  value={valor}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      [aba]: { ...prev[aba], [tipo.id]: e.target.value },
                    }))
                  }
                  className={cn(
                    "min-h-11 rounded-lg border px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                    erros[erroKey] ? "border-destructive" : "border-input",
                  )}
                />
                {erros[erroKey] && <p className="text-xs text-destructive">{erros[erroKey]}</p>}
              </div>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          Total nesta refeição:{" "}
          <span className="font-medium text-foreground">
            {totalAba(aba)} {totalAba(aba) === 1 ? "aluno" : "alunos"}
          </span>
        </p>

        <Botao onClick={salvar} tamanho="principal" carregando={pending} textoCarregando="Salvando…" className="sm:w-fit">
          Salvar {REFEICOES_RESTRICAO.find((r) => r.valor === aba)?.texto.toLowerCase()}
        </Botao>
      </div>
    </div>
  );
}
