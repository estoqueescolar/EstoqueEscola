import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeftIcon } from "lucide-react";

interface Props {
  titulo: string;
  descricao?: ReactNode;
  voltar?: { href: string; texto: string };
  acoes?: ReactNode;
}

// Título da tela com link de volta e ações à direita (empilha no celular).
export function CabecalhoPagina({ titulo, descricao, voltar, acoes }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {voltar && (
        <Link href={voltar.href} className="flex min-h-11 w-fit items-center gap-1 font-medium text-primary underline underline-offset-4">
          <ChevronLeftIcon className="size-5" aria-hidden="true" /> {voltar.texto}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl break-words">{titulo}</h1>
          {descricao && <p className="mt-1 text-muted-foreground">{descricao}</p>}
        </div>
        {acoes && <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{acoes}</div>}
      </div>
    </div>
  );
}

// Link com aparência de botão (mesmo alvo de 44/48px do Botao).
export function LinkBotao({ href, children, principal = false, perigo = false }: { href: string; children: ReactNode; principal?: boolean; perigo?: boolean }) {
  return (
    <Link
      href={href}
      className={
        "flex items-center justify-center gap-2 rounded-lg text-base font-medium " +
        (principal
          ? "min-h-11 bg-primary px-5 text-primary-foreground hover:bg-[var(--manjericao-escuro)]"
          : perigo
            ? "min-h-11 border border-destructive bg-perigo-fundo px-4 text-destructive hover:bg-card"
            : "min-h-11 border border-input bg-card px-4 hover:bg-accent")
      }
    >
      {children}
    </Link>
  );
}
