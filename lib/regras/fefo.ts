import { calcularEstoqueDisponivel, calcularEstoqueProduto } from "./estoque";
import { arredondar, formatarQuantidade } from "./quantidades";
import type { LoteEstoque, Resultado } from "./tipos";

export interface RetiradaLote {
  lote_id: string;
  codigo: string;
  quantidade: number;
}

// Ordem FEFO: validade mais próxima primeiro; empate pela entrada mais antiga.
export function ordenarFefo<T extends Pick<LoteEstoque, "data_validade" | "data_entrada">>(lotes: readonly T[]): T[] {
  return [...lotes].sort(
    (a, b) => a.data_validade.localeCompare(b.data_validade) || a.data_entrada.localeCompare(b.data_entrada),
  );
}

interface DadosSaida {
  nomeProduto: string;
  sigla: string;
  lotes: readonly LoteEstoque[];
  quantidade: number;
  hoje: string;
}

// Bloqueia saída maior que o estoque disponível (lotes vencidos não contam: viram perda).
export function validarSaida({ nomeProduto, sigla, lotes, quantidade, hoje }: DadosSaida): Resultado {
  if (!(quantidade > 0)) {
    return { ok: false, mensagem: "Informe uma quantidade maior que zero." };
  }
  const disponivel = calcularEstoqueDisponivel(lotes, hoje);
  if (arredondar(quantidade) <= disponivel) return { ok: true };

  const vencido = arredondar(calcularEstoqueProduto(lotes) - disponivel);
  let mensagem =
    `Estoque insuficiente de ${nomeProduto}: há ${formatarQuantidade(disponivel, sigla)} disponíveis ` +
    `e você tentou retirar ${formatarQuantidade(quantidade, sigla)}.`;
  if (vencido > 0) {
    mensagem += ` Há também ${formatarQuantidade(vencido, sigla)} em lotes vencidos, que devem ser registrados como perda.`;
  }
  return { ok: false, mensagem: `${mensagem} Confira a quantidade ou registre uma entrada antes.` };
}

// Planeja de quais lotes sai a quantidade, pelo método FEFO. Pode dividir entre lotes.
// Pressupõe que validarSaida() já aprovou a quantidade.
export function planejarSaidaFefo(lotes: readonly LoteEstoque[], quantidade: number, hoje: string): RetiradaLote[] {
  const candidatos = ordenarFefo(lotes.filter((lote) => lote.quantidade > 0 && lote.data_validade >= hoje));
  const retiradas: RetiradaLote[] = [];
  let restante = arredondar(quantidade);

  for (const lote of candidatos) {
    if (restante <= 0) break;
    const retirar = arredondar(Math.min(lote.quantidade, restante));
    retiradas.push({ lote_id: lote.id, codigo: lote.codigo, quantidade: retirar });
    restante = arredondar(restante - retirar);
  }
  return retiradas;
}
