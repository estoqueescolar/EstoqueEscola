import type { ItemListaCompras } from "./compras";
import { formatarQuantidade } from "./quantidades";
import type { SituacaoValidade } from "./validade";

export interface IndicadoresPainel {
  vencidos: number;
  proximos: number;
  estoqueBaixo: number;
  semEstoque: number;
}

// Agrupa lotes por produto (entrada de gerarListaCompras).
export function agruparPorProduto<T extends { produto_id: string }>(lotes: readonly T[]): Map<string, T[]> {
  const mapa = new Map<string, T[]>();
  for (const lote of lotes) mapa.set(lote.produto_id, [...(mapa.get(lote.produto_id) ?? []), lote]);
  return mapa;
}

// Contagens do topo do painel a partir dos alertas já calculados.
export function calcularIndicadores(
  alertasValidade: readonly { situacao: Exclude<SituacaoValidade, "ok"> }[],
  listaCompras: readonly Pick<ItemListaCompras, "estoque_atual">[],
): IndicadoresPainel {
  return {
    vencidos: alertasValidade.filter((a) => a.situacao === "vencido").length,
    proximos: alertasValidade.filter((a) => a.situacao === "proximo").length,
    estoqueBaixo: listaCompras.length,
    semEstoque: listaCompras.filter((i) => i.estoque_atual <= 0).length,
  };
}

export interface ItemExtraCompra {
  nome: string;
  quantidade: string;
  unidade: string;
}

// Texto da lista de compras para colar no WhatsApp ou e-mail do fornecedor.
// Extras = itens adicionados à mão ainda não comprados (passe só os pendentes).
export function textoListaCompras(
  itens: readonly ItemListaCompras[],
  dataFormatada: string,
  extras: readonly ItemExtraCompra[] = [],
): string {
  if (!itens.length && !extras.length) return `Lista de compras (${dataFormatada}): nada abaixo do mínimo.`;
  const linhas = itens.map(
    (i) => `- ${i.nome}: ${formatarQuantidade(i.quantidade_a_comprar, i.sigla_unidade)}${i.fornecedor ? ` (${i.fornecedor})` : ""}`,
  );
  const linhasExtras = extras.map((e) => `- ${e.nome}: ${[e.quantidade.trim(), e.unidade.trim()].filter(Boolean).join(" ")}`);
  return [`Lista de compras (${dataFormatada})`, ...linhas, ...linhasExtras].join("\n");
}
