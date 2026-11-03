import type { Metadata } from "next";
import Link from "next/link";
import { InfoIcon } from "lucide-react";
import { FormularioCadastro } from "./formulario";

export const metadata: Metadata = { title: "Criar conta · Despensa CAPE" };

export default function PaginaCadastro() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="mt-1 text-muted-foreground">Leva menos de um minuto.</p>
      </div>
      <p className="flex gap-2 rounded-lg bg-frio-fundo p-3 text-sm">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-frio" aria-hidden="true" />
        Depois de criar a conta, a direção libera o seu acesso.
      </p>
      <FormularioCadastro />
      <p className="flex flex-wrap items-center justify-center gap-x-1 text-sm text-muted-foreground">
        Já tem conta?
        <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
