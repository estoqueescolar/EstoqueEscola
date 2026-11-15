import type { Metadata } from "next";
import Link from "next/link";
import { PhoneIcon } from "lucide-react";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { IndicadorEstoque } from "@/components/estoque/IndicadorEstoque";
import { carregarSituacaoEstoque } from "@/lib/dados/painel";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { formatarQuantidade } from "@/lib/regras/quantidades";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { ExportarLista } from "./exportar";
import { ItensExtras } from "./itens-extras";

export const metadata: Metadata = { title: "Lista de compras · Despensa CAPE" };

export default async function PaginaCompras() {
  const supabase = await criarClienteServidor();
  const [{ listaCompras }, usuario, { data: extras }] = await Promise.all([
    carregarSituacaoEstoque(),
    obterUsuarioAtual(),
    supabase.from("lista_compras_manual").select("id, nome, quantidade, unidade, comprado").order("comprado").order("criado_em"),
  ]);

  const podeEditar = pode(usuario?.perfil, "movimentar");
  const totalItens = listaCompras.length + (extras?.filter((i) => !i.comprado).length ?? 0);

  return (
    <div className="flex flex-col gap-8">
      <CabecalhoPagina
        titulo="Lista de compras"
        descricao="Produtos com estoque abaixo do mínimo e itens extras adicionados manualmente."
        acoes={<ExportarLista />}
      />

      {/* Estoque baixo — automático */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Estoque baixo</h2>
          <span className="text-sm text-muted-foreground">
            {listaCompras.length === 0 ? "Nada para comprar" : listaCompras.length === 1 ? "1 produto" : `${listaCompras.length} produtos`}
          </span>
        </div>

        {listaCompras.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">
            Todos os produtos estão acima do estoque mínimo.
          </p>
        ) : (
          <ul className="flex flex-col gap-2" data-tour="lista-compras">
            {listaCompras.map((item) => (
              <li key={item.produto_id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-col gap-2">
                  <Link href={`/produtos/${item.produto_id}`} className="inline-flex min-h-11 w-fit items-center text-lg font-semibold break-words underline-offset-4 hover:underline">
                    {item.nome}
                  </Link>
                  <IndicadorEstoque estoque={item.estoque_atual} minimo={item.estoque_minimo} sigla={item.sigla_unidade} />
                </div>
                <div className="flex shrink-0 flex-col gap-1 md:items-end md:text-right">
                  <p>
                    <span className="text-sm text-muted-foreground">Comprar </span>
                    <span className="font-heading text-xl font-semibold">{formatarQuantidade(item.quantidade_a_comprar, item.sigla_unidade)}</span>
                  </p>
                  {item.fornecedor && <p className="text-sm text-muted-foreground">{item.fornecedor}</p>}
                  {item.telefone_fornecedor && (
                    <a
                      href={`tel:${item.telefone_fornecedor.replace(/[^\d+]/g, "")}`}
                      className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      <PhoneIcon className="size-4" aria-hidden="true" /> {item.telefone_fornecedor}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Itens extras — manual */}
      <ItensExtras itens={extras ?? []} podeEditar={podeEditar} />

      {totalItens > 0 && (
        <p className="text-sm text-muted-foreground">
          Total pendente: {totalItens} {totalItens === 1 ? "item" : "itens"} · Baixe em PDF ou Excel para levar às compras.
        </p>
      )}
    </div>
  );
}
