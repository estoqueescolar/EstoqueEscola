import Link from "next/link";
import { ClipboardListIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ABAS = [
  { href: "/restricoes/alunos", texto: "Alunos e alergias", Icone: UsersIcon },
  { href: "/restricoes", texto: "Contagem do dia", Icone: ClipboardListIcon },
] as const;

// As duas partes de "Restrições" ficam sempre à vista, para ninguém procurar onde cadastrar alunos.
export function AbasRestricoes({ atual }: { atual: (typeof ABAS)[number]["href"] }) {
  return (
    <nav aria-label="Seções de restrições" className="flex gap-1 rounded-xl border bg-muted p-1">
      {ABAS.map(({ href, texto, Icone }) => {
        const ativa = href === atual;
        return (
          <Link
            key={href}
            href={href}
            aria-current={ativa ? "page" : undefined}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-base font-medium",
              ativa ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icone className="size-5 shrink-0" aria-hidden="true" />
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}
