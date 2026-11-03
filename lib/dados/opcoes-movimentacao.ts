import "server-only";
import { calcularEstoqueProduto } from "@/lib/regras/estoque";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { LoteEstoque } from "@/lib/regras/tipos";

// Dados enviados aos formulários de movimentação (o cliente calcula a prévia FEFO com lib/regras).
export interface ProdutoParaMovimentar {
  id: string;
  nome: string;
  sigla: string;
  estoque: number;
  lotes: (LoteEstoque & { local: string })[];
}

export async function carregarProdutosParaMovimentar(): Promise<ProdutoParaMovimentar[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("produtos")
    .select("id, nome, unidades(sigla), lotes(id, codigo, quantidade, data_entrada, data_validade, locais_armazenamento(nome))")
    .eq("ativo", true)
    .order("nome");
  if (error) throw new Error("Não foi possível carregar os produtos.");

  return data.map((p) => {
    const lotes = p.lotes
      .map((l) => ({
        id: l.id,
        codigo: l.codigo,
        quantidade: Number(l.quantidade),
        data_entrada: l.data_entrada,
        data_validade: l.data_validade,
        local: l.locais_armazenamento?.nome ?? "",
      }))
      .sort((a, b) => a.data_validade.localeCompare(b.data_validade));
    return { id: p.id, nome: p.nome, sigla: p.unidades?.sigla ?? "", estoque: calcularEstoqueProduto(lotes), lotes };
  });
}
