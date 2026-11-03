import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { CONFIG_CADASTROS } from "@/lib/cadastros-config";
import { TIPOS_CADASTRO } from "@/lib/validacoes/cadastros";

export const metadata: Metadata = { title: "Cadastros · Despensa CAPE" };

export default function PaginaCadastros() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Cadastros</h1>
        <p className="mt-1 text-muted-foreground">Listas usadas no cadastro de produtos e nas entradas de mercadoria.</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {TIPOS_CADASTRO.map((tipo) => (
          <li key={tipo}>
            <Link
              href={`/cadastros/${tipo}`}
              className="flex min-h-20 items-center justify-between gap-4 rounded-xl border bg-card p-4 hover:border-primary"
            >
              <span>
                <span className="block text-lg font-semibold">{CONFIG_CADASTROS[tipo].titulo}</span>
                <span className="text-muted-foreground">{CONFIG_CADASTROS[tipo].descricao}</span>
              </span>
              <ChevronRightIcon className="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
