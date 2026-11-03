import { z } from "zod";

// Esquemas compartilhados entre os formulários (cliente) e as server actions (servidor).

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Informe o e-mail.")
  .max(254, "E-mail muito longo.")
  .pipe(z.email("E-mail inválido. Confira se digitou certo, por exemplo: maria@colegio.com.br."));

const senhaNova = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72, "A senha pode ter no máximo 72 caracteres.")
  .regex(/[A-Za-z]/, "Inclua pelo menos uma letra na senha.")
  .regex(/\d/, "Inclua pelo menos um número na senha.");

const nome = z.string().trim().min(2, "Informe o nome (pelo menos 2 letras).").max(120, "Nome muito longo.");

export const esquemaLogin = z.object({
  email,
  senha: z.string().min(1, "Informe a senha.").max(72),
});

export const esquemaCadastro = z
  .object({ nome, email, senha: senhaNova, confirmacao: z.string() })
  .refine((d) => d.senha === d.confirmacao, { path: ["confirmacao"], message: "As senhas não são iguais." });

export const esquemaRecuperarSenha = z.object({ email });

export const esquemaNovaSenha = z
  .object({ senha: senhaNova, confirmacao: z.string() })
  .refine((d) => d.senha === d.confirmacao, { path: ["confirmacao"], message: "As senhas não são iguais." });

export const esquemaPerfil = z.enum(["administrador", "operador", "consulta"], "Escolha um perfil.");

export const esquemaCriarUsuario = z.object({ nome, email, senha: senhaNova, perfil: esquemaPerfil });

export const esquemaAlterarUsuario = z.object({
  id: z.uuid("Usuário inválido."),
  perfil: esquemaPerfil,
});

export const esquemaAtivarUsuario = z.object({ id: z.uuid("Usuário inválido."), ativo: z.boolean() });

export type DadosLogin = z.infer<typeof esquemaLogin>;
export type DadosCadastro = z.infer<typeof esquemaCadastro>;
export type DadosRecuperarSenha = z.infer<typeof esquemaRecuperarSenha>;
export type DadosNovaSenha = z.infer<typeof esquemaNovaSenha>;
export type DadosCriarUsuario = z.infer<typeof esquemaCriarUsuario>;

// Converte erros do Zod em { campo: mensagem } para exibir ao lado de cada campo.
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const problema of erro.issues) {
    const campo = String(problema.path[0] ?? "formulario");
    saida[campo] ??= problema.message;
  }
  return saida;
}
