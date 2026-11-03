"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_RECUPERACAO } from "@/lib/recuperacao";
import { falha, type ResultadoAcao } from "@/lib/erros";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  errosPorCampo,
  esquemaCadastro,
  esquemaLogin,
  esquemaNovaSenha,
  esquemaRecuperarSenha,
} from "@/lib/validacoes/auth";

function urlDoSite(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

// Aceita só caminhos internos (evita redirecionar para outro site).
function destinoSeguro(caminho: unknown): string {
  return typeof caminho === "string" && /^\/(?!\/)[\w\-/]*$/.test(caminho) ? caminho : "/painel";
}

const MSG_DADOS_INVALIDOS = "Confira os campos destacados.";

export async function entrar(dados: unknown, voltar?: string): Promise<ResultadoAcao> {
  const validacao = esquemaLogin.safeParse(dados);
  if (!validacao.success) {
    return { ok: false, mensagem: MSG_DADOS_INVALIDOS, erros: errosPorCampo(validacao.error) };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: validacao.data.email,
    password: validacao.data.senha,
  });
  if (error) return falha(error);

  redirect(destinoSeguro(voltar));
}

export async function cadastrar(dados: unknown): Promise<ResultadoAcao> {
  const validacao = esquemaCadastro.safeParse(dados);
  if (!validacao.success) {
    return { ok: false, mensagem: MSG_DADOS_INVALIDOS, erros: errosPorCampo(validacao.error) };
  }

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email: validacao.data.email,
    password: validacao.data.senha,
    // o perfil NÃO vai nos metadados: o banco sempre cria a conta como "consulta"
    options: { data: { nome: validacao.data.nome }, emailRedirectTo: `${urlDoSite()}/auth/confirmar` },
  });
  // Resposta neutra para e-mail já cadastrado: não revela quem tem conta.
  const emailJaUsado = error?.code === "user_already_exists" || error?.code === "email_exists";
  if (error && !emailJaUsado) return falha(error);

  if (data.session) redirect("/painel?aviso=conta-criada");
  return {
    ok: true,
    mensagem:
      "Pronto! Se este e-mail puder ser usado, enviamos um link para ele. Abra a mensagem e toque no link para confirmar. Se você já tem conta, use “Esqueci minha senha”.",
  };
}

export async function solicitarRecuperacao(dados: unknown): Promise<ResultadoAcao> {
  const validacao = esquemaRecuperarSenha.safeParse(dados);
  if (!validacao.success) {
    return { ok: false, mensagem: MSG_DADOS_INVALIDOS, erros: errosPorCampo(validacao.error) };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.resetPasswordForEmail(validacao.data.email, {
    redirectTo: `${urlDoSite()}/auth/confirmar?proximo=/redefinir-senha`,
  });
  // Limite de envio é o único erro mostrado; os demais não revelam se o e-mail existe.
  if (error?.code?.startsWith("over_")) return falha(error);

  return {
    ok: true,
    mensagem:
      "Se este e-mail tiver uma conta, você vai receber um link para criar uma nova senha. Confira também a caixa de spam.",
  };
}

export async function definirNovaSenha(dados: unknown): Promise<ResultadoAcao> {
  const validacao = esquemaNovaSenha.safeParse(dados);
  if (!validacao.success) {
    return { ok: false, mensagem: MSG_DADOS_INVALIDOS, erros: errosPorCampo(validacao.error) };
  }

  const armazenamento = await cookies();
  const supabase = await criarClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user || armazenamento.get(COOKIE_RECUPERACAO)?.value !== "1") {
    return { ok: false, mensagem: "O link de recuperação expirou. Peça um novo em “Esqueci minha senha”." };
  }

  const { error } = await supabase.auth.updateUser({ password: validacao.data.senha });
  if (error) return falha(error);
  armazenamento.delete(COOKIE_RECUPERACAO);

  redirect("/painel?aviso=senha-alterada");
}

export async function sair(): Promise<void> {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
