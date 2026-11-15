"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { falha, type ResultadoAcao } from "@/lib/erros";
import { exigirPermissao } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const esquemaReceita = z.object({
  nome: z.string().min(1, "Informe o nome da receita.").max(120),
  descricao: z.string().max(500).optional(),
  modo_preparo: z.string().max(5000).optional(),
  porcoes_base: z.coerce.number().int().min(1, "Mínimo 1 porção."),
});

const esquemaIngrediente = z.object({
  produto_id: z.uuid("Produto inválido."),
  quantidade: z.coerce.number().positive("Quantidade deve ser maior que zero."),
  observacao: z.string().max(200).optional(),
});

export async function criarReceita(dados: unknown): Promise<ResultadoAcao<{ id: string }>> {
  await exigirPermissao("movimentar");
  const v = esquemaReceita.safeParse(dados);
  if (!v.success) {
    const erros = Object.fromEntries(Object.entries(v.error.flatten().fieldErrors).map(([k, e]) => [k, e?.[0] ?? ""]));
    return { ok: false, mensagem: "Confira os campos.", erros };
  }
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("receitas").insert({
    nome: v.data.nome.trim(),
    descricao: v.data.descricao?.trim() || null,
    modo_preparo: v.data.modo_preparo?.trim() || null,
    porcoes_base: v.data.porcoes_base,
  }).select("id").single();
  if (error) return falha(error);
  revalidatePath("/receitas");
  redirect(`/receitas/${data.id}`);
}

export async function atualizarReceita(id: string, dados: unknown): Promise<ResultadoAcao> {
  await exigirPermissao("movimentar");
  if (!z.uuid().safeParse(id).success) return { ok: false, mensagem: "ID inválido." };
  const v = esquemaReceita.safeParse(dados);
  if (!v.success) {
    const erros = Object.fromEntries(Object.entries(v.error.flatten().fieldErrors).map(([k, e]) => [k, e?.[0] ?? ""]));
    return { ok: false, mensagem: "Confira os campos.", erros };
  }
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("receitas").update({
    nome: v.data.nome.trim(),
    descricao: v.data.descricao?.trim() || null,
    modo_preparo: v.data.modo_preparo?.trim() || null,
    porcoes_base: v.data.porcoes_base,
  }).eq("id", id);
  if (error) return falha(error);
  revalidatePath(`/receitas/${id}`);
  revalidatePath("/receitas");
  return { ok: true, mensagem: "Receita atualizada." };
}

export async function desativarReceita(id: string): Promise<ResultadoAcao> {
  await exigirPermissao("cadastrar");
  if (!z.uuid().safeParse(id).success) return { ok: false, mensagem: "ID inválido." };
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("receitas").update({ ativo: false }).eq("id", id);
  if (error) return falha(error);
  revalidatePath("/receitas");
  redirect("/receitas");
}

export async function adicionarIngrediente(receita_id: string, dados: unknown): Promise<ResultadoAcao> {
  await exigirPermissao("movimentar");
  if (!z.uuid().safeParse(receita_id).success) return { ok: false, mensagem: "ID inválido." };
  const v = esquemaIngrediente.safeParse(dados);
  if (!v.success) {
    const erros = Object.fromEntries(Object.entries(v.error.flatten().fieldErrors).map(([k, e]) => [k, e?.[0] ?? ""]));
    return { ok: false, mensagem: "Confira os campos.", erros };
  }
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("ingredientes_receita").insert({
    receita_id,
    produto_id: v.data.produto_id,
    quantidade: v.data.quantidade,
    observacao: v.data.observacao?.trim() || null,
  });
  if (error) return falha(error);
  revalidatePath(`/receitas/${receita_id}`);
  return { ok: true, mensagem: "Ingrediente adicionado." };
}

export async function removerIngrediente(ingrediente_id: string, receita_id: string): Promise<ResultadoAcao> {
  await exigirPermissao("movimentar");
  if (!z.uuid().safeParse(ingrediente_id).success) return { ok: false, mensagem: "ID inválido." };
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("ingredientes_receita").delete().eq("id", ingrediente_id);
  if (error) return falha(error);
  revalidatePath(`/receitas/${receita_id}`);
  return { ok: true, mensagem: "" };
}

// Integração A: registra saída FEFO de todos os ingredientes para N porções.
export async function prepararReceita(receita_id: string, porcoes: number): Promise<ResultadoAcao> {
  await exigirPermissao("movimentar");
  if (!z.uuid().safeParse(receita_id).success) return { ok: false, mensagem: "ID inválido." };
  if (!Number.isInteger(porcoes) || porcoes < 1) return { ok: false, mensagem: "Informe quantas porções preparar." };

  const supabase = await criarClienteServidor();
  const { data: receita, error: erReceita } = await supabase
    .from("receitas")
    .select("id, nome, porcoes_base, ingredientes_receita(produto_id, quantidade, produtos(nome, unidades(sigla)))")
    .eq("id", receita_id)
    .single();
  if (erReceita || !receita) return { ok: false, mensagem: "Receita não encontrada." };

  const fator = porcoes / receita.porcoes_base;
  const ingredientes = (receita.ingredientes_receita ?? []) as {
    produto_id: string; quantidade: number;
    produtos: { nome: string; unidades: { sigla: string } | null } | null;
  }[];

  if (!ingredientes.length) return { ok: false, mensagem: "Esta receita não tem ingredientes cadastrados." };

  // Registra saída para cada ingrediente via RPC FEFO
  const erros: string[] = [];
  for (const ing of ingredientes) {
    const qtd = Number((ing.quantidade * fator).toFixed(4));
    const { error } = await supabase.rpc("registrar_saida", {
      p_produto_id: ing.produto_id,
      p_quantidade: qtd,
      p_motivo: `Preparo de ${porcoes} porção(ões) de "${receita.nome}"`,
    });
    if (error) {
      const nomeProduto = ing.produtos?.nome ?? ing.produto_id;
      erros.push(`${nomeProduto}: ${error.message}`);
    }
  }

  if (erros.length) return { ok: false, mensagem: `Erro ao registrar alguns ingredientes:\n${erros.join("\n")}` };

  revalidatePath("/movimentacoes");
  revalidatePath("/lotes");
  revalidatePath("/painel");
  return { ok: true, mensagem: `Saída registrada para ${porcoes} porção(ões) de "${receita.nome}".` };
}
