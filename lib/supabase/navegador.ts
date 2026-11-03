import { createBrowserClient } from "@supabase/ssr";
import { lerEnvPublico } from "./env";
import type { Database } from "./tipos-banco";

// Cliente para Client Components. Usa apenas a chave anônima.
export function criarClienteNavegador() {
  const { url, chaveAnonima } = lerEnvPublico();
  return createBrowserClient<Database>(url, chaveAnonima);
}
