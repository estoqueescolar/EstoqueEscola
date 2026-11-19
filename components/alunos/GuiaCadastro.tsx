import Link from "next/link";

const PASSOS = [
  {
    titulo: "Cadastre a alergia",
    texto: "Só se ela ainda não existir. Você também pode criar no cadastro do aluno.",
    acao: { href: "/cadastros/restricoes", texto: "Ver alergias cadastradas" },
  },
  {
    titulo: "Cadastre o aluno",
    texto: "Nome, turma e uma foto do rosto para a cozinha reconhecer.",
    acao: { href: "/restricoes/alunos/novo", texto: "Cadastrar aluno" },
  },
  {
    titulo: "Marque as alergias e o nível",
    texto: "Leve, média ou grave. A grave aparece em destaque para toda a cozinha.",
  },
] as const;

// Mostra a ordem do processo: primeiro a alergia existir, depois associá-la ao aluno.
export function GuiaCadastro() {
  return (
    <section aria-labelledby="titulo-guia" className="rounded-2xl border bg-card p-4 sm:p-5">
      <h2 id="titulo-guia" className="text-base font-semibold">Como cadastrar</h2>
      <ol className="mt-3 grid gap-4 md:grid-cols-3">
        {PASSOS.map((p, i) => (
          <li key={p.titulo} className="flex gap-3">
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-medium">
                <span className="sr-only">Passo {i + 1}: </span>
                {p.titulo}
              </p>
              <p className="text-sm text-muted-foreground">{p.texto}</p>
              {"acao" in p && (
                <Link href={p.acao.href} className="inline-flex min-h-11 w-fit items-center text-sm font-medium text-primary underline underline-offset-4">
                  {p.acao.texto}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
