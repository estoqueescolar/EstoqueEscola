import { redirect } from "next/navigation";
import { ArchiveIcon, LogOutIcon } from "lucide-react";
import { Botao } from "@/components/comum/Botao";
import { MenuPrincipal } from "@/components/comum/MenuPrincipal";
import { itensDoPerfil } from "@/components/comum/navegacao";
import { NOMES_PERFIL, obterUsuarioAtual } from "@/lib/permissoes";
import { sair } from "../(auth)/actions";

export default async function LayoutSistema({ children }: LayoutProps<"/">) {
  const usuario = await obterUsuarioAtual();
  // sessão válida mas perfil desativado/inexistente: encerra e volta ao login
  if (!usuario) redirect("/auth/sair?aviso=acesso-desativado");

  const itens = itensDoPerfil(usuario.perfil);

  return (
    <div className="flex flex-1 flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <MenuPrincipal
              itens={itens}
              modo="gaveta"
              usuario={{ nome: usuario.nome || usuario.email, perfil: NOMES_PERFIL[usuario.perfil] }}
            />
            <span className="hidden items-center gap-2 font-heading text-xl font-semibold sm:flex">
              <ArchiveIcon className="size-6 text-primary" aria-hidden="true" />
              Despensa CAPE
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <p className="hidden min-w-0 text-right text-sm leading-tight md:block">
              <span className="block truncate font-medium">{usuario.nome || usuario.email}</span>
              <span className="text-muted-foreground">{NOMES_PERFIL[usuario.perfil]}</span>
            </p>
            <form action={sair}>
              <Botao type="submit" variant="outline">
                <LogOutIcon className="size-5" aria-hidden="true" />
                Sair
              </Botao>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-6 lg:py-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <MenuPrincipal itens={itens} modo="lateral" />
        </aside>
        <main id="conteudo" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
