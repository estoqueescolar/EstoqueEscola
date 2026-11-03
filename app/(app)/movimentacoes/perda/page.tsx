import type { Metadata } from "next";
import { PaginaBaixa } from "../pagina-baixa";

export const metadata: Metadata = { title: "Registrar perda · Despensa CAPE" };

export default async function PaginaPerda({ searchParams }: PageProps<"/movimentacoes/perda">) {
  const { lote } = await searchParams;
  return <PaginaBaixa tipo="perda" lote={typeof lote === "string" ? lote : undefined} />;
}
