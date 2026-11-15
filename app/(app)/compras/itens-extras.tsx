"use client";

import { useRef, useState, useTransition } from "react";
import { CheckIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { adicionarItemLista, limparComprados, marcarComprado, removerItemLista } from "./actions";

interface Item {
  id: string;
  nome: string;
  quantidade: string;
  unidade: string;
  comprado: boolean;
}

interface Props {
  itens: Item[];
  podeEditar: boolean;
}

export function ItensExtras({ itens, podeEditar }: Props) {
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const temComprados = itens.some((i) => i.comprado);

  async function adicionar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setErro("");
    setErros({});
    startTransition(async () => {
      const r = await adicionarItemLista({ nome: fd.get("nome"), quantidade: fd.get("quantidade"), unidade: fd.get("unidade") });
      if (!r.ok) {
        setErro(r.mensagem);
        setErros(r.erros ?? {});
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Itens extras</h2>
        {podeEditar && temComprados && (
          <button
            type="button"
            onClick={() => startTransition(async () => { await limparComprados(); })}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            <Trash2Icon className="size-4" aria-hidden="true" /> Limpar comprados
          </button>
        )}
      </div>

      {itens.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
          Nenhum item extra. Use o formulário abaixo para adicionar.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {itens.map((item) => (
            <li key={item.id} className={cn("flex items-center gap-3 rounded-xl border bg-card p-3", item.comprado && "opacity-60")}>
              {podeEditar && (
                <button
                  type="button"
                  aria-label={item.comprado ? `Desmarcar ${item.nome}` : `Marcar ${item.nome} como comprado`}
                  onClick={() => startTransition(async () => { await marcarComprado(item.id, !item.comprado); })}
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    item.comprado ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary",
                  )}
                >
                  {item.comprado && <CheckIcon className="size-3.5" aria-hidden="true" />}
                </button>
              )}
              <span className={cn("flex-1 text-base font-medium", item.comprado && "line-through")}>
                {item.nome}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {item.quantidade}{item.unidade ? ` ${item.unidade}` : ""}
                </span>
              </span>
              {podeEditar && (
                <button
                  type="button"
                  aria-label={`Remover ${item.nome}`}
                  onClick={() => startTransition(async () => { await removerItemLista(item.id); })}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-destructive"
                >
                  <XIcon className="size-4" aria-hidden="true" />
                </button>
              )}
              {!podeEditar && (
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-sm font-medium", item.comprado ? "bg-ok-fundo text-primary" : "bg-muted text-muted-foreground")}>
                  {item.comprado ? "Comprado" : "Pendente"}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {podeEditar && (
        <form ref={formRef} onSubmit={adicionar} className="rounded-xl border bg-card p-4">
          <p className="mb-3 text-sm font-medium">Adicionar item</p>
          {erro && <p role="alert" className="mb-3 rounded-lg bg-perigo-fundo p-2 text-sm text-destructive">{erro}</p>}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <div className="flex flex-col gap-1">
              <label htmlFor="nome-item" className="text-sm font-medium">Item</label>
              <input
                id="nome-item"
                name="nome"
                required
                placeholder="Ex: Papel toalha"
                className={cn("min-h-11 rounded-lg border px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary", erros.nome ? "border-destructive" : "border-input")}
              />
              {erros.nome && <p className="text-xs text-destructive">{erros.nome}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="qtd-item" className="text-sm font-medium">Quantidade</label>
              <input
                id="qtd-item"
                name="quantidade"
                required
                placeholder="Ex: 3"
                className={cn("min-h-11 w-28 rounded-lg border px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary", erros.quantidade ? "border-destructive" : "border-input")}
              />
              {erros.quantidade && <p className="text-xs text-destructive">{erros.quantidade}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="unidade-item" className="text-sm font-medium">Unidade</label>
              <input
                id="unidade-item"
                name="unidade"
                placeholder="Ex: kg"
                className="min-h-11 w-20 rounded-lg border border-input px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
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
