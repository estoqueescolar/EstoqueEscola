import Link from "next/link";

// Versão dentro do layout do sistema (sem <main> próprio: o layout já tem um).
export default function NaoEncontradaNoSistema() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Página não encontrada</h1>
      <p className="text-lg text-muted-foreground">Esta página não existe ou você não tem acesso a ela.</p>
      <Link href="/painel" className="flex min-h-11 items-center font-medium text-primary underline underline-offset-4">
        Voltar para o painel
      </Link>
    </div>
  );
}
