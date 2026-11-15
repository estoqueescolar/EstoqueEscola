"use client";

import { useState, useTransition } from "react";
import { ChefHatIcon } from "lucide-react";
import { prepararReceita } from "./actions";

interface Ingrediente {
  produto_id: string;
  quantidade: number;
  produtos: { nome: string; unidades: { sigla: string } | null } | null;
  estoque: number;
}

interface Props {
  receitaId: string;
  nome: string;
  porcoes_base: number;
  ingredientes: Ingrediente[];
}

export function PrepararReceita({ receitaId, nome, porcoes_base, ingredientes }: Props) {
  const [porcoes, setPorcoes] = useState(porcoes_base);
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [pending, startTransition] = useTransition();

  if (!ingredientes.length) return null;

  const fator = porcoes / porcoes_base;
  const semEstoque = ingredientes.filter((i) => i.estoque < i.quantidade * fator);

  function confirmar() {
    setMensagem(null);
    startTransition(async () => {
      const r = await prepararReceita(receitaId, porcoes);
      setMensagem({ tipo: r.ok ? "ok" : "erro", texto: r.mensagem ?? "" });
      if (r.ok) setAberto(false);
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Preparar receita</h2>

      {mensagem && (
        <p role="alert" className={`rounded-lg p-3 text-sm ${mensagem.tipo === "ok" ? "bg-ok-fundo text-primary" : "bg-perigo-fundo text-destructive"}`}>
          {mensagem.texto}
        </p>
      )}

      {!aberto ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-primary px-5 text-base font-medium text-primary-foreground hover:bg-[var(--manjericao-escuro)]"
        >
          <ChefHatIcon className="size-5" aria-hidden="true" /> Preparar agora
        </button>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="porcoes" className="text-sm font-medium">Quantas porções preparar?</label>
              <input
                id="porcoes"
                type="number"
                min={1}
                value={porcoes}
                onChange={(e) => setPorcoes(Math.max(1, parseInt(e.target.value) || 1))}
                className="min-h-11 w-28 rounded-lg border border-input px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              />
            </div>
            <p className="text-sm text-muted-foreground pb-1">Base: {porcoes_base} {porcoes_base === 1 ? "porção" : "porções"}</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Ingredientes que serão consumidos:</p>
            <ul className="flex flex-col divide-y rounded-lg border">
              {ingredientes.map((ing) => {
                const qtdNecessaria = Number((ing.quantidade * fator).toFixed(3));
                const semEstoqueItem = ing.estoque < qtdNecessaria;
                return (
                  <li key={ing.produto_id} className="flex items-center justify-between gap-3 p-3 text-sm">
                    <span className={semEstoqueItem ? "text-destructive font-medium" : ""}>
                      {ing.produtos?.nome ?? "Produto removido"}
                    </span>
                    <span className={`shrink-0 ${semEstoqueItem ? "text-destructive" : "text-muted-foreground"}`}>
                      {qtdNecessaria} {ing.produtos?.unidades?.sigla ?? ""}
                      {semEstoqueItem && <span className="ml-1 text-xs">(estoque insuficiente)</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {semEstoque.length > 0 && (
            <p className="rounded-lg bg-alerta-fundo p-3 text-sm text-alerta-texto">
              ⚠️ {semEstoque.length} ingrediente{semEstoque.length > 1 ? "s com" : " com"} estoque insuficiente. A saída dos demais será registrada normalmente.
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={confirmar}
              disabled={pending}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-base font-medium text-primary-foreground hover:bg-[var(--manjericao-escuro)] disabled:opacity-50"
            >
              {pending ? "Registrando…" : "Confirmar e registrar saída"}
            </button>
            <button
              type="button"
              onClick={() => { setAberto(false); setMensagem(null); }}
              className="inline-flex min-h-11 items-center px-4 text-base font-medium text-muted-foreground hover:bg-accent rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
