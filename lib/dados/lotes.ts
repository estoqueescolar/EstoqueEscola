import "server-only";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export interface LoteListado {
  id: string;
  codigo: string;
  quantidade: number;
  quantidade_inicial: number;
  data_entrada: string;
  data_validade: string;
  ativo: boolean;
  observacao: string | null;
  produto_id: string;
  produto: string;
  sigla: string;
  local_id: string;
  local: string;
  fornecedor: string | null;
}

// Teto de segurança: um colégio tem dezenas de lotes ativos; encerrados podem acumular.
const LIMITE_LOTES = 500;

const COLUNAS =
  "id, codigo, quantidade, quantidade_inicial, data_entrada, data_validade, ativo, observacao, produto_id, local_id, produtos(nome, unidades(sigla)), locais_armazenamento(nome), fornecedores(nome)";

type Linha = {
  id: string; codigo: string; quantidade: number; quantidade_inicial: number; data_entrada: string;
  data_validade: string; ativo: boolean | null; observacao: string | null; produto_id: string; local_id: string;
  produtos: { nome: string; unidades: { sigla: string } | null } | null;
  locais_armazenamento: { nome: string } | null;
  fornecedores: { nome: string } | null;
};

function converter(l: Linha): LoteListado {
  return {
    id: l.id,
    codigo: l.codigo,
    quantidade: Number(l.quantidade),
    quantidade_inicial: Number(l.quantidade_inicial),
    data_entrada: l.data_entrada,
    data_validade: l.data_validade,
    ativo: Boolean(l.ativo),
    observacao: l.observacao,
    produto_id: l.produto_id,
    produto: l.produtos?.nome ?? "",
    sigla: l.produtos?.unidades?.sigla ?? "",
    local_id: l.local_id,
    local: l.locais_armazenamento?.nome ?? "",
    fornecedor: l.fornecedores?.nome ?? null,
  };
}

// Lotes ordenados pela validade (o que vence antes aparece primeiro).
export async function listarLotes({ incluirInativos = false, produtoId }: { incluirInativos?: boolean; produtoId?: string } = {}) {
  const supabase = await criarClienteServidor();
  let consulta = supabase.from("lotes").select(COLUNAS).order("data_validade").order("data_entrada").limit(LIMITE_LOTES);
  if (!incluirInativos) consulta = consulta.gt("quantidade", 0);
  if (produtoId) consulta = consulta.eq("produto_id", produtoId);
  const { data, error } = await consulta;
  if (error) throw new Error("Não foi possível carregar os lotes.");
  return (data as unknown as Linha[]).map(converter);
}

export async function obterLote(id: string): Promise<LoteListado | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("lotes").select(COLUNAS).eq("id", id).maybeSingle();
  return data ? converter(data as unknown as Linha) : null;
}
