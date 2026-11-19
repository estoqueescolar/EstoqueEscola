import Link from "next/link";
import { MessageSquareTextIcon, PencilIcon } from "lucide-react";
import { ordenarRestricoes, temRestricaoGrave } from "@/lib/regras/alunos";
import type { AlunoListado } from "@/lib/dados/alunos";
import { EtiquetaRestricao } from "./EtiquetaRestricao";
import { FotoAluno } from "./FotoAluno";

interface Props {
  aluno: AlunoListado;
  podeEditar: boolean;
}

// Visão "por aluno": foto para reconhecer o rosto, nome e todas as restrições com o nível.
export function CartaoAluno({ aluno, podeEditar }: Props) {
  const grave = temRestricaoGrave(aluno);
  const idTitulo = `aluno-${aluno.id}`;
  return (
    <li aria-labelledby={idTitulo} className="relative flex gap-4 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm">
      {grave && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-destructive" />}
      <FotoAluno url={aluno.fotoUrl} nome={aluno.nome} tamanho="media" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="pr-10">
          <h3 id={idTitulo} className="break-words text-lg font-semibold leading-snug">{aluno.nome}</h3>
          {aluno.turma && <p className="text-sm text-muted-foreground">{aluno.turma}</p>}
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-label="Restrições">
          {ordenarRestricoes(aluno.restricoes).map((r) => (
            <li key={r.tipo_restricao_id}>
              <EtiquetaRestricao nome={r.nome} nivel={r.nivel} />
            </li>
          ))}
        </ul>
        {aluno.observacao && (
          <p className="flex items-start gap-2 rounded-lg bg-muted p-2.5 text-sm">
            <MessageSquareTextIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{aluno.observacao}</span>
          </p>
        )}
      </div>
      {podeEditar && (
        <Link
          href={`/restricoes/alunos/${aluno.id}/editar`}
          aria-label={`Editar ${aluno.nome}`}
          className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <PencilIcon className="size-5" aria-hidden="true" />
        </Link>
      )}
    </li>
  );
}
