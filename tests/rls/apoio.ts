import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Usuários de demonstração criados por supabase/seed-usuarios-dev.sql
export const USUARIOS = {
  administrador: "diretora@colegio.local",
  operador: "cozinha@colegio.local",
  consulta: "consulta@colegio.local",
} as const;

const SENHA_DEMO = "Senha@Local123";

function env(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Defina ${nome} em .env.local (veja .env.example).`);
  return valor;
}

export function clienteAnonimo(): SupabaseClient {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function clienteComo(perfil: keyof typeof USUARIOS): Promise<SupabaseClient> {
  const cliente = clienteAnonimo();
  const { error } = await cliente.auth.signInWithPassword({ email: USUARIOS[perfil], password: SENHA_DEMO });
  if (error) throw new Error(`Falha no login de ${perfil}: ${error.message}. Rode "npx supabase db reset".`);
  return cliente;
}
