import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { obterConfiguracoes } from "@/lib/dados/configuracoes";
import { carregarProdutosParaMovimentar } from "@/lib/dados/opcoes-movimentacao";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { hojeNoColegio } from "@/lib/regras/datas";
import { FormularioSaida } from "./formulario";

export const metadata: Metadata = { title: "Registrar saída · Despensa CAPE" };

export default async function PaginaSaida({ searchParams }: PageProps<"/movimentacoes/saida">) {
  if (!pode((await obterUsuarioAtual())?.perfil, "movimentar")) notFound();
  const { produto } = await searchParams;
  const [produtos, config] = await Promise.all([carregarProdutosParaMovimentar(), obterConfiguracoes()]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Registrar saída"
        descricao="Alimento usado no preparo das refeições. O sistema tira primeiro do lote que vence antes."
        voltar={{ href: "/movimentacoes", texto: "Movimentações" }}
      />
      <section className="rounded-xl border bg-card p-4 sm:p-6">
        <FormularioSaida
          produtos={produtos.filter((p) => p.estoque > 0)}
          hoje={hojeNoColegio()}
          diasAlerta={config.diasAlertaValidade}
          produtoInicial={typeof produto === "string" ? produto : ""}
        />
      </section>
    </div>
  );
}
