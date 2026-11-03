"use server";

import { revalidatePath } from "next/cache";
import { falha, type ResultadoAcao } from "@/lib/erros";
import { exigirPermissao } from "@/lib/permissoes";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  errosPorCampo,
  esquemaAlterarUsuario,
  esquemaAtivarUsuario,
  esquemaCriarUsuario,
} from "@/lib/validacoes/auth";

// "Para sempre" no Supabase Auth: ~100 anos.
const BLOQUEIO_PERMANENTE = "876000h";

export async function criarUsuario(dados: unknown): Promise<ResultadoAcao> {
  try {
    await exigirPermissao("gerenciarUsuarios");
    const validacao = esquemaCriarUsuario.safeParse(dados);
    if (!validacao.success) {
      return { ok: false, mensagem: "Confira os campos destacados.", erros: errosPorCampo(validacao.error) };
    }
    const { nome, email, senha, perfil } = validacao.data;

    // A chave de serviço só é usada aqui, depois de confirmar que quem pede é administrador.
    const admin = criarClienteAdmin();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome },
    });
    if (error) return falha(error);

    // o gatilho do banco criou o perfil como "consulta"; aplica o perfil escolhido
    const { error: erroPerfil } = await admin.from("perfis").update({ perfil, nome }).eq("id", data.user.id);
    if (erroPerfil) {
      // não deixa conta "consulta" órfã com senha conhecida
      await admin.auth.admin.deleteUser(data.user.id);
      return falha(erroPerfil);
    }

    revalidatePath("/usuarios");
    return { ok: true, mensagem: `Conta de ${nome} criada. Passe o e-mail e a senha para a pessoa.` };
  } catch (erro) {
    return falha(erro);
  }
}

export async function alterarPerfil(dados: unknown): Promise<ResultadoAcao> {
  try {
    await exigirPermissao("gerenciarUsuarios");
    const validacao = esquemaAlterarUsuario.safeParse(dados);
    if (!validacao.success) return { ok: false, mensagem: "Escolha um perfil válido." };

    // Cliente do próprio administrador: RLS e o gatilho proteger_perfis continuam valendo.
    const supabase = await criarClienteServidor();
    const { data, error } = await supabase
      .from("perfis")
      .update({ perfil: validacao.data.perfil })
      .eq("id", validacao.data.id)
      .select("id");
    if (error) return falha(error);
    if (!data?.length) return { ok: false, mensagem: "Usuário não encontrado." };

    revalidatePath("/usuarios");
    return { ok: true, mensagem: "Perfil alterado." };
  } catch (erro) {
    return falha(erro);
  }
}

export async function definirAcesso(dados: unknown): Promise<ResultadoAcao> {
  try {
    await exigirPermissao("gerenciarUsuarios");
    const validacao = esquemaAtivarUsuario.safeParse(dados);
    if (!validacao.success) return { ok: false, mensagem: "Usuário inválido." };
    const { id, ativo } = validacao.data;

    // Primeiro o login no Supabase Auth; se a gravação no banco falhar, desfaz.
    const admin = criarClienteAdmin();
    const banir = (bloquear: boolean) =>
      admin.auth.admin.updateUserById(id, { ban_duration: bloquear ? BLOQUEIO_PERMANENTE : "none" });

    const { error: erroAuth } = await banir(!ativo);
    if (erroAuth) return falha(erroAuth);

    // Cliente do próprio administrador: o gatilho impede desativar a si mesmo e o último administrador.
    const supabase = await criarClienteServidor();
    const { data, error } = await supabase.from("perfis").update({ ativo }).eq("id", id).select("id");
    if (error || !data?.length) {
      await banir(ativo);
      return error ? falha(error) : { ok: false, mensagem: "Usuário não encontrado." };
    }

    revalidatePath("/usuarios");
    return { ok: true, mensagem: ativo ? "Acesso reativado." : "Acesso desativado." };
  } catch (erro) {
    return falha(erro);
  }
}
