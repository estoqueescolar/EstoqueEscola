import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownToLineIcon, ArrowUpFromLineIcon, ChevronLeftIcon } from "lucide-react";
import { z } from "zod";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { LinkBotao } from "@/components/comum/CabecalhoPagina";
import { CartaoLote } from "@/components/estoque/CartaoLote";
import { IndicadorEstoque } from "@/components/estoque/IndicadorEstoque";
import { obterConfiguracoes } from "@/lib/dados/configuracoes";
import { listarLotes } from "@/lib/dados/lotes";
import { hojeNoColegio } from "@/lib/regras/datas";
import { carregarOpcoesProduto } from "@/lib/dados/produtos";
import { calcularEstoqueProduto } from "@/lib/regras/estoque";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioProduto } from "../formulario";

export const metadata: Metadata = { title: "Produto · Despensa CAPE" };

export default async function PaginaProduto({ params, searchParams }: PageProps<"/produtos/[id]">) {
  const { id } = await params;
  const { aviso } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await criarClienteServidor();
  const [usuario, opcoes, config, lotes, { data: produto }] = await Promise.all([
    obterUsuarioAtual(),
    carregarOpcoesProduto(),
    obterConfiguracoes(),
    listarLotes({ produtoId: id }),
    supabase.from("produtos").select("*, unidades(sigla), lotes(quantidade)").eq("id", id).maybeSingle(),
  ]);
  if (!produto) notFound();

  const estoque = calcularEstoqueProduto(produto.lotes.map((l) => ({ quantidade: Number(l.quantidade) })));
  const podeEditar = pode(usuario?.perfil, "cadastrar");

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href="/produtos" className="flex min-h-11 w-fit items-center gap-1 font-medium text-primary underline underline-offset-4">
        <ChevronLeftIcon className="size-5" aria-hidden="true" /> Produtos
      </Link>
      {aviso === "criado" && <AvisoFormulario tipo="sucesso">Produto cadastrado. Agora você pode registrar a entrada dos lotes.</AvisoFormulario>}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl break-words">{produto.nome}</h1>
        <IndicadorEstoque estoque={estoque} minimo={Number(produto.estoque_minimo)} sigla={produto.unidades?.sigla ?? ""} />
        {pode(usuario?.perfil, "movimentar") && produto.ativo && (
          <div className="flex flex-wrap gap-2">
            <LinkBotao href={`/lotes/entrada?produto=${produto.id}`} principal>
              <ArrowDownToLineIcon className="size-5" aria-hidden="true" /> Registrar entrada
            </LinkBotao>
            {estoque > 0 && (
              <LinkBotao href={`/movimentacoes/saida?produto=${produto.id}`}>
                <ArrowUpFromLineIcon className="size-5" aria-hidden="true" /> Registrar saída
              </LinkBotao>
            )}
          </div>
        )}
      </div>
      <section aria-labelledby="titulo-lotes" className="flex flex-col gap-3">
        <h2 id="titulo-lotes" className="text-xl font-semibold">Lotes com estoque</h2>
        {lotes.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">Nenhum lote com estoque.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {lotes.map((lote) => (
              <li key={lote.id}>
                <CartaoLote lote={lote} hoje={hojeNoColegio()} diasAlerta={config.diasAlertaValidade} mostrarProduto={false} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="titulo-dados" className="rounded-xl border bg-card p-4 sm:p-6">
        <h2 id="titulo-dados" className="mb-4 text-xl font-semibold">
          {podeEditar ? "Editar dados do produto" : "Dados do produto"}
        </h2>
        {podeEditar ? (
          <FormularioProduto
            opcoes={opcoes}
            podeExcluir={pode(usuario?.perfil, "excluirCadastro")}
            produto={{
              id: produto.id,
              nome: produto.nome,
              valores: {
                nome: produto.nome,
                categoria_id: produto.categoria_id,
                unidade_id: produto.unidade_id,
                local_padrao_id: produto.local_padrao_id,
                fornecedor_id: produto.fornecedor_id ?? "",
                estoque_minimo: String(Number(produto.estoque_minimo)).replace(".", ","),
                ativo: produto.ativo,
              },
            }}
          />
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Categoria", opcoes.categorias.find((c) => c.valor === produto.categoria_id)?.texto],
              ["Unidade", opcoes.unidades.find((u) => u.valor === produto.unidade_id)?.texto],
              ["Local", opcoes.locais.find((l) => l.valor === produto.local_padrao_id)?.texto],
              ["Fornecedor", opcoes.fornecedores.find((f) => f.valor === produto.fornecedor_id)?.texto ?? "Nenhum"],
            ].map(([rotulo, valor]) => (
              <div key={rotulo}>
                <dt className="text-sm text-muted-foreground">{rotulo}</dt>
                <dd className="text-lg">{valor ?? "Não informado"}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}
