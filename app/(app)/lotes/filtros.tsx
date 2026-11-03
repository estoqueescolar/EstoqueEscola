"use client";

import Form from "next/form";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { Botao } from "@/components/comum/Botao";
import { CampoSelecao } from "@/components/comum/CampoSelecao";
import { CampoTexto } from "@/components/comum/CampoTexto";

interface Props {
  locais: { valor: string; texto: string }[];
  valores: { busca: string; local: string; situacao: string };
  diasAlerta: number;
}

export function FiltrosLotes({ locais, valores, diasAlerta }: Props) {
  const situacoes = [
    { valor: "vencidos", texto: "Vencidos" },
    { valor: "proximos", texto: `Vencem em até ${diasAlerta} dias` },
    { valor: "encerrados", texto: "Lotes encerrados (zerados)" },
  ];
  return (
    <Form action="/lotes" role="search" aria-label="Filtrar lotes" className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-3">
      <CampoTexto rotulo="Buscar produto ou lote" name="busca" type="search" defaultValue={valores.busca} autoComplete="off" />
      <CampoSelecao rotulo="Local" name="local" opcoes={locais} textoVazio="Todos" defaultValue={valores.local} />
      <CampoSelecao rotulo="Validade" name="situacao" opcoes={situacoes} textoVazio="Todos com estoque" defaultValue={valores.situacao} />
      <div className="flex flex-wrap gap-2 md:col-span-3">
        <Botao type="submit">
          <SearchIcon className="size-5" aria-hidden="true" />
          Filtrar
        </Botao>
        {Object.values(valores).some(Boolean) && (
          <Link href="/lotes" className="flex min-h-11 items-center px-2 font-medium text-primary underline underline-offset-4">
            Limpar filtros
          </Link>
        )}
      </div>
    </Form>
  );
}
