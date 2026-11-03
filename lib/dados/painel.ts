import "server-only";
import { gerarListaCompras, type ItemListaCompras } from "@/lib/regras/compras";
import { hojeNoColegio } from "@/lib/regras/datas";
import { agruparPorProduto, calcularIndicadores, type IndicadoresPainel } from "@/lib/regras/painel";
import { lotesEmAlerta } from "@/lib/regras/validade";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { obterConfiguracoes } from "./configuracoes";
import { listarLotes, type LoteListado } from "./lotes";

export interface SituacaoEstoque {
  hoje: string;
  diasAlerta: number;
  alertasValidade: (LoteListado & { situacao: "vencido" | "proximo" })[];
  listaCompras: ItemListaCompras[];
  indicadores: IndicadoresPainel;
  produtosAtivos: number;
}

// Alertas de validade, estoque baixo e lista de compras (regras puras em lib/regras).
export async function carregarSituacaoEstoque(): Promise<SituacaoEstoque> {
  const supabase = await criarClienteServidor();
  const [config, lotes, produtos] = await Promise.all([
    obterConfiguracoes(),
    listarLotes(),
    supabase
      .from("produtos")
      .select("id, nome, estoque_minimo, unidades(sigla), fornecedores(nome, telefone)")
      .eq("ativo", true)
      .order("nome"),
  ]);
  if (produtos.error) throw new Error("Não foi possível carregar os produtos.");

  const hoje = hojeNoColegio();
  const ativos = produtos.data.map((p) => ({
    id: p.id,
    nome: p.nome,
    estoque_minimo: Number(p.estoque_minimo),
    sigla_unidade: p.unidades?.sigla ?? "",
    fornecedor: p.fornecedores ? { nome: p.fornecedores.nome, telefone: p.fornecedores.telefone } : null,
  }));
  const idsAtivos = new Set(ativos.map((p) => p.id));
  const alertasValidade = lotesEmAlerta(lotes, hoje, config.diasAlertaValidade);
  const listaCompras = gerarListaCompras(ativos, agruparPorProduto(lotes.filter((l) => idsAtivos.has(l.produto_id))));

  return {
    hoje,
    diasAlerta: config.diasAlertaValidade,
    alertasValidade,
    listaCompras,
    indicadores: calcularIndicadores(alertasValidade, listaCompras),
    produtosAtivos: ativos.length,
  };
}
