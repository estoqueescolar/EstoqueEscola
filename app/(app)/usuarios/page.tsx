import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirPermissao, ErroPermissao, type Perfil } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioNovoUsuario } from "./formulario-novo";
import { ListaUsuarios, type LinhaUsuario } from "./lista";

export const metadata: Metadata = { title: "Usuários · Despensa CAPE" };

export default async function PaginaUsuarios() {
  const eu = await exigirPermissao("gerenciarUsuarios").catch((erro) => {
    if (erro instanceof ErroPermissao) notFound();
    throw erro;
  });

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("perfis")
    .select("id, nome, email, perfil, ativo")
    .order("ativo", { ascending: false })
    .order("nome");
  if (error) throw new Error("Não foi possível carregar os usuários.");

  const usuarios: LinhaUsuario[] = (data ?? []).map((u) => ({ ...u, perfil: u.perfil as Perfil, souEu: u.id === eu.id }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Usuários</h1>
        <p className="mt-1 text-muted-foreground">Crie contas, mude o perfil de acesso ou desative quem não trabalha mais na cozinha.</p>
      </div>
      <section aria-labelledby="titulo-novo" className="rounded-xl border bg-card p-4 sm:p-6">
        <h2 id="titulo-novo" className="mb-4 text-xl font-semibold">Criar conta</h2>
        <FormularioNovoUsuario />
      </section>
      <section aria-labelledby="titulo-lista" className="flex flex-col gap-4">
        <h2 id="titulo-lista" className="text-xl font-semibold">
          Contas cadastradas <span className="font-normal text-muted-foreground">({usuarios.length})</span>
        </h2>
        <ListaUsuarios usuarios={usuarios} />
      </section>
    </div>
  );
}
