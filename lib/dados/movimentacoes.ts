import "server-only";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { TipoMovimentacao } from "@/lib/regras/movimentacoes";

export interface MovimentacaoListada {
  id: string;
  operacao_id: string;
  tipo: TipoMovimentacao;
  sentido: 1 | -1;
  quantidade: number;
  data_hora: string;
  motivo: string | null;
  observacao: string | null;
  responsavel: string | null;
  produto_id: string;
  produto: string;
  sigla: string;
  lote_id: string;
  lote: string;
  local: string;
}

export interface FiltrosMovimentacoes {
  tipo?: string;
  produtoId?: string;
  loteId?: string;
  inicio?: string; // AAAA-MM-DD (dia inteiro, fuso do colégio)
  fim?: string;
  limite?: number;
}

const LIMITE_PADRAO = 300;

// Converte o dia local (America/Sao_Paulo, UTC-3 sem horário de verão) em instante UTC.
const inicioDoDia = (dia: string) => `${dia}T00:00:00-03:00`;
const fimDoDia = (dia: string) => `${dia}T23:59:59.999-03:00`;

export async function listarMovimentacoes(filtros: FiltrosMovimentacoes = {}): Promise<MovimentacaoListada[]> {
  const supabase = await criarClienteServidor();
  let consulta = supabase
    .from("movimentacoes")
    .select(
      "id, operacao_id, tipo, sentido, quantidade, data_hora, motivo, observacao, responsavel, produto_id, lote_id, produtos(nome, unidades(sigla)), lotes(codigo), locais_armazenamento(nome)",
    )
    .order("data_hora", { ascending: false })
    .limit(filtros.limite ?? LIMITE_PADRAO);
  if (filtros.tipo) consulta = consulta.eq("tipo", filtros.tipo);
  if (filtros.produtoId) consulta = consulta.eq("produto_id", filtros.produtoId);
  if (filtros.loteId) consulta = consulta.eq("lote_id", filtros.loteId);
  if (filtros.inicio) consulta = consulta.gte("data_hora", inicioDoDia(filtros.inicio));
  if (filtros.fim) consulta = consulta.lte("data_hora", fimDoDia(filtros.fim));

  const { data, error } = await consulta;
  if (error) throw new Error("Não foi possível carregar o histórico.");
  return data.map((m) => ({
    id: m.id,
    operacao_id: m.operacao_id,
    tipo: m.tipo as TipoMovimentacao,
    sentido: m.sentido === 1 ? 1 : -1,
    quantidade: Number(m.quantidade),
    data_hora: m.data_hora,
    motivo: m.motivo,
    observacao: m.observacao,
    responsavel: m.responsavel,
    produto_id: m.produto_id,
    produto: m.produtos?.nome ?? "",
    sigla: m.produtos?.unidades?.sigla ?? "",
    lote_id: m.lote_id,
    lote: m.lotes?.codigo ?? "",
    local: m.locais_armazenamento?.nome ?? "",
  }));
}
