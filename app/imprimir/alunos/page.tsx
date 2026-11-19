import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeftIcon, TriangleAlertIcon } from "lucide-react";
import { ESTILO_NIVEL } from "@/components/alunos/EtiquetaRestricao";
import { FotoAluno } from "@/components/alunos/FotoAluno";
import { listarAlunos, type AlunoListado } from "@/lib/dados/alunos";
import { obterUsuarioAtual } from "@/lib/permissoes";
import { formatarData, hojeNoColegio } from "@/lib/regras/datas";
import { agruparPorRestricao, ordenarRestricoes, textoNivel, type NivelRestricao } from "@/lib/regras/alunos";
import { cn } from "@/lib/utils";
import { BotaoImprimir } from "./botao-imprimir";

export const metadata: Metadata = { title: "Lista da cozinha · Despensa CAPE" };

// Folha para a parede da cozinha: primeiro quem tem reação grave, depois cada alergia com as fotos.
// Página fora do layout do app (sem menu) e com estilo próprio para A4.

function Nivel({ nivel }: { nivel: NivelRestricao }) {
  const { Icone } = ESTILO_NIVEL[nivel];
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", nivel === "grave" ? "font-semibold text-destructive" : nivel === "media" ? "font-medium text-alerta-texto" : "")}>
      <Icone className="size-3.5 shrink-0" aria-hidden="true" />
      {textoNivel(nivel)}
    </span>
  );
}

function Pessoa({ aluno, children, destaque = false }: { aluno: AlunoListado; children: React.ReactNode; destaque?: boolean }) {
  return (
    <li className={cn("flex break-inside-avoid gap-3 rounded-xl border p-2", destaque ? "border-2 border-destructive" : "border-input")}>
      <FotoAluno url={aluno.fotoUrl} nome={aluno.nome} tamanho="media" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="break-words font-semibold leading-tight">{aluno.nome}</p>
        {aluno.turma && <p className="text-sm text-muted-foreground">{aluno.turma}</p>}
        {children}
      </div>
    </li>
  );
}

export default async function PaginaImprimirAlunos() {
  const usuario = await obterUsuarioAtual();
  if (!usuario) redirect("/login");

  const alunos = await listarAlunos();
  const graves = alunos.filter((a) => a.restricoes.some((r) => r.nivel === "grave"));
  const grupos = agruparPorRestricao(alunos);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 bg-card p-4 text-foreground sm:p-8 print:max-w-none print:p-0">
      {/* Margens da folha e cores fiéis na impressão */}
      <style>{`@page { size: A4; margin: 12mm; } @media print { body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link href="/restricoes/alunos" className="flex min-h-11 w-fit items-center gap-1 font-medium text-primary underline underline-offset-4">
          <ChevronLeftIcon className="size-5" aria-hidden="true" /> Voltar para alunos
        </Link>
        <BotaoImprimir />
      </div>

      <header className="flex flex-col gap-1 border-b-2 border-foreground pb-3">
        <h1 className="text-2xl font-semibold">Alunos com restrição alimentar</h1>
        <p className="text-sm">
          Despensa CAPE · impresso em {formatarData(hojeNoColegio())} · {alunos.length} {alunos.length === 1 ? "aluno" : "alunos"}
        </p>
        <p className="text-sm font-medium">Uso interno da cozinha. Não deixe à vista de visitantes nem compartilhe.</p>
      </header>

      {alunos.length === 0 && <p>Nenhum aluno com restrição cadastrado.</p>}

      {graves.length > 0 && (
        <section aria-labelledby="titulo-graves" className="flex flex-col gap-3 rounded-2xl border-2 border-destructive p-3">
          <h2 id="titulo-graves" className="flex items-center gap-2 text-lg font-semibold text-destructive">
            <TriangleAlertIcon className="size-5" aria-hidden="true" /> Atenção: reação grave
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 print:grid-cols-3">
            {graves.map((a) => (
              <Pessoa key={a.id} aluno={a} destaque>
                <ul className="flex flex-col">
                  {ordenarRestricoes(a.restricoes).map((r) => (
                    <li key={r.tipo_restricao_id} className="text-sm">
                      {r.nome} · <Nivel nivel={r.nivel} />
                    </li>
                  ))}
                </ul>
                {a.observacao && <p className="text-sm italic">{a.observacao}</p>}
              </Pessoa>
            ))}
          </ul>
        </section>
      )}

      {grupos.map((g) => (
        <section key={g.tipo_restricao_id} aria-labelledby={`imp-${g.tipo_restricao_id}`} className="flex flex-col gap-2">
          <h2 id={`imp-${g.tipo_restricao_id}`} className="break-after-avoid border-b pb-1 text-lg font-semibold">
            {g.nome} <span className="text-sm font-normal">({g.alunos.length})</span>
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
            {g.alunos.map(({ aluno, nivel }) => (
              <Pessoa key={aluno.id} aluno={aluno} destaque={nivel === "grave"}>
                <Nivel nivel={nivel} />
              </Pessoa>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
