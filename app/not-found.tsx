import Link from "next/link";

export default function NaoEncontrada() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Página não encontrada</h1>
      <p className="text-lg text-muted-foreground">Esta página não existe ou você não tem acesso a ela.</p>
      <Link href="/painel" className="flex min-h-11 items-center font-medium text-primary underline underline-offset-4">
        Voltar para o painel
      </Link>
    </main>
  );
}
