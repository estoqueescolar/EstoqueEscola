import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { obterConfiguracoes } from "@/lib/dados/configuracoes";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { FormularioConfiguracoes } from "./formulario";

export const metadata: Metadata = { title: "Configurações · Despensa CAPE" };

export default async function PaginaConfiguracoes() {
  const usuario = await obterUsuarioAtual();
  if (!pode(usuario?.perfil, "alterarConfiguracoes")) redirect("/painel");
  const config = await obterConfiguracoes();

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina titulo="Configurações" descricao="Ajustes que valem para todas as pessoas que usam o sistema." />
      <section aria-labelledby="titulo-alerta" className="rounded-xl border bg-card p-4 sm:p-6">
        <h2 id="titulo-alerta" className="mb-4 text-lg font-semibold">
          Alerta de validade
        </h2>
        <FormularioConfiguracoes diasAlerta={config.diasAlertaValidade} />
      </section>
    </div>
  );
}
