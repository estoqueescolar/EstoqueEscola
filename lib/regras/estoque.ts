import { arredondar } from "./quantidades";
import type { LoteEstoque } from "./tipos";

// Lote com quantidade zero fica inativo (continua no histórico).
export function loteAtivo(lote: Pick<LoteEstoque, "quantidade">): boolean {
  return lote.quantidade > 0;
}

// Estoque do produto = soma das quantidades dos lotes ativos.
export function calcularEstoqueProduto(lotes: readonly Pick<LoteEstoque, "quantidade">[]): number {
  return arredondar(lotes.filter(loteAtivo).reduce((soma, lote) => soma + lote.quantidade, 0));
}

// Estoque disponível para consumo: lotes ativos e não vencidos.
export function calcularEstoqueDisponivel(lotes: readonly LoteEstoque[], hoje: string): number {
  return calcularEstoqueProduto(lotes.filter((lote) => lote.data_validade >= hoje));
}

// Estoque baixo: igual ou abaixo do mínimo.
export function estoqueBaixo(estoque: number, minimo: number): boolean {
  return arredondar(estoque) <= arredondar(minimo);
}
