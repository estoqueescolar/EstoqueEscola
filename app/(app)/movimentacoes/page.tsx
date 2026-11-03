import type { Metadata } from "next";
import { ArrowUpFromLineIcon, ScaleIcon, Trash2Icon } from "lucide-react";
import { z } from "zod";
import { CabecalhoPagina, LinkBotao } from "@/components/comum/CabecalhoPagina";
import { ListaMovimentacoes } from "@/components/estoque/ListaMovimentacoes";
import { listarMovimentacoes } from "@/lib/dados/movimentacoes";
import { carregarOpcoesProdutoSimples } from "@/lib/dados/produtos";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { FiltrosMovimentacoes } from "./filtros";

export const metadata: Metadata = { title: "Movimentações · Despensa CAPE" };

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");
const dataValida = (v: string) => (z.iso.date().safeParse(v).success ? v : "");
const LIMITE = 300;

export default async function PaginaMovimentacoes({ searchParams }: PageProps<"/movimentacoes">) {
  const p = await searchParams;
  const tipo = texto(p.tipo);
  const filtros = {
    tipo: ["entrada", "saida", "perda", "ajuste"].includes(tipo) ? tipo : "",
    produto: z.uuid().safeParse(texto(p.produto)).success ? texto(p.produto) : "",
    inicio: dataValida(texto(p.inicio)),
    fim: dataValida(texto(p.fim)),
  };
  const [usuario, produtos, movimentacoes] = await Promise.all([
    obterUsuarioAtual(),
    carregarOpcoesProdutoSimples(),
    listarMovimentacoes({
      tipo: filtros.tipo || undefined,
      produtoId: filtros.produto || undefined,
      inicio: filtros.inicio || undefined,
      fim: filtros.fim || undefined,
      limite: LIMITE,
    }),
  ]);
  const filtrando = Object.values(filtros).some(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Movimentações"
        descricao="Histórico de entradas, saídas, perdas e ajustes. Registros não podem ser editados: para corrigir, faça um ajuste."
        acoes={
          pode(usuario?.perfil, "movimentar") && (
            <>
              <LinkBotao href="/movimentacoes/saida" principal>
                <ArrowUpFromLineIcon className="size-5" aria-hidden="true" /> Registrar saída
              </LinkBotao>
              <LinkBotao perigo href="/movimentacoes/perda">
                <Trash2Icon className="size-5" aria-hidden="true" /> Registrar perda
              </LinkBotao>
              <LinkBotao href="/movimentacoes/ajuste">
                <ScaleIcon className="size-5" aria-hidden="true" /> Registrar ajuste
              </LinkBotao>
            </>
          )
        }
      />
      <FiltrosMovimentacoes key={JSON.stringify(filtros)} produtos={produtos} valores={filtros} />
      <p role="status" className="text-muted-foreground">
        {movimentacoes.length === LIMITE
          ? `Mostrando as ${LIMITE} mais recentes. Use os filtros para ver períodos anteriores.`
          : movimentacoes.length === 1
            ? "1 movimentação"
            : `${movimentacoes.length} movimentações`}
      </p>
      <ListaMovimentacoes
        movimentacoes={movimentacoes}
        textoVazio={filtrando ? "Nenhuma movimentação com esses filtros." : "Nenhuma movimentação registrada ainda."}
      />
    </div>
  );
}
