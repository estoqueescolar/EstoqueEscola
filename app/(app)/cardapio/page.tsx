import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon, UsersIcon } from "lucide-react";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { diasDaSemana, ehDataValida, inicioDaSemana, montarSemana, nomeDoDia, REFEICOES, refeicoesPendentes, somarDias } from "@/lib/regras/cardapio";
import { formatarData, hojeNoColegio } from "@/lib/regras/datas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Cardápio · Despensa CAPE" };

const linkNavegacao = "inline-flex min-h-11 items-center gap-1 rounded-lg border bg-card px-3 text-sm font-medium hover:border-primary";

export default async function PaginaCardapio({ searchParams }: PageProps<"/cardapio">) {
  const { semana } = await searchParams;
  const hoje = hojeNoColegio();
  const segunda = inicioDaSemana(ehDataValida(semana) ? semana : hoje);
  const dias = diasDaSemana(segunda);
  const sexta = dias[dias.length - 1];

  const supabase = await criarClienteServidor();
  const [usuario, { data: itens }, { data: contagens }] = await Promise.all([
    obterUsuarioAtual(),
    supabase.from("cardapio_planejado").select("data, tipo_refeicao, descricao").gte("data", segunda).lte("data", sexta),
    supabase.from("contagem_restricoes").select("data, quantidade_alunos").gte("data", segunda).lte("data", sexta),
  ]);
  const grade = montarSemana(itens ?? [], segunda);
  const podeEditar = pode(usuario?.perfil, "cadastrar");
  const alunosComRestricao = (data: string) =>
    (contagens ?? []).filter((c) => c.data === data).reduce((s, c) => s + c.quantidade_alunos, 0);

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Cardápio"
        descricao={`Semana de ${formatarData(segunda)} a ${formatarData(sexta)} · 4 refeições por dia`}
      />

      <nav aria-label="Trocar de semana" className="flex flex-wrap gap-2">
        <Link href={`/cardapio?semana=${somarDias(segunda, -7)}`} className={linkNavegacao}>
          <ChevronLeftIcon className="size-4" aria-hidden="true" /> Semana anterior
        </Link>
        {segunda !== inicioDaSemana(hoje) && (
          <Link href="/cardapio" className={linkNavegacao}>
            Esta semana
          </Link>
        )}
        <Link href={`/cardapio?semana=${somarDias(segunda, 7)}`} className={linkNavegacao}>
          Próxima semana <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </nav>

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {grade.map((dia) => {
          const pendentes = refeicoesPendentes(dia);
          const restricoes = alunosComRestricao(dia.data);
          const ehHoje = dia.data === hoje;
          return (
            <li key={dia.data} className={cn("flex flex-col gap-3 rounded-xl border bg-card p-4", ehHoje && "border-primary")}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  {nomeDoDia(dia.data)}
                  <span className="block text-sm font-normal text-muted-foreground">
                    {formatarData(dia.data)}
                    {ehHoje && " · hoje"}
                  </span>
                </h2>
                {podeEditar && (
                  <Link href={`/cardapio/${dia.data}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
                    <PencilIcon className="size-4" aria-hidden="true" /> Editar<span className="sr-only"> {nomeDoDia(dia.data)}</span>
                  </Link>
                )}
              </div>
              <dl className="flex flex-col gap-2">
                {REFEICOES.map(({ tipo, nome }) => (
                  <div key={tipo}>
                    <dt className="text-sm font-medium text-muted-foreground">{nome}</dt>
                    <dd className={cn("text-base", !dia.refeicoes[tipo] && "text-muted-foreground italic")}>
                      {dia.refeicoes[tipo] ?? "Não planejado"}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto flex flex-wrap gap-2 pt-1 text-sm">
                {pendentes > 0 && (
                  <span className="rounded-full bg-alerta-fundo px-2.5 py-1 font-medium text-alerta-texto">
                    {pendentes === 1 ? "1 refeição a planejar" : `${pendentes} refeições a planejar`}
                  </span>
                )}
                <Link
                  href={`/restricoes?data=${dia.data}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 font-medium text-primary underline-offset-4 hover:underline"
                >
                  <UsersIcon className="size-4" aria-hidden="true" />
                  {restricoes === 0 ? "Sem restrições contadas" : `${restricoes} ${restricoes === 1 ? "aluno" : "alunos"} com restrição`}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
