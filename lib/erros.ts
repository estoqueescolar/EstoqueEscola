import { ErroPermissao } from "@/lib/permissoes";

export type ResultadoAcao<T = undefined> =
  | { ok: true; dados?: T; mensagem?: string }
  | { ok: false; mensagem: string; erros?: Record<string, string> };

const MENSAGEM_GENERICA = "Não foi possível concluir. Tente de novo; se continuar, avise a diretora.";

// Mensagens do Supabase Auth traduzidas (códigos de https://supabase.com/docs/guides/auth/debugging/error-codes).
const ERROS_AUTH: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos. Confira e tente de novo.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar. Procure a mensagem na sua caixa de entrada.",
  user_banned: "Seu acesso foi desativado. Fale com a diretora.",
  user_already_exists: "Já existe uma conta com este e-mail. Use “Esqueci minha senha” se não lembrar a senha.",
  email_exists: "Já existe uma conta com este e-mail.",
  weak_password: "Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.",
  same_password: "A nova senha precisa ser diferente da atual.",
  over_email_send_rate_limit: "Muitos e-mails enviados em pouco tempo. Aguarde alguns minutos e tente de novo.",
  over_request_rate_limit: "Muitas tentativas seguidas. Aguarde um minuto e tente de novo.",
  session_expired: "Sua sessão terminou. Entre novamente.",
};

interface ErroComCodigo {
  code?: string;
  message?: string;
}

// Converte qualquer erro em mensagem segura para o usuário.
// Erros de negócio do banco (P0001) já vêm em português e são repassados; o resto vira mensagem genérica.
export function traduzirErro(erro: unknown): string {
  if (erro instanceof ErroPermissao) return erro.message;
  const { code, message } = (erro ?? {}) as ErroComCodigo;
  if (code === "P0001" && message) return message;
  if (code && ERROS_AUTH[code]) return ERROS_AUTH[code];
  if (code === "23505") return "Já existe um registro com esse nome. Use outro nome.";
  if (code === "23503") return "Este registro está em uso por outros dados e não pode ser removido.";
  if (code === "42501") return "Seu perfil não permite fazer isso. Peça acesso à diretora.";
  return MENSAGEM_GENERICA;
}

export function falha(erro: unknown): { ok: false; mensagem: string } {
  return { ok: false, mensagem: traduzirErro(erro) };
}
