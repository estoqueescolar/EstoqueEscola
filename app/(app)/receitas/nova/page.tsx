import type { Metadata } from "next";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { exigirPermissao, ErroPermissao } from "@/lib/permissoes";
import { notFound } from "next/navigation";
import { FormularioReceita } from "../formulario";

export const metadata: Metadata = { title: "Nova receita · Despensa CAPE" };

export default async function PaginaNovaReceita() {
  await exigirPermissao("movimentar").catch((e) => {
    if (e instanceof ErroPermissao) notFound();
    throw e;
  });

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Nova receita"
        voltar={{ href: "/receitas", texto: "Voltar para receitas" }}
      />
      <FormularioReceita />
    </div>
  );
}
