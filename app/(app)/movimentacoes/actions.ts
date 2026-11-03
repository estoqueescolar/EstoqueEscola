"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { falha, type ResultadoAcao } from "@/lib/erros";
import { exigirPermissao } from "@/lib/permissoes";
import { formatarQuantidade } from "@/lib/regras/quantidades";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { errosPorCampo } from "@/lib/validacoes/auth";
import { esquemaAjuste, esquemaEntrada, esquemaPerda, esquemaSaida } from "@/lib/validacoes/movimentacoes";

const MSG_CAMPOS = "Confira os campos destacados.";

// Toda movimentação muda estoque, lotes, alertas e histórico.
function atualizarTelas() {
  for (const rota of ["/painel", "/produtos", "/lotes", "/movimentacoes"]) revalidatePath(rota, "layout");
}

export async function registrarEntrada(dados: unknown): Promise<ResultadoAcao> {
  let loteId: string;
  try {
    await exigirPermissao("movimentar");
    const v = esquemaEntrada.safeParse(dados);
    if (!v.success) return { ok: false, mensagem: MSG_CAMPOS, erros: errosPorCampo(v.error) };

    const supabase = await criarClienteServidor();
    const { data, error } = await supabase.rpc("registrar_entrada", {
      p_produto_id: v.data.produto_id,
      p_quantidade: v.data.quantidade,
      p_data_validade: v.data.data_validade,
      p_data_entrada: v.data.data_entrada,
      p_codigo: v.data.codigo ?? undefined,
      p_fornecedor_id: v.data.fornecedor_id ?? undefined,
      p_local_id: v.data.local_id ?? undefined,
      p_observacao: v.data.observacao ?? undefined,
    });
    if (error) return falha(error);
    loteId = data;
    atualizarTelas();
  } catch (erro) {
    return falha(erro);
  }
  redirect(`/lotes/${loteId}?aviso=entrada`);
}

export interface RetiradaRegistrada {
  codigo: string;
  quantidade: number;
}

export async function registrarSaida(dados: unknown): Promise<ResultadoAcao<RetiradaRegistrada[]>> {
  try {
    await exigirPermissao("movimentar");
    const v = esquemaSaida.safeParse(dados);
    if (!v.success) return { ok: false, mensagem: MSG_CAMPOS, erros: errosPorCampo(v.error) };

    const supabase = await criarClienteServidor();
    const { data, error } = await supabase.rpc("registrar_saida", {
      p_produto_id: v.data.produto_id,
      p_quantidade: v.data.quantidade,
      p_observacao: v.data.observacao ?? undefined,
    });
    if (error) return falha(error);

    const retiradas = (data as unknown as RetiradaRegistrada[]).map((r) => ({ codigo: r.codigo, quantidade: Number(r.quantidade) }));
    const { data: produto } = await supabase.from("produtos").select("unidades(sigla)").eq("id", v.data.produto_id).single();
    const sigla = produto?.unidades?.sigla;
    atualizarTelas();
    return {
      ok: true,
      dados: retiradas,
      mensagem: `Saída registrada: ${retiradas.map((r) => `${formatarQuantidade(r.quantidade, sigla)} do lote ${r.codigo}`).join(" e ")}.`,
    };
  } catch (erro) {
    return falha(erro);
  }
}

export async function registrarPerda(dados: unknown): Promise<ResultadoAcao> {
  try {
    await exigirPermissao("movimentar");
    const v = esquemaPerda.safeParse(dados);
    if (!v.success) return { ok: false, mensagem: MSG_CAMPOS, erros: errosPorCampo(v.error) };

    const supabase = await criarClienteServidor();
    const { error } = await supabase.rpc("registrar_perda", {
      p_lote_id: v.data.lote_id,
      p_quantidade: v.data.quantidade,
      p_motivo: v.data.motivo,
      p_observacao: v.data.observacao ?? undefined,
    });
    if (error) return falha(error);
    atualizarTelas();
    return { ok: true, mensagem: "Perda registrada." };
  } catch (erro) {
    return falha(erro);
  }
}

export async function registrarAjuste(dados: unknown): Promise<ResultadoAcao> {
  try {
    await exigirPermissao("movimentar");
    const v = esquemaAjuste.safeParse(dados);
    if (!v.success) return { ok: false, mensagem: MSG_CAMPOS, erros: errosPorCampo(v.error) };

    const supabase = await criarClienteServidor();
    const { error } = await supabase.rpc("registrar_ajuste", {
      p_lote_id: v.data.lote_id,
      p_quantidade: v.data.quantidade,
      p_sentido: v.data.sentido,
      p_motivo: v.data.motivo,
      p_observacao: v.data.observacao ?? undefined,
    });
    if (error) return falha(error);
    atualizarTelas();
    return { ok: true, mensagem: v.data.sentido === 1 ? "Ajuste registrado: estoque aumentado." : "Ajuste registrado: estoque diminuído." };
  } catch (erro) {
    return falha(erro);
  }
}
