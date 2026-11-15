import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon, UtensilsIcon } from "lucide-react";
import { CabecalhoPagina, LinkBotao } from "@/components/comum/CabecalhoPagina";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Receitas · Despensa CAPE" };

export default async function PaginaReceitas() {
  const supabase = await criarClienteServidor();
  const [usuario, { data: receitas }] = await Promise.all([
    obterUsuarioAtual(),
    supabase
      .from("receitas")
      .select("id, nome, descricao, porcoes_base, ativo, ingredientes_receita(id)")
      .order("nome"),
  ]);

  const podeEditar = pode(usuario?.perfil, "movimentar");
  const ativas = receitas?.filter((r) => r.ativo) ?? [];
  const inativas = receitas?.filter((r) => !r.ativo) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Receitas"
        descricao="Caderno de receitas da cozinha. Prepare uma receita para registrar a saída dos ingredientes automaticamente."
        acoes={
          podeEditar && (
            <LinkBotao href="/receitas/nova" principal data-tour="btn-nova-receita">
              <PlusIcon className="size-5" aria-hidden="true" /> Nova receita
            </LinkBotao>
          )
        }
      />

      {ativas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card p-8 text-center text-muted-foreground">
          <UtensilsIcon className="size-10 text-muted-foreground/50" aria-hidden="true" />
          <p>Nenhuma receita cadastrada ainda.</p>
          {podeEditar && (
            <Link href="/receitas/nova" className="font-medium text-primary underline underline-offset-4">
              Cadastrar primeira receita
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" data-tour="lista-receitas">
          {ativas.map((r) => (
            <li key={r.id}>
              <Link
                href={`/receitas/${r.id}`}
                className="flex h-full flex-col gap-2 rounded-xl border bg-card p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-lg font-semibold break-words">{r.nome}</span>
                  <span className="shrink-0 rounded-full bg-ok-fundo px-2.5 py-1 text-xs font-medium text-primary">
                    {r.porcoes_base} {r.porcoes_base === 1 ? "porção" : "porções"}
                  </span>
                </div>
                {r.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{r.descricao}</p>
                )}
                <p className="mt-auto text-sm text-muted-foreground">
                  {r.ingredientes_receita.length === 0
                    ? "Sem ingredientes"
                    : r.ingredientes_receita.length === 1
                      ? "1 ingrediente"
                      : `${r.ingredientes_receita.length} ingredientes`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {inativas.length > 0 && (
        <details className="rounded-xl border bg-card p-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            {inativas.length} receita{inativas.length > 1 ? "s" : ""} desativada{inativas.length > 1 ? "s" : ""}
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {inativas.map((r) => (
              <li key={r.id}>
                <Link href={`/receitas/${r.id}`} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                  {r.nome}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
