import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { lerEnvPublico } from "./env";
import type { Database } from "./tipos-banco";

// Cliente para Server Components, server actions e rotas. Age como o usuário logado (respeita RLS).
export async function criarClienteServidor() {
  const { url, chaveAnonima } = lerEnvPublico();
  const armazenamento = await cookies();

  return createServerClient<Database>(url, chaveAnonima, {
    cookies: {
      getAll() {
        return armazenamento.getAll();
      },
      setAll(cookiesParaGravar) {
        try {
          cookiesParaGravar.forEach(({ name, value, options }) => armazenamento.set(name, value, options));
        } catch {
          // Chamado a partir de Server Component: o proxy.ts renova a sessão, então pode ser ignorado.
        }
      },
    },
  });
}
