import type { Metadata } from "next";
import Link from "next/link";
import { PhoneIcon } from "lucide-react";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { IndicadorEstoque } from "@/components/estoque/IndicadorEstoque";
import { carregarSituacaoEstoque } from "@/lib/dados/painel";
import { formatarData } from "@/lib/regras/datas";
import { textoListaCompras } from "@/lib/regras/painel";
import { formatarQuantidade } from "@/lib/regras/quantidades";
import { CopiarLista } from "./copiar-lista";

export const metadata: Metadata = { title: "Lista de compras · Despensa CAPE" };

export default async function PaginaCompras() {
  const { listaCompras, hoje } = await carregarSituacaoEstoque();

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Lista de compras"
        descricao="Produtos com estoque igual ou abaixo do mínimo e quanto falta para chegar ao mínimo."
        acoes={listaCompras.length > 0 && <CopiarLista texto={textoListaCompras(listaCompras, formatarData(hoje))} />}
      />
      <p role="status" className="text-muted-foreground">
        {listaCompras.length === 0
          ? "Nada para comprar agora."
          : listaCompras.length === 1
            ? "1 produto para comprar"
            : `${listaCompras.length} produtos para comprar`}
      </p>
      {listaCompras.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">
          Todos os produtos estão acima do estoque mínimo.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
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
    </div>
  );
}
