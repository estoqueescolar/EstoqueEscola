"use client";

import { useState, useTransition } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { adicionarIngrediente, removerIngrediente } from "./actions";

interface Ingrediente {
  id: string;
  produto_id: string;
  quantidade: number;
  observacao: string | null;
  produtos: { nome: string; unidades: { sigla: string } | null } | null;
}

interface Produto {
  valor: string;
  texto: string;
  sigla: string;
  estoque: number;
}

interface Props {
  receitaId: string;
  ingredientes: Ingrediente[];
  produtos: Produto[];
  porcoes_base: number;
  podeEditar: boolean;
}

export function GerenciarIngredientes({ receitaId, ingredientes, produtos, porcoes_base, podeEditar }: Props) {
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const produtosDisponiveis = produtos.filter((p) => !ingredientes.some((i) => i.produto_id === p.valor));

  async function adicionar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setErro("");
    setErros({});
    startTransition(async () => {
      const r = await adicionarIngrediente(receitaId, {
        produto_id: fd.get("produto_id"),
        quantidade: fd.get("quantidade"),
        observacao: fd.get("observacao"),
      });
      if (!r.ok) { setErro(r.mensagem); setErros(r.erros ?? {}); }
      else (e.target as HTMLFormElement).reset();
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">
        Ingredientes
        <span className="ml-2 text-sm font-normal text-muted-foreground">para {porcoes_base} {porcoes_base === 1 ? "porção" : "porções"}</span>
      </h2>

      {ingredientes.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
          Nenhum ingrediente ainda. Adicione abaixo.
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded-xl border bg-card">
          {ingredientes.map((ing) => (
            <li key={ing.id} className="flex items-center gap-3 p-3">
              <span className="flex-1 font-medium">
                {ing.produtos?.nome ?? "Produto removido"}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {ing.quantidade} {ing.produtos?.unidades?.sigla ?? ""}
                </span>
              </span>
              {ing.observacao && (
                <span className="hidden text-sm text-muted-foreground sm:block">{ing.observacao}</span>
              )}
              {podeEditar && (
                <button
                  type="button"
                  aria-label={`Remover ${ing.produtos?.nome}`}
                  onClick={() => startTransition(async () => { await removerIngrediente(ing.id, receitaId); })}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-destructive"
                >
                  <Trash2Icon className="size-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {podeEditar && produtosDisponiveis.length > 0 && (
        <form onSubmit={adicionar} className="rounded-xl border bg-card p-4">
          <p className="mb-3 text-sm font-medium">Adicionar ingrediente</p>
          {erro && <p role="alert" className="mb-3 rounded-lg bg-perigo-fundo p-2 text-sm text-destructive">{erro}</p>}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
            <div className="flex flex-col gap-1">
              <label htmlFor="produto_id" className="text-sm font-medium">Produto</label>
              <select
                id="produto_id"
                name="produto_id"
                required
                className={cn("min-h-11 rounded-lg border px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary bg-background", erros.produto_id ? "border-destructive" : "border-input")}
              >
                <option value="">Selecione…</option>
                {produtosDisponiveis.map((p) => (
                  <option key={p.valor} value={p.valor}>{p.texto}</option>
                ))}
              </select>
              {erros.produto_id && <p className="text-xs text-destructive">{erros.produto_id}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="qtd-ing" className="text-sm font-medium">Quantidade</label>
              <input
                id="qtd-ing"
                name="quantidade"
                type="number"
                step="0.001"
                min="0.001"
                required
                placeholder="Ex: 2.5"
                className={cn("min-h-11 w-28 rounded-lg border px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary", erros.quantidade ? "border-destructive" : "border-input")}
              />
              {erros.quantidade && <p className="text-xs text-destructive">{erros.quantidade}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="obs-ing" className="text-sm font-medium">Observação</label>
              <input
                id="obs-ing"
                name="observacao"
                placeholder="Ex: peneirado"
                className="min-h-11 rounded-lg border border-input px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-medium text-primary-foreground hover:bg-[var(--manjericao-escuro)] disabled:opacity-50"
              >
                <PlusIcon className="size-5" aria-hidden="true" />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
