import { diferencaEmDias } from "./datas";
import type { LoteEstoque } from "./tipos";

// Valor padrão; o valor em uso vem de configuracoes.dias_alerta_validade.
export const DIAS_ALERTA_VALIDADE_PADRAO = 7;

export type SituacaoValidade = "vencido" | "proximo" | "ok";

export function classificarValidade(
  lote: Pick<LoteEstoque, "data_validade">,
  hoje: string,
  diasAlerta: number = DIAS_ALERTA_VALIDADE_PADRAO,
): SituacaoValidade {
  const dias = diferencaEmDias(hoje, lote.data_validade);
  if (dias < 0) return "vencido";
  if (dias <= diasAlerta) return "proximo";
  return "ok";
}

// Texto da etiqueta de validade: "Vence hoje", "Vence em 3 dias", "Vencido há 2 dias".
export function descreverValidade(dataValidade: string, hoje: string): string {
  const dias = diferencaEmDias(hoje, dataValidade);
  if (dias === 0) return "Vence hoje";
  if (dias === 1) return "Vence amanhã";
  if (dias > 1) return `Vence em ${dias} dias`;
  if (dias === -1) return "Vencido há 1 dia";
  return `Vencido há ${-dias} dias`;
}

// Lotes para o alerta: vencidos com quantidade > 0 e vencendo em até diasAlerta, ordenados por validade.
export function lotesEmAlerta<T extends Pick<LoteEstoque, "data_validade" | "quantidade">>(
  lotes: readonly T[],
  hoje: string,
  diasAlerta: number = DIAS_ALERTA_VALIDADE_PADRAO,
): (T & { situacao: Exclude<SituacaoValidade, "ok"> })[] {
  return lotes
    .filter((lote) => lote.quantidade > 0)
    .map((lote) => ({ ...lote, situacao: classificarValidade(lote, hoje, diasAlerta) }))
    .filter((lote): lote is T & { situacao: "vencido" | "proximo" } => lote.situacao !== "ok")
    .sort((a, b) => a.data_validade.localeCompare(b.data_validade));
}
