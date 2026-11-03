import "server-only";
import { calcularEstoqueProduto } from "@/lib/regras/estoque";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export interface ProdutoListado {
  id: string;
  nome: string;
  ativo: boolean;
  estoque_minimo: number;
  estoque: number;
  categoria_id: string;
  categoria: string;
  local_id: string;
  local: string;
  sigla: string;
  fornecedor: string | null;
}

// Produtos com o estoque calculado pela soma dos lotes ativos (regra em lib/regras/estoque.ts).
export async function listarProdutos(): Promise<ProdutoListado[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("produtos")
    .select(
      "id, nome, ativo, estoque_minimo, categoria_id, local_padrao_id, categorias(nome), unidades(sigla), locais_armazenamento(nome), fornecedores(nome), lotes(quantidade)",
    )
    .order("nome");
  if (error) throw new Error("Não foi possível carregar os produtos.");

  return (data ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    ativo: p.ativo,
    estoque_minimo: Number(p.estoque_minimo),
    estoque: calcularEstoqueProduto(p.lotes.map((l) => ({ quantidade: Number(l.quantidade) }))),
    categoria_id: p.categoria_id,
    categoria: p.categorias?.nome ?? "",
    local_id: p.local_padrao_id,
    local: p.locais_armazenamento?.nome ?? "",
    sigla: p.unidades?.sigla ?? "",
    fornecedor: p.fornecedores?.nome ?? null,
  }));
}

export interface OpcoesProduto {
  categorias: { valor: string; texto: string }[];
  unidades: { valor: string; texto: string }[];
  locais: { valor: string; texto: string }[];
  fornecedores: { valor: string; texto: string }[];
}

// Listas para os campos de seleção do formulário e dos filtros.
export async function carregarOpcoesProduto(): Promise<OpcoesProduto> {
  const supabase = await criarClienteServidor();
  const [categorias, unidades, locais, fornecedores] = await Promise.all([
    supabase.from("categorias").select("id, nome").order("nome"),
    supabase.from("unidades").select("id, sigla, nome").order("nome"),
    supabase.from("locais_armazenamento").select("id, nome").order("nome"),
    supabase.from("fornecedores").select("id, nome").order("nome"),
  ]);
  if (categorias.error || unidades.error || locais.error || fornecedores.error) {
    throw new Error("Não foi possível carregar as listas de cadastro.");
  }
  return {
    categorias: categorias.data.map((c) => ({ valor: c.id, texto: c.nome })),
    unidades: unidades.data.map((u) => ({ valor: u.id, texto: `${u.nome} (${u.sigla})` })),
    locais: locais.data.map((l) => ({ valor: l.id, texto: l.nome })),
    fornecedores: fornecedores.data.map((f) => ({ valor: f.id, texto: f.nome })),
  };
}

// Só nome e id, para filtros (inclui inativos: o histórico pode ter produtos desativados).
export async function carregarOpcoesProdutoSimples(): Promise<{ valor: string; texto: string }[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("produtos").select("id, nome").order("nome");
  if (error) throw new Error("Não foi possível carregar os produtos.");
  return data.map((p) => ({ valor: p.id, texto: p.nome }));
}
