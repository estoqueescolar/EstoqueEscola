// Variáveis públicas do Supabase (podem ir ao navegador: a segurança vem do RLS).
export function lerEnvPublico(): { url: string; chaveAnonima: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chaveAnonima = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chaveAnonima) {
    throw new Error(
      "Configuração ausente: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (veja .env.example).",
    );
  }
  return { url, chaveAnonima };
}
