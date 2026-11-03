import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Rotas abertas sem login. Todo o resto exige sessão.
const ROTAS_PUBLICAS = ["/login", "/cadastro", "/recuperar-senha", "/auth/"];
// Rotas de quem ainda não entrou: se já houver sessão, vai para o painel.
const ROTAS_SO_VISITANTE = ["/login", "/cadastro", "/recuperar-senha"];

const comeca = (caminho: string, rotas: string[]) =>
  rotas.some((rota) => caminho === rota || caminho.startsWith(rota.endsWith("/") ? rota : `${rota}/`));

export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaGravar) {
          cookiesParaGravar.forEach(({ name, value }) => request.cookies.set(name, value));
          resposta = NextResponse.next({ request });
          cookiesParaGravar.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
        },
      },
    },
  );

  // Não coloque código entre a criação do cliente e getUser(): é aqui que a sessão é renovada.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const caminho = request.nextUrl.pathname;

  if (!user && !comeca(caminho, ROTAS_PUBLICAS)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    if (caminho !== "/") url.searchParams.set("voltar", caminho);
    return NextResponse.redirect(url);
  }

  if (user && comeca(caminho, ROTAS_SO_VISITANTE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return resposta;
}

export const config = {
  // ignora arquivos estáticos e imagens
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
