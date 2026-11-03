"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { falha, type ResultadoAcao } from "@/lib/erros";
import { CONFIG_CADASTROS } from "@/lib/cadastros-config";
import { exigirPermissao } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { errosPorCampo } from "@/lib/validacoes/auth";
import { ESQUEMAS_CADASTRO, TABELAS_CADASTRO, TIPOS_CADASTRO } from "@/lib/validacoes/cadastros";

const esquemaTipo = z.enum(TIPOS_CADASTRO);
const esquemaId = z.uuid();

export async function salvarCadastro(tipo: unknown, id: unknown, dados: unknown): Promise<ResultadoAcao> {
  try {
    await exigirPermissao("cadastrar");
    const tipoValido = esquemaTipo.parse(tipo);
    const idValido = id == null ? null : esquemaId.parse(id);
    const validacao = ESQUEMAS_CADASTRO[tipoValido].safeParse(dados);
    if (!validacao.success) {
      return { ok: false, mensagem: "Confira os campos destacados.", erros: errosPorCampo(validacao.error) };
    }

    const supabase = await criarClienteServidor();
    // As tabelas têm formatos diferentes; o Zod acima já garantiu o formato certo para cada uma.
    const tabela = supabase.from(TABELAS_CADASTRO[tipoValido] as "categorias");
    const valores = validacao.data as never;
    const { error } = idValido ? await tabela.update(valores).eq("id", idValido) : await tabela.insert(valores);
    if (error) return falha(error);

    revalidatePath(`/cadastros/${tipoValido}`);
    revalidatePath("/produtos");
    const { singular, artigo } = CONFIG_CADASTROS[tipoValido];
    return { ok: true, mensagem: `${singular[0].toUpperCase()}${singular.slice(1)} ${idValido ? "atualizad" : "cadastrad"}${artigo}.` };
  } catch (erro) {
    return falha(erro);
  }
}

export async function excluirCadastro(tipo: unknown, id: unknown): Promise<ResultadoAcao> {
  try {
    await exigirPermissao("excluirCadastro");
    const tipoValido = esquemaTipo.parse(tipo);
    const idValido = esquemaId.parse(id);

    const supabase = await criarClienteServidor();
    const { data, error } = await supabase
      .from(TABELAS_CADASTRO[tipoValido] as "categorias")
      .delete()
      .eq("id", idValido)
      .select("id");
    if (error?.code === "23503") {
      return { ok: false, mensagem: "Não dá para excluir: há produtos, lotes ou contagens usando este cadastro. Altere-os antes." };
    }
    if (error) return falha(error);
    if (!data?.length) return { ok: false, mensagem: "Este item não existe mais ou você não pode excluí-lo. Atualize a página; se continuar, fale com a diretora." };

    revalidatePath(`/cadastros/${tipoValido}`);
    const { singular, artigo } = CONFIG_CADASTROS[tipoValido];
    return { ok: true, mensagem: `${singular[0].toUpperCase()}${singular.slice(1)} excluíd${artigo}.` };
  } catch (erro) {
    return falha(erro);
  }
}
