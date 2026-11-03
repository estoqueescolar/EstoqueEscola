import "server-only";
import { createClient } from "@supabase/supabase-js";
import { lerEnvPublico } from "./env";
import type { Database } from "./tipos-banco";

// Cliente com a chave de serviço: IGNORA o RLS. Use somente no servidor, depois de
// confirmar que o usuário logado é administrador (ver lib/permissoes.ts).
export function criarClienteAdmin() {
  const { url } = lerEnvPublico();
  const chaveServico = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chaveServico) {
    throw new Error("Configuração ausente: defina SUPABASE_SERVICE_ROLE_KEY no servidor (veja .env.example).");
  }
  return createClient<Database>(url, chaveServico, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
