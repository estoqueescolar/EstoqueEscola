import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { obterAluno } from "@/lib/dados/alunos";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioAluno } from "../../formulario-aluno";

export const metadata: Metadata = { title: "Editar aluno · Despensa CAPE" };

export default async function PaginaEditarAluno({ params }: PageProps<"/restricoes/alunos/[id]/editar">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const usuario = await obterUsuarioAtual();
  if (!pode(usuario?.perfil, "cadastrar")) redirect("/restricoes/alunos");

  const supabase = await criarClienteServidor();
  const [aluno, tipos] = await Promise.all([
    obterAluno(id),
    supabase.from("tipos_restricao").select("id, nome").order("nome"),
  ]);
  if (!aluno) notFound();
  if (tipos.error) throw new Error("Não foi possível carregar a lista de restrições.");

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina titulo={`Editar ${aluno.nome}`} voltar={{ href: "/restricoes/alunos", texto: "Alunos com restrição" }} />
      <FormularioAluno
        tipos={tipos.data ?? []}
        podeExcluir={pode(usuario?.perfil, "excluirCadastro")}
        aluno={{
          id: aluno.id,
          nome: aluno.nome,
          turma: aluno.turma,
          observacao: aluno.observacao,
          autorizacao_responsaveis: aluno.autorizacao_responsaveis,
          fotoUrl: aluno.fotoUrl,
          restricoes: aluno.restricoes.map((r) => ({ tipo_restricao_id: r.tipo_restricao_id, nivel: r.nivel })),
        }}
      />
    </div>
  );
}
