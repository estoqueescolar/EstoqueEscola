"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { falha, type ResultadoAcao } from "@/lib/erros";
import { exigirPermissao } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { errosPorCampo } from "@/lib/validacoes/auth";
import { esquemaProduto } from "@/lib/validacoes/cadastros";

export async function salvarProduto(id: unknown, dados: unknown): Promise<ResultadoAcao> {
  let novoId: string | null = null;
  try {
    await exigirPermissao("cadastrar");
    const idValido = id == null ? null : z.uuid().parse(id);
    const validacao = esquemaProduto.safeParse(dados);
    if (!validacao.success) {
      return { ok: false, mensagem: "Confira os campos destacados.", erros: errosPorCampo(validacao.error) };
    }

    const supabase = await criarClienteServidor();
    if (idValido) {
      const { error } = await supabase.from("produtos").update(validacao.data).eq("id", idValido);
      if (error?.code === "23505") return { ok: false, mensagem: "Já existe um produto com esse nome.", erros: { nome: "Use outro nome." } };
      if (error) return falha(error);
    } else {
      const { data, error } = await supabase.from("produtos").insert(validacao.data).select("id").single();
      if (error?.code === "23505") return { ok: false, mensagem: "Já existe um produto com esse nome.", erros: { nome: "Use outro nome." } };
      if (error) return falha(error);
      novoId = data.id;
    }
    revalidatePath("/produtos");
  } catch (erro) {
    return falha(erro);
  }
  // redirect fora do try: ele sinaliza por exceção
  if (novoId) redirect(`/produtos/${novoId}?aviso=criado`);
  return { ok: true, mensagem: "Produto atualizado." };
}

export async function excluirProduto(id: unknown): Promise<ResultadoAcao> {
  try {
    await exigirPermissao("excluirCadastro");
    const idValido = z.uuid().parse(id);
    const supabase = await criarClienteServidor();
    const { data, error } = await supabase.from("produtos").delete().eq("id", idValido).select("id");
    if (error?.code === "23503") {
      return {
        ok: false,
        mensagem: "Este produto já tem lotes ou movimentações e não pode ser excluído. Marque-o como inativo para tirá-lo das listas.",
      };
    }
    if (error) return falha(error);
    if (!data?.length) return { ok: false, mensagem: "Este produto não existe mais ou você não pode excluí-lo. Atualize a página; se continuar, fale com a diretora." };
    revalidatePath("/produtos");
  } catch (erro) {
    return falha(erro);
  }
  redirect("/produtos?aviso=excluido");
}
