import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScaleIcon, Trash2Icon } from "lucide-react";
import { z } from "zod";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { CabecalhoPagina, LinkBotao } from "@/components/comum/CabecalhoPagina";
import { EtiquetaValidade } from "@/components/estoque/EtiquetaValidade";
import { ListaMovimentacoes } from "@/components/estoque/ListaMovimentacoes";
import { obterConfiguracoes } from "@/lib/dados/configuracoes";
import { obterLote } from "@/lib/dados/lotes";
import { listarMovimentacoes } from "@/lib/dados/movimentacoes";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { formatarData, hojeNoColegio } from "@/lib/regras/datas";
import { formatarQuantidade } from "@/lib/regras/quantidades";

export const metadata: Metadata = { title: "Lote · Despensa CAPE" };

export default async function PaginaLote({ params, searchParams }: PageProps<"/lotes/[id]">) {
  const { id } = await params;
  const { aviso } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();
  const [lote, usuario, config, movimentacoes] = await Promise.all([
    obterLote(id),
    obterUsuarioAtual(),
    obterConfiguracoes(),
    listarMovimentacoes({ loteId: id }),
  ]);
  if (!lote) notFound();
  const hoje = hojeNoColegio();
  const podeMovimentar = pode(usuario?.perfil, "movimentar");

  const dados = [
    ["Quantidade atual", formatarQuantidade(lote.quantidade, lote.sigla)],
    ["Quantidade recebida", formatarQuantidade(lote.quantidade_inicial, lote.sigla)],
    ["Data de entrada", formatarData(lote.data_entrada)],
    ["Data de validade", formatarData(lote.data_validade)],
    ["Local", lote.local],
    ["Fornecedor", lote.fornecedor ?? "Não informado"],
  ];

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      {aviso === "entrada" && <AvisoFormulario tipo="sucesso">Entrada registrada. O lote já conta no estoque.</AvisoFormulario>}
      <CabecalhoPagina
        titulo={`Lote ${lote.codigo}`}
        descricao={
          <Link href={`/produtos/${lote.produto_id}`} className="text-lg font-medium text-foreground underline underline-offset-4">
            {lote.produto}
          </Link>
        }
        voltar={{ href: "/lotes", texto: "Lotes e validade" }}
        acoes={
          podeMovimentar && (
            <>
              {lote.ativo && (
                <LinkBotao perigo href={`/movimentacoes/perda?lote=${lote.id}`}>
                  <Trash2Icon className="size-5" aria-hidden="true" /> Registrar perda
                </LinkBotao>
              )}
              <LinkBotao href={`/movimentacoes/ajuste?lote=${lote.id}`}>
                <ScaleIcon className="size-5" aria-hidden="true" /> Registrar ajuste
              </LinkBotao>
            </>
          )
        }
      />
      {lote.ativo ? (
        <EtiquetaValidade dataValidade={lote.data_validade} hoje={hoje} diasAlerta={config.diasAlertaValidade} />
      ) : (
        <p className="font-medium text-muted-foreground">Lote encerrado: a quantidade chegou a zero. Ele continua no histórico.</p>
      )}
      <dl className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {dados.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <dt className="text-sm text-muted-foreground">{rotulo}</dt>
            <dd className="text-lg font-medium">{valor}</dd>
          </div>
        ))}
        {lote.observacao && (
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm text-muted-foreground">Observação</dt>
            <dd>{lote.observacao}</dd>
          </div>
        )}
      </dl>
      <section aria-labelledby="titulo-historico" className="flex flex-col gap-3">
        <h2 id="titulo-historico" className="text-xl font-semibold">Histórico do lote</h2>
        <ListaMovimentacoes movimentacoes={movimentacoes} mostrarProduto={false} textoVazio="Nenhuma movimentação neste lote." />
      </section>
    </div>
  );
}
