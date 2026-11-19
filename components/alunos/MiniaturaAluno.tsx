import Link from "next/link";
import type { NivelRestricao } from "@/lib/regras/alunos";
import type { AlunoListado } from "@/lib/dados/alunos";
import { cn } from "@/lib/utils";
import { EtiquetaRestricao } from "./EtiquetaRestricao";
import { FotoAluno } from "./FotoAluno";

interface Props {
  aluno: AlunoListado;
  nivel: NivelRestricao;
  podeEditar: boolean;
}

// Visão "por alergia": foto, nome e o nível desta restrição. Compacto para caber vários por linha.
export function MiniaturaAluno({ aluno, nivel, podeEditar }: Props) {
  const conteudo = (
    <>
      <FotoAluno url={aluno.fotoUrl} nome={aluno.nome} tamanho="media" />
      <span className="line-clamp-2 break-words text-base font-medium leading-snug">{aluno.nome}</span>
      {aluno.turma && <span className="-mt-1 text-sm text-muted-foreground">{aluno.turma}</span>}
      <EtiquetaRestricao nome="" nivel={nivel} compacta />
    </>
  );
  const classe = cn(
    "flex h-full flex-col items-center gap-2 rounded-2xl border bg-card p-3 text-center",
    nivel === "grave" && "border-destructive",
  );
  return (
    <li>
      {podeEditar ? (
        <Link href={`/restricoes/alunos/${aluno.id}/editar`} aria-label={`${aluno.nome}, nível ${nivel === "media" ? "média" : nivel}. Editar`} className={cn(classe, "hover:bg-accent")}>
          {conteudo}
        </Link>
      ) : (
        <div className={classe}>{conteudo}</div>
      )}
    </li>
  );
}
