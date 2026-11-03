import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import { carregarOpcoesProduto } from "@/lib/dados/produtos";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { FormularioProduto } from "../formulario";

export const metadata: Metadata = { title: "Cadastrar produto · Despensa CAPE" };

export default async function PaginaNovoProduto() {
  const usuario = await obterUsuarioAtual();
  if (!pode(usuario?.perfil, "cadastrar")) notFound();
  const opcoes = await carregarOpcoesProduto();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href="/produtos" className="flex min-h-11 w-fit items-center gap-1 font-medium text-primary underline underline-offset-4">
        <ChevronLeftIcon className="size-5" aria-hidden="true" /> Produtos
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Cadastrar produto</h1>
      <section className="rounded-xl border bg-card p-4 sm:p-6">
        <FormularioProduto opcoes={opcoes} />
      </section>
    </div>
  );
}
