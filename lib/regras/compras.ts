import { calcularEstoqueProduto, estoqueBaixo } from "./estoque";
import { arredondar } from "./quantidades";
import type { LoteEstoque, ProdutoEstoque } from "./tipos";

export interface ItemListaCompras {
  produto_id: string;
  nome: string;
  sigla_unidade: string;
  estoque_atual: number;
  estoque_minimo: number;
  // quanto falta para atingir o mínimo (0 quando o estoque é exatamente o mínimo)
  quantidade_a_comprar: number;
  fornecedor: string | null;
  telefone_fornecedor: string | null;
}

// Lista de compras: produtos com estoque ativo <= mínimo, com quanto falta para o mínimo.
export function gerarListaCompras(
  produtos: readonly ProdutoEstoque[],
  lotesPorProduto: ReadonlyMap<string, readonly LoteEstoque[]>,
): ItemListaCompras[] {
  return produtos
    .map((produto) => ({ produto, estoque: calcularEstoqueProduto(lotesPorProduto.get(produto.id) ?? []) }))
    .filter(({ produto, estoque }) => estoqueBaixo(estoque, produto.estoque_minimo))
    .map(({ produto, estoque }) => ({
      produto_id: produto.id,
      nome: produto.nome,
      sigla_unidade: produto.sigla_unidade,
      estoque_atual: estoque,
      estoque_minimo: produto.estoque_minimo,
      quantidade_a_comprar: arredondar(Math.max(produto.estoque_minimo - estoque, 0)),
      fornecedor: produto.fornecedor?.nome ?? null,
      telefone_fornecedor: produto.fornecedor?.telefone ?? null,
    }))
    .sort((a, b) => b.quantidade_a_comprar / (b.estoque_minimo || 1) - a.quantidade_a_comprar / (a.estoque_minimo || 1));
}
