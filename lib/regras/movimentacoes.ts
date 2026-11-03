import { arredondar, formatarQuantidade } from "./quantidades";
import type { Resultado } from "./tipos";

export type TipoMovimentacao = "entrada" | "saida" | "perda" | "ajuste";
export type Sentido = 1 | -1;

interface DadosMovimentacao {
  tipo: TipoMovimentacao;
  quantidade: number;
  motivo?: string | null;
}

// Regras comuns: quantidade > 0 e motivo obrigatório em perda e ajuste.
export function validarMovimentacao({ tipo, quantidade, motivo }: DadosMovimentacao): Resultado {
  if (!(quantidade > 0)) return { ok: false, mensagem: "Informe uma quantidade maior que zero." };
  if ((tipo === "perda" || tipo === "ajuste") && !motivo?.trim()) {
    return { ok: false, mensagem: "Informe o motivo. Ele é obrigatório para perdas e ajustes." };
  }
  return { ok: true };
}

interface LoteParaBaixa {
  codigo: string;
  quantidade: number;
}

// Perda ou ajuste negativo não pode deixar o lote abaixo de zero.
export function validarBaixaNoLote(lote: LoteParaBaixa, quantidade: number, sigla: string): Resultado {
  if (arredondar(quantidade) <= arredondar(lote.quantidade)) return { ok: true };
  return {
    ok: false,
    mensagem: `O lote ${lote.codigo} tem apenas ${formatarQuantidade(lote.quantidade, sigla)}. Informe uma quantidade igual ou menor.`,
  };
}

// Nova quantidade do lote após um ajuste (não altera o objeto original).
export function aplicarAjuste(quantidadeAtual: number, quantidade: number, sentido: Sentido): number {
  return arredondar(quantidadeAtual + sentido * quantidade);
}
