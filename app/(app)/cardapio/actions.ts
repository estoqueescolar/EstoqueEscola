"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { falha, type ResultadoAcao } from "@/lib/erros";
import { exigirPermissao } from "@/lib/permissoes";
import { inicioDaSemana, REFEICOES } from "@/lib/regras/cardapio";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { errosPorCampo } from "@/lib/validacoes/auth";
import { esquemaDiaCardapio } from "@/lib/validacoes/cardapio";

// Salva as 4 refeições de um dia: preenchidas são gravadas; em branco são apagadas.
export async function salvarDiaCardapio(dados: unknown): Promise<ResultadoAcao> {
  let semana: string;
  try {
    await exigirPermissao("cadastrar");
    const v = esquemaDiaCardapio.safeParse(dados);
    if (!v.success) return { ok: false, mensagem: "Confira os campos destacados.", erros: errosPorCampo(v.error) };
    const { data } = v.data;

    const preenchidas = REFEICOES.filter(({ tipo }) => v.data[tipo]).map(({ tipo }) => ({ data, tipo_refeicao: tipo, descricao: v.data[tipo]! }));
    const vazias = REFEICOES.filter(({ tipo }) => !v.data[tipo]).map(({ tipo }) => tipo);

    const supabase = await criarClienteServidor();
    if (preenchidas.length) {
      const { error } = await supabase.from("cardapio_planejado").upsert(preenchidas, { onConflict: "data,tipo_refeicao" });
      if (error) return falha(error);
    }
    if (vazias.length) {
      const { data: existentes, error: erroLeitura } = await supabase
        .from("cardapio_planejado").select("id").eq("data", data).in("tipo_refeicao", vazias);
      if (erroLeitura) return falha(erroLeitura);
      if (existentes.length) {
        // RLS: só a direção apaga; sem permissão o delete não remove nada
        const { data: apagadas, error } = await supabase.from("cardapio_planejado").delete().in("id", existentes.map((e) => e.id)).select("id");
        if (error) return falha(error);
        if (apagadas.length < existentes.length) {
          return { ok: false, mensagem: "As refeições preenchidas foram salvas, mas só a direção pode apagar uma refeição já planejada." };
        }
      }
    }
    revalidatePath("/cardapio", "layout");
    semana = inicioDaSemana(data);
  } catch (erro) {
    return falha(erro);
  }
  redirect(`/cardapio?semana=${semana}`);
}
