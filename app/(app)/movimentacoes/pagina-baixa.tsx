import { notFound } from "next/navigation";
import { z } from "zod";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { obterConfiguracoes } from "@/lib/dados/configuracoes";
import { carregarProdutosParaMovimentar } from "@/lib/dados/opcoes-movimentacao";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { hojeNoColegio } from "@/lib/regras/datas";
import { FormularioBaixaNoLote } from "./baixa-no-lote";

const TEXTOS = {
  perda: {
    titulo: "Registrar perda",
    descricao: "Alimento vencido, estragado ou descartado. Escolha o lote e informe o motivo.",
  },
  ajuste: {
    titulo: "Registrar ajuste",
    descricao: "Correção de inventário: quando a contagem na prateleira não bate com o sistema.",
  },
} as const;

// Página compartilhada por /movimentacoes/perda e /movimentacoes/ajuste.
export async function PaginaBaixa({ tipo, lote }: { tipo: "perda" | "ajuste"; lote?: string }) {
  if (!pode((await obterUsuarioAtual())?.perfil, "movimentar")) notFound();
  const [produtos, config] = await Promise.all([carregarProdutosParaMovimentar(), obterConfiguracoes()]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <CabecalhoPagina titulo={TEXTOS[tipo].titulo} descricao={TEXTOS[tipo].descricao} voltar={{ href: "/movimentacoes", texto: "Movimentações" }} />
      <section className="rounded-xl border bg-card p-4 sm:p-6">
        <FormularioBaixaNoLote tipo={tipo} produtos={produtos} hoje={hojeNoColegio()} diasAlerta={config.diasAlertaValidade} loteInicial={z.uuid().safeParse(lote).success ? lote : undefined} />
      </section>
    </div>
  );
}
