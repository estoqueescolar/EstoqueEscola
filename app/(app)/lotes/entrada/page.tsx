import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { carregarOpcoesProduto } from "@/lib/dados/produtos";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { hojeNoColegio } from "@/lib/regras/datas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioEntrada } from "./formulario";

export const metadata: Metadata = { title: "Registrar entrada · Despensa CAPE" };

export default async function PaginaEntrada({ searchParams }: PageProps<"/lotes/entrada">) {
  if (!pode((await obterUsuarioAtual())?.perfil, "movimentar")) notFound();
  const { produto } = await searchParams;
  const supabase = await criarClienteServidor();
  const [opcoes, { data: produtos }] = await Promise.all([
    carregarOpcoesProduto(),
    supabase.from("produtos").select("id, nome, unidades(sigla)").eq("ativo", true).order("nome"),
  ]);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Registrar entrada"
        descricao="Recebimento de mercadoria. Cada entrada cria um lote com a sua data de validade."
        voltar={{ href: "/lotes", texto: "Lotes e validade" }}
      />
      <section className="rounded-xl border bg-card p-4 sm:p-6">
        <FormularioEntrada
          produtos={(produtos ?? []).map((p) => ({ valor: p.id, texto: p.nome, sigla: p.unidades?.sigla ?? "" }))}
          locais={opcoes.locais}
          fornecedores={opcoes.fornecedores}
          hoje={hojeNoColegio()}
          produtoInicial={typeof produto === "string" ? produto : ""}
        />
      </section>
    </div>
  );
}
