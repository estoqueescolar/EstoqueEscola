"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { falha, type ResultadoAcao } from "@/lib/erros";
import { exigirPermissao } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { errosPorCampo } from "@/lib/validacoes/auth";
import { esquemaAluno, esquemaFotoCaminho } from "@/lib/validacoes/alunos";
import { esquemaTipoRestricao } from "@/lib/validacoes/cadastros";

const BUCKET = "fotos-alunos";
const esquemaId = z.uuid("Aluno inválido.");

function atualizarTelas() {
  revalidatePath("/restricoes/alunos");
  revalidatePath("/restricoes");
}

// fotoCaminho: undefined = mantém a foto atual | null = remove | texto = foto nova (já enviada ao bucket).
export async function salvarAluno(
  id: string | null,
  dados: unknown,
  fotoCaminho?: string | null,
): Promise<ResultadoAcao<{ id: string }>> {
  try {
    await exigirPermissao("cadastrar");
    const v = esquemaAluno.safeParse(dados);
    if (!v.success) return { ok: false, mensagem: "Confira os campos destacados.", erros: errosPorCampo(v.error) };
    const foto = esquemaFotoCaminho.safeParse(fotoCaminho);
    if (!foto.success) return { ok: false, mensagem: "A foto enviada é inválida. Escolha outra foto." };
    if (id !== null && !esquemaId.safeParse(id).success) return { ok: false, mensagem: "Aluno inválido." };

    const { restricoes, ...campos } = v.data;
    if (typeof foto.data === "string" && !campos.autorizacao_responsaveis) {
      return { ok: false, mensagem: "Para salvar a foto, marque que a família autorizou o uso do nome e da foto." };
    }
    const supabase = await criarClienteServidor();

    let alunoId = id;
    let fotoAntiga: string | null = null;
    if (id === null) {
      const { data, error } = await supabase
        .from("alunos")
        .insert(campos)
        .select("id")
        .single();
      if (error) return falha(error);
      alunoId = data.id;
    } else {
      const { data: atual, error: erroLeitura } = await supabase.from("alunos").select("foto_caminho").eq("id", id).eq("ativo", true).maybeSingle();
      if (erroLeitura) return falha(erroLeitura);
      if (!atual) return { ok: false, mensagem: "Aluno não encontrado. Ele pode ter sido excluído." };
      fotoAntiga = atual.foto_caminho;
      // Revogar a autorização apaga a foto no MESMO comando (o banco recusa autorização falsa com foto).
      const alteracao = campos.autorizacao_responsaveis ? campos : { ...campos, foto_caminho: null };
      const { error } = await supabase.from("alunos").update(alteracao).eq("id", id).eq("ativo", true);
      if (error) return falha(error);
    }
    if (alunoId === null) return falha(null);

    // Grava as restrições antes de remover as antigas: se algo falhar, o aluno nunca fica sem restrição.
    const { error: erroVinculos } = await supabase
      .from("alunos_restricoes")
      .upsert(
        restricoes.map((r) => ({ aluno_id: alunoId, tipo_restricao_id: r.tipo_restricao_id, nivel: r.nivel })),
        { onConflict: "aluno_id,tipo_restricao_id" },
      );
    if (erroVinculos) return falha(erroVinculos);

    const manter = restricoes.map((r) => r.tipo_restricao_id).join(",");
    const { error: erroRemocao } = await supabase
      .from("alunos_restricoes")
      .delete()
      .eq("aluno_id", alunoId)
      .not("tipo_restricao_id", "in", `(${manter})`);
    if (erroRemocao) return falha(erroRemocao);

    // A foto é o último passo: se algo antes falhar, nenhum aluno aponta para o arquivo enviado
    // e o navegador pode apagá-lo com segurança. O índice único impede dois alunos com o mesmo arquivo.
    // Sem autorização, a foto já foi zerada no update acima; só falta apagar o arquivo.
    const semAutorizacao = !campos.autorizacao_responsaveis;
    const fotoFinal = semAutorizacao ? (fotoAntiga ? null : undefined) : foto.data;
    if (fotoFinal !== undefined && !semAutorizacao) {
      const { error: erroFoto } = await supabase.from("alunos").update({ foto_caminho: fotoFinal }).eq("id", alunoId);
      if (erroFoto?.code === "23505") return { ok: false, mensagem: "Essa foto já pertence a outro aluno. Tire ou escolha outra foto." };
      if (erroFoto) return falha(erroFoto);
    }
    // Arquivo antigo: falha ao apagar não impede o salvamento (fica órfão no bucket).
    if (fotoAntiga && fotoFinal !== undefined && fotoFinal !== fotoAntiga) await supabase.storage.from(BUCKET).remove([fotoAntiga]);

    atualizarTelas();
    return { ok: true, dados: { id: alunoId }, mensagem: id === null ? "Aluno cadastrado." : "Aluno atualizado." };
  } catch (erro) {
    return falha(erro);
  }
}

export async function excluirAluno(id: string): Promise<ResultadoAcao> {
  try {
    await exigirPermissao("excluirCadastro");
    if (!esquemaId.safeParse(id).success) return { ok: false, mensagem: "Aluno inválido." };
    const supabase = await criarClienteServidor();
    const { data: aluno, error: erroLeitura } = await supabase.from("alunos").select("foto_caminho").eq("id", id).maybeSingle();
    if (erroLeitura) return falha(erroLeitura);
    const { error } = await supabase.from("alunos").delete().eq("id", id);
    if (error) return falha(error);
    if (aluno?.foto_caminho) await supabase.storage.from(BUCKET).remove([aluno.foto_caminho]);
    atualizarTelas();
    return { ok: true, mensagem: "Aluno excluído." };
  } catch (erro) {
    return falha(erro);
  }
}

// "+ Nova restrição" dentro do cadastro do aluno: a lista de alergias deixa de ser fixa.
export async function criarTipoRestricao(dados: unknown): Promise<ResultadoAcao<{ id: string; nome: string }>> {
  try {
    await exigirPermissao("cadastrar");
    const v = esquemaTipoRestricao.safeParse(dados);
    if (!v.success) return { ok: false, mensagem: "Confira o nome da restrição.", erros: errosPorCampo(v.error) };
    const supabase = await criarClienteServidor();
    const { data, error } = await supabase.from("tipos_restricao").insert(v.data).select("id, nome").single();
    if (error?.code === "23505") return { ok: false, mensagem: "Essa alergia já existe. Procure por ela na lista e marque." };
    if (error) return falha(error);
    revalidatePath("/restricoes");
    revalidatePath("/cadastros/restricoes");
    return { ok: true, dados: data, mensagem: `Alergia “${data.nome}” criada e marcada para este aluno.` };
  } catch (erro) {
    return falha(erro);
  }
}
