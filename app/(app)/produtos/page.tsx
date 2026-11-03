import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRightIcon, MapPinIcon, PlusIcon } from "lucide-react";
import { IndicadorEstoque, situacaoEstoque } from "@/components/estoque/IndicadorEstoque";
import { carregarOpcoesProduto, listarProdutos, type ProdutoListado } from "@/lib/dados/produtos";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { FiltrosProdutos } from "./filtros";

export const metadata: Metadata = { title: "Produtos · Despensa CAPE" };

const texto = (valor: string | string[] | undefined) => (typeof valor === "string" ? valor.trim() : "");
const semAcento = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function filtrar(produtos: ProdutoListado[], f: { busca: string; categoria: string; local: string; situacao: string }) {
  const busca = semAcento(f.busca);
  return produtos.filter((p) => {
    if (f.situacao === "inativos" ? p.ativo : !p.ativo) return false;
    if (busca && !semAcento(p.nome).includes(busca)) return false;
    if (f.categoria && p.categoria_id !== f.categoria) return false;
    if (f.local && p.local_id !== f.local) return false;
    const situacao = situacaoEstoque(p.estoque, p.estoque_minimo);
    if (f.situacao === "baixo" && situacao === "ok") return false;
    if (f.situacao === "ok" && situacao !== "ok") return false;
    return true;
  });
}

const AVISOS: Record<string, string> = { criado: "Produto cadastrado.", excluido: "Produto excluído." };
const plural = (n: number) => (n === 1 ? "1 produto" : `${n} produtos`);

export default async function PaginaProdutos({ searchParams }: PageProps<"/produtos">) {
  const parametros = await searchParams;
  const filtros = {
    busca: texto(parametros.busca),
    categoria: texto(parametros.categoria),
    local: texto(parametros.local),
    situacao: texto(parametros.situacao),
  };
  const [usuario, produtos, opcoes] = await Promise.all([obterUsuarioAtual(), listarProdutos(), carregarOpcoesProduto()]);
  const lista = filtrar(produtos, filtros);
  const chaveAviso = texto(parametros.aviso);
  const aviso = Object.hasOwn(AVISOS, chaveAviso) ? AVISOS[chaveAviso] : undefined;
  // base da contagem: ativos na lista normal, inativos quando o filtro pede inativos
  const base = produtos.filter((p) => (filtros.situacao === "inativos" ? !p.ativo : p.ativo));
  const filtrando = Boolean(filtros.busca || filtros.categoria || filtros.local || (filtros.situacao && filtros.situacao !== "inativos"));
  const podeCadastrar = pode(usuario?.perfil, "cadastrar");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Produtos</h1>
          <p className="mt-1 text-muted-foreground">Estoque somado de todos os lotes ativos de cada produto.</p>
        </div>
        {podeCadastrar && (
          <Link
            href="/produtos/novo"
            className="flex min-h-12 w-fit items-center gap-2 rounded-lg bg-primary px-5 text-base font-medium text-primary-foreground hover:bg-[var(--manjericao-escuro)]"
          >
            <PlusIcon className="size-5" aria-hidden="true" /> Cadastrar produto
          </Link>
        )}
      </div>
      {aviso && (
        <p role="status" className="rounded-lg border border-primary bg-ok-fundo p-3">
          {aviso}
        </p>
      )}

      <FiltrosProdutos key={JSON.stringify(filtros)} categorias={opcoes.categorias} locais={opcoes.locais} valores={filtros} />

      <p className="text-muted-foreground" role="status">
        {filtrando ? `${lista.length} de ${plural(base.length)}` : plural(lista.length)}
      </p>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">
          <p>
            {filtrando
              ? "Nenhum produto encontrado com esses filtros. Mude a busca ou toque em “Limpar filtros”."
              : base.length === 0 && produtos.length > 0 && filtros.situacao !== "inativos"
                ? "Todos os produtos estão inativos."
                : "Nenhum produto cadastrado ainda."}
          </p>
          {!filtrando && podeCadastrar && (
            <Link href="/produtos/novo" className="flex min-h-11 items-center font-medium text-primary underline underline-offset-4">
              Cadastrar produto
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((p) => (
            <li key={p.id}>
              <Link href={`/produtos/${p.id}`} className="flex h-full flex-col gap-3 rounded-xl border bg-card p-4 hover:border-primary">
                <span className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold break-words">{p.nome}</span>
                    <span className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
                      {p.categoria}
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPinIcon className="size-4" aria-hidden="true" /> {p.local}
                      </span>
                    </span>
                  </span>
                  <ChevronRightIcon className="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
                </span>
                <IndicadorEstoque estoque={p.estoque} minimo={p.estoque_minimo} sigla={p.sigla} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
