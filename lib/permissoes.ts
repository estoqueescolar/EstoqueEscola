import "server-only";
import { cache } from "react";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Perfis conhecidos. Para um perfil novo: incluir aqui, no check da tabela perfis e nas políticas.
export const PERFIS = ["administrador", "operador", "consulta"] as const;
export type Perfil = (typeof PERFIS)[number];

export const NOMES_PERFIL: Record<Perfil, string> = {
  administrador: "Administrador(a)",
  operador: "Operador(a) da cozinha",
  consulta: "Consulta",
};

// O que cada perfil pode fazer na interface e nas server actions (o banco reforça via RLS).
export const PERMISSOES = {
  movimentar: ["administrador", "operador"],
  cadastrar: ["administrador", "operador"],
  excluirCadastro: ["administrador"],
  gerenciarUsuarios: ["administrador"],
  alterarConfiguracoes: ["administrador"],
} as const satisfies Record<string, readonly Perfil[]>;

export type Permissao = keyof typeof PERMISSOES;

export interface UsuarioAtual {
  id: string;
  email: string;
  nome: string;
  perfil: Perfil;
}

export function pode(perfil: Perfil | undefined, permissao: Permissao): boolean {
  return !!perfil && (PERMISSOES[permissao] as readonly Perfil[]).includes(perfil);
}

// Usuário logado e ativo, ou null. Cacheado por requisição.
export const obterUsuarioAtual = cache(async (): Promise<UsuarioAtual | null> => {
  const supabase = await criarClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome, email, perfil, ativo")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (!perfil?.ativo) return null;

  return { id: auth.user.id, email: perfil.email, nome: perfil.nome, perfil: perfil.perfil as Perfil };
});

export class ErroPermissao extends Error {}

// Use no início de toda server action e rota que altera dados.
export async function exigirPermissao(permissao: Permissao): Promise<UsuarioAtual> {
  const usuario = await obterUsuarioAtual();
  if (!usuario) throw new ErroPermissao("Sua sessão terminou. Entre novamente para continuar.");
  if (!pode(usuario.perfil, permissao)) {
    throw new ErroPermissao("Seu perfil não permite fazer isso. Peça acesso à diretora.");
  }
  return usuario;
}
