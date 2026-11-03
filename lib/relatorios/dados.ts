import "server-only";
import { carregarSituacaoEstoque } from "@/lib/dados/painel";
import { listarLotes } from "@/lib/dados/lotes";
import { listarMovimentacoes } from "@/lib/dados/movimentacoes";
import { hojeNoColegio } from "@/lib/regras/datas";
import { montarCompras, montarConsumo, montarPerdas, type ConteudoRelatorio, type TipoRelatorio } from "@/lib/regras/relatorios";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Teto de linhas lidas por relatório (um ano de uma cozinha escolar fica bem abaixo disso).
const LIMITE_MOVIMENTACOES = 20_000;

const diaNoColegio = (instante: string) => hojeNoColegio(new Date(instante));

async function categoriasPorProduto(): Promise<Map<string, string>> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("produtos").select("id, categorias(nome)");
  if (error) throw new Error("Não foi possível carregar as categorias.");
  return new Map(data.map((p) => [p.id, p.categorias?.nome ?? "Sem categoria"]));
}

// Lê os dados com a sessão do usuário (o RLS vale também para os relatórios).
export async function carregarConteudo(tipo: TipoRelatorio, inicio: string, fim: string): Promise<ConteudoRelatorio> {
  if (tipo === "consumo") {
    const [saidas, categorias] = await Promise.all([
      listarMovimentacoes({ tipo: "saida", inicio, fim, limite: LIMITE_MOVIMENTACOES }),
      categoriasPorProduto(),
    ]);
    return montarConsumo(
      saidas.map((s) => ({
        produto_id: s.produto_id, produto: s.produto, categoria: categorias.get(s.produto_id) ?? "Sem categoria",
        sigla: s.sigla, quantidade: s.quantidade, operacao_id: s.operacao_id,
      })),
    );
  }

  if (tipo === "perdas") {
    const hoje = hojeNoColegio();
    const [lotes, movimentacoes] = await Promise.all([listarLotes(), listarMovimentacoes({ inicio, fim, limite: LIMITE_MOVIMENTACOES })]);
    const vencidos = lotes
      .filter((l) => l.quantidade > 0 && l.data_validade < hoje && l.data_validade >= inicio && l.data_validade <= fim)
      .map((l) => ({ data_validade: l.data_validade, produto: l.produto, lote: l.codigo, quantidade: l.quantidade, sigla: l.sigla }));
    const baixas = movimentacoes
      .filter((m) => m.tipo === "perda" || (m.tipo === "ajuste" && m.sentido === -1))
      .map((m) => ({
        data: diaNoColegio(m.data_hora), tipo: m.tipo as "perda" | "ajuste", produto: m.produto, lote: m.lote,
        quantidade: m.quantidade, sigla: m.sigla, motivo: m.motivo, responsavel: m.responsavel,
      }));
    return montarPerdas(vencidos, baixas);
  }

  const [{ listaCompras }, categorias] = await Promise.all([carregarSituacaoEstoque(), categoriasPorProduto()]);
  return montarCompras(listaCompras.map((i) => ({ ...i, categoria: categorias.get(i.produto_id) ?? "Sem categoria" })));
}
