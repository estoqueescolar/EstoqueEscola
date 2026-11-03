import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import { CONFIG_CADASTROS } from "@/lib/cadastros-config";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { TABELAS_CADASTRO, TIPOS_CADASTRO, type TipoCadastro } from "@/lib/validacoes/cadastros";
import { GerenciadorCadastro, type RegistroCadastro } from "./gerenciador";

function tipoValido(tipo: string): tipo is TipoCadastro {
  return (TIPOS_CADASTRO as readonly string[]).includes(tipo);
}

export async function generateMetadata({ params }: PageProps<"/cadastros/[tipo]">): Promise<Metadata> {
  const { tipo } = await params;
  return { title: `${tipoValido(tipo) ? CONFIG_CADASTROS[tipo].titulo : "Cadastros"} · Despensa CAPE` };
}

export default async function PaginaCadastro({ params }: PageProps<"/cadastros/[tipo]">) {
  const { tipo } = await params;
  if (!tipoValido(tipo)) notFound();
  const config = CONFIG_CADASTROS[tipo];

  const usuario = await obterUsuarioAtual();
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from(TABELAS_CADASTRO[tipo] as "categorias")
    .select("*")
    .order(config.ordenarPor as "nome");
  if (error) throw new Error("Não foi possível carregar o cadastro.");

  return (
    <div className="flex flex-col gap-6">
      <Link href="/cadastros" className="flex min-h-11 w-fit items-center gap-1 font-medium text-primary underline underline-offset-4">
        <ChevronLeftIcon className="size-5" aria-hidden="true" /> Todos os cadastros
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{config.titulo}</h1>
        <p className="mt-1 text-muted-foreground">{config.descricao}</p>
      </div>
      <GerenciadorCadastro
        tipo={tipo}
        registros={(data ?? []) as unknown as RegistroCadastro[]}
        podeEditar={pode(usuario?.perfil, "cadastrar")}
        podeExcluir={pode(usuario?.perfil, "excluirCadastro")}
      />
    </div>
  );
}
