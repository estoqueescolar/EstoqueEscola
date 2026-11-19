/* eslint-disable @next/next/no-img-element -- URL assinada e temporária do bucket privado: o otimizador do Next não se aplica */
import { iniciaisDoNome } from "@/lib/regras/alunos";
import { cn } from "@/lib/utils";

const TAMANHOS = {
  grande: "size-28 text-3xl sm:size-32",
  media: "size-20 text-2xl",
} as const;

interface Props {
  url: string | null;
  nome: string;
  tamanho?: keyof typeof TAMANHOS;
  className?: string;
}

// Foto do aluno para a cozinha reconhecer o rosto. Sem foto, mostra as iniciais.
export function FotoAluno({ url, nome, tamanho = "grande", className }: Props) {
  const base = cn("shrink-0 rounded-xl", TAMANHOS[tamanho], className);
  if (url) {
    return <img src={url} alt={`Foto de ${nome}`} width={128} height={128} className={cn(base, "bg-muted object-cover")} />;
  }
  return (
    <div role="img" aria-label={`${nome}, sem foto`} className={cn(base, "flex items-center justify-center bg-muted font-semibold text-foreground")}>
      {iniciaisDoNome(nome)}
    </div>
  );
}
