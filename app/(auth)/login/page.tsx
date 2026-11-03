import type { Metadata } from "next";
import Link from "next/link";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { FormularioLogin } from "./formulario";

export const metadata: Metadata = { title: "Entrar · Despensa CAPE" };

const AVISOS: Record<string, string> = {
  "link-invalido": "Este link expirou ou já foi usado. Peça um novo em “Esqueci minha senha”.",
  "acesso-desativado": "Seu acesso está desativado. Fale com a direção para liberar.",
};

export default async function PaginaLogin({ searchParams }: PageProps<"/login">) {
  const { voltar, aviso } = await searchParams;
  const textoAviso = typeof aviso === "string" && Object.hasOwn(AVISOS, aviso) ? AVISOS[aviso] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Boas-vindas</h1>
        <p className="mt-1 text-muted-foreground">Entre com o e-mail e a senha da sua conta.</p>
      </div>
      {textoAviso && <AvisoFormulario tipo="erro">{textoAviso}</AvisoFormulario>}
      <FormularioLogin voltar={typeof voltar === "string" ? voltar : undefined} />
      <p className="flex flex-wrap items-center justify-center gap-x-1 text-sm text-muted-foreground">
        Ainda não tem acesso?
        <Link href="/cadastro" className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline">
          Criar uma conta nova
        </Link>
      </p>
    </div>
  );
}
