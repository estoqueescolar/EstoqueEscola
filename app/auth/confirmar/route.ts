import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { COOKIE_RECUPERACAO, VALIDADE_RECUPERACAO_SEGUNDOS } from "@/lib/recuperacao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const tipoOtp = z.enum(["signup", "recovery", "email", "invite", "email_change", "magiclink"]);

// Destino dos links enviados por e-mail (confirmação de conta e recuperação de senha).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const proximo = searchParams.get("proximo");
  const destino = proximo && /^\/(?!\/)[\w\-/]*$/.test(proximo) ? proximo : "/painel";

  const supabase = await criarClienteServidor();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const tipo = tipoOtp.safeParse(searchParams.get("type")).data;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && tipo
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })
      : { error: new Error("link sem código") };

  if (error) return NextResponse.redirect(`${origin}/login?aviso=link-invalido`);

  const resposta = NextResponse.redirect(`${origin}${destino}`);
  if (destino === "/redefinir-senha") {
    resposta.cookies.set(COOKIE_RECUPERACAO, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: VALIDADE_RECUPERACAO_SEGUNDOS,
    });
  }
  return resposta;
}
