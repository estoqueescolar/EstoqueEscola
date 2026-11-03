"use server";

import { revalidatePath } from "next/cache";
import { falha, type ResultadoAcao } from "@/lib/erros";
import { exigirPermissao } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { errosPorCampo } from "@/lib/validacoes/auth";
import { esquemaConfiguracoes } from "@/lib/validacoes/configuracoes";

export async function salvarConfiguracoes(dados: unknown): Promise<ResultadoAcao> {
  try {
    await exigirPermissao("alterarConfiguracoes");
    const v = esquemaConfiguracoes.safeParse(dados);
    if (!v.success) return { ok: false, mensagem: "Confira os campos destacados.", erros: errosPorCampo(v.error) };

    const supabase = await criarClienteServidor();
    const { data, error } = await supabase
      .from("configuracoes")
      .update({ valor: v.data.dias_alerta_validade })
      .eq("chave", "dias_alerta_validade")
      .select("id");
    if (error) return falha(error);
    // RLS sem permissão não gera erro: só não altera nenhuma linha
    if (!data.length) return { ok: false, mensagem: "Não foi possível salvar o prazo. Tente de novo." };

    for (const rota of ["/painel", "/lotes", "/configuracoes", "/compras"]) revalidatePath(rota, "layout");
    const dias = v.data.dias_alerta_validade;
    return { ok: true, mensagem: `Prazo salvo: o alerta de validade agora avisa com ${dias} ${dias === 1 ? "dia" : "dias"} de antecedência.` };
  } catch (erro) {
    return falha(erro);
  }
}
