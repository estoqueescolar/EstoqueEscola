"use client";

import Form from "next/form";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { Botao } from "@/components/comum/Botao";
import { CampoSelecao } from "@/components/comum/CampoSelecao";
import { CampoTexto } from "@/components/comum/CampoTexto";

const TIPOS = [
  { valor: "entrada", texto: "Entradas" },
  { valor: "saida", texto: "Saídas" },
  { valor: "perda", texto: "Perdas" },
  { valor: "ajuste", texto: "Ajustes" },
];

interface Props {
  produtos: { valor: string; texto: string }[];
  valores: { tipo: string; produto: string; inicio: string; fim: string };
}

export function FiltrosMovimentacoes({ produtos, valores }: Props) {
  return (
    <Form action="/movimentacoes" role="search" aria-label="Filtrar movimentações" className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2 lg:grid-cols-4">
      <CampoSelecao rotulo="Tipo" name="tipo" opcoes={TIPOS} textoVazio="Todos" defaultValue={valores.tipo} />
      <CampoSelecao rotulo="Produto" name="produto" opcoes={produtos} textoVazio="Todos" defaultValue={valores.produto} />
      <CampoTexto rotulo="De" name="inicio" type="date" defaultValue={valores.inicio} />
      <CampoTexto rotulo="Até" name="fim" type="date" defaultValue={valores.fim} />
      <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-4">
        <Botao type="submit">
          <SearchIcon className="size-5" aria-hidden="true" />
          Filtrar
        </Botao>
        {Object.values(valores).some(Boolean) && (
          <Link href="/movimentacoes" className="flex min-h-11 items-center px-2 font-medium text-primary underline underline-offset-4">
            Limpar filtros
          </Link>
        )}
      </div>
    </Form>
  );
}
