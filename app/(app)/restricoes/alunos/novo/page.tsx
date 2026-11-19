import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioAluno } from "../formulario-aluno";

export const metadata: Metadata = { title: "Cadastrar aluno · Despensa CAPE" };

export default async function PaginaNovoAluno() {
  const usuario = await obterUsuarioAtual();
  if (!pode(usuario?.perfil, "cadastrar")) redirect("/restricoes/alunos");

  const supabase = await criarClienteServidor();
  const { data: tipos, error } = await supabase.from("tipos_restricao").select("id, nome").order("nome");
  if (error) throw new Error("Não foi possível carregar a lista de restrições.");

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina titulo="Cadastrar aluno" voltar={{ href: "/restricoes/alunos", texto: "Alunos com restrição" }} />
      <FormularioAluno tipos={tipos ?? []} podeExcluir={false} />
    </div>
  );
}
