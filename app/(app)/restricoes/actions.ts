"use server";

import { revalidatePath } from "next/cache";
import { falha, type ResultadoAcao } from "@/lib/erros";
import { exigirPermissao } from "@/lib/permissoes";
import { totalAlunos } from "@/lib/regras/cardapio";
import { formatarData } from "@/lib/regras/datas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { errosPorCampo } from "@/lib/validacoes/auth";
import { esquemaContagens } from "@/lib/validacoes/cardapio";

// Grava a contagem de uma refeição (zeros também, para a cozinha poder corrigir).
export async function salvarContagens(dados: unknown): Promise<ResultadoAcao> {
  try {
    await exigirPermissao("cadastrar");
    const v = esquemaContagens.safeParse(dados);
    if (!v.success) return { ok: false, mensagem: "Confira os números destacados.", erros: errosPorCampo(v.error) };
    const { data, tipo_refeicao, contagens } = v.data;
    if (!contagens.length) return { ok: false, mensagem: "Cadastre ao menos um tipo de restrição em Cadastros." };

    const supabase = await criarClienteServidor();
    const { error } = await supabase
      .from("contagem_restricoes")
      .upsert(
        contagens.map((c) => ({ data, tipo_refeicao, ...c })),
        { onConflict: "data,tipo_refeicao,tipo_restricao_id" },
      );
    if (error) return falha(error);

    revalidatePath("/restricoes");
    revalidatePath("/cardapio");
    const total = totalAlunos(contagens);
    return { ok: true, mensagem: `Contagem salva: ${total} ${total === 1 ? "aluno" : "alunos"} com restrição.` };
  } catch (erro) {
    return falha(erro);
  }
}
