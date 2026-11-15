import { NextResponse } from "next/server";
import { criarClienteAdmin } from "@/lib/supabase/admin";

// Rota chamada pelo cron do Vercel a cada 3 dias para evitar que o Supabase
// (plano gratuito) pause o banco por inatividade (pausa após 7 dias sem uso).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const supabase = criarClienteAdmin();
  const { error } = await supabase.from("configuracoes").select("id").limit(1).single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}
