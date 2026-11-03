"use client";

import Form from "next/form";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { Botao } from "@/components/comum/Botao";
import { CampoSelecao } from "@/components/comum/CampoSelecao";
import { CampoTexto } from "@/components/comum/CampoTexto";

interface Opcao {
  valor: string;
  texto: string;
}

interface Props {
  categorias: Opcao[];
  locais: Opcao[];
  valores: { busca: string; categoria: string; local: string; situacao: string };
}

const SITUACOES = [
  { valor: "baixo", texto: "Estoque baixo ou sem estoque" },
  { valor: "ok", texto: "Em dia" },
  { valor: "inativos", texto: "Produtos inativos" },
];

// Formulário GET: os filtros ficam na URL (dá para voltar, recarregar e compartilhar).
export function FiltrosProdutos({ categorias, locais, valores }: Props) {
  const filtrando = Object.values(valores).some(Boolean);
  return (
    <Form action="/produtos" role="search" aria-label="Filtrar produtos" className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2 lg:grid-cols-4">
      <CampoTexto rotulo="Buscar pelo nome" name="busca" type="search" defaultValue={valores.busca} autoComplete="off" />
      <CampoSelecao rotulo="Categoria" name="categoria" opcoes={categorias} textoVazio="Todas" defaultValue={valores.categoria} />
      <CampoSelecao rotulo="Local" name="local" opcoes={locais} textoVazio="Todos" defaultValue={valores.local} />
      <CampoSelecao rotulo="Situação do estoque" name="situacao" opcoes={SITUACOES} textoVazio="Todas" defaultValue={valores.situacao} />
      <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-4">
        <Botao type="submit">
          <SearchIcon className="size-5" aria-hidden="true" />
          Filtrar
        </Botao>
        {filtrando && (
          <Link href="/produtos" className="flex min-h-11 items-center px-2 font-medium text-primary underline underline-offset-4">
            Limpar filtros
          </Link>
        )}
      </div>
    </Form>
  );
}
