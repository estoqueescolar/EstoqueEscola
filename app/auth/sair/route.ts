import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Encerra a sessão de quem perdeu o acesso (perfil desativado) e mostra o aviso no login.
export async function GET(request: NextRequest) {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  const aviso = request.nextUrl.searchParams.get("aviso") === "acesso-desativado" ? "?aviso=acesso-desativado" : "";
  return NextResponse.redirect(`${request.nextUrl.origin}/login${aviso}`);
}
