import type { Metadata } from "next";
import { PaginaBaixa } from "../pagina-baixa";

export const metadata: Metadata = { title: "Registrar ajuste · Despensa CAPE" };

export default async function PaginaAjuste({ searchParams }: PageProps<"/movimentacoes/ajuste">) {
  const { lote } = await searchParams;
  return <PaginaBaixa tipo="ajuste" lote={typeof lote === "string" ? lote : undefined} />;
}
