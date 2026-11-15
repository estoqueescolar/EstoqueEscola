import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, PrinterIcon, ShieldCheckIcon } from "lucide-react";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { ehDataValida, nomeDoDia, somarDias } from "@/lib/regras/cardapio";
import { formatarData, hojeNoColegio } from "@/lib/regras/datas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { REFEICOES_RESTRICAO } from "@/lib/validacoes/cardapio";
import { FormularioContagens } from "./formulario";

export const metadata: Metadata = { title: "Restrições alimentares · Despensa CAPE" };

const DIAS_HISTORICO = 14;
const linkNavegacao = "inline-flex min-h-11 items-center gap-1 rounded-lg border border-input bg-card px-3 text-sm font-medium hover:border-primary";

export default async function PaginaRestricoes({ searchParams }: PageProps<"/restricoes">) {
  const { data: dataParam } = await searchParams;
  const hoje = hojeNoColegio();
  const data = ehDataValida(dataParam) ? dataParam : hoje;

  const supabase = await criarClienteServidor();
  const [usuario, tipos, contagensDoDia, contagens] = await Promise.all([
    obterUsuarioAtual(),
    supabase.from("tipos_restricao").select("id, nome, descricao").order("nome"),
    supabase
      .from("contagem_restricoes")
      .select("tipo_restricao_id, tipo_refeicao, quantidade_alunos")
      .eq("data", data)
      .not("tipo_refeicao", "is", null),
    supabase
      .from("contagem_restricoes")
      .select("data, quantidade_alunos")
      .gte("data", somarDias(hoje, -DIAS_HISTORICO))
      .lte("data", hoje)
      .not("tipo_refeicao", "is", null),
  ]);

  if (tipos.error || contagensDoDia.error || contagens.error) {
    return (
      <div className="flex flex-col gap-6">
        <CabecalhoPagina titulo="Restrições alimentares" />
        <AvisoFormulario tipo="erro">Não foi possível carregar as restrições. Confira a internet e recarregue a página.</AvisoFormulario>
      </div>
    );
  }

  const listaTipos = tipos.data;
  const podeEditar = pode(usuario?.perfil, "cadastrar");

  // Organiza valores por refeição: valores[tipo_refeicao][tipo_restricao_id] = quantidade
  const valoresPorRefeicao: Record<string, Record<string, number>> = {};
  for (const r of REFEICOES_RESTRICAO) valoresPorRefeicao[r.valor] = {};
  for (const c of contagensDoDia.data) {
    if (c.tipo_refeicao) {
      valoresPorRefeicao[c.tipo_refeicao] ??= {};
      valoresPorRefeicao[c.tipo_refeicao][c.tipo_restricao_id] = c.quantidade_alunos;
    }
  }

  // Resumo do dia: total por tipo de restrição (soma das 4 refeições)
  const totalPorTipo = new Map<string, number>();
  for (const c of contagensDoDia.data) {
    totalPorTipo.set(c.tipo_restricao_id, (totalPorTipo.get(c.tipo_restricao_id) ?? 0) + c.quantidade_alunos);
  }

  // Histórico: total por dia
  const totaisPorDia = new Map<string, number>();
  for (const c of contagens.data) totaisPorDia.set(c.data, (totaisPorDia.get(c.data) ?? 0) + c.quantidade_alunos);
  const historico = [...totaisPorDia.entries()].filter(([, t]) => t > 0).sort(([a], [b]) => b.localeCompare(a));

  const totalDia = [...totalPorTipo.values()].reduce((s, v) => s + v, 0);

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Restrições alimentares"
        descricao="Quantos alunos têm cada restrição em cada refeição, para preparar os pratos especiais."
      />

      <p className="flex items-start gap-2 rounded-lg bg-ok-fundo p-3 text-sm">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        Registramos só a quantidade de alunos, nunca nomes ou dados que identifiquem um aluno.
      </p>

      <nav aria-label="Trocar de dia" className="flex flex-wrap items-center gap-2">
        <Link href={`/restricoes?data=${somarDias(data, -1)}`} className={linkNavegacao}>
          <ChevronLeftIcon className="size-4" aria-hidden="true" /> Dia anterior
        </Link>
        {data !== hoje && (
          <Link href="/restricoes" className={linkNavegacao}>
            Hoje
          </Link>
        )}
        <Link href={`/restricoes?data=${somarDias(data, 1)}`} className={linkNavegacao}>
          Próximo dia <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Link>
        <a
          href={`/api/restricoes-pdf?data=${data}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-medium hover:border-primary"
        >
          <PrinterIcon className="size-4" aria-hidden="true" /> Imprimir dia
        </a>
      </nav>

      <section aria-labelledby="titulo-dia" data-tour="tabela-restricoes" className="flex flex-col gap-4">
        <h2 id="titulo-dia" className="text-lg font-semibold">
          {nomeDoDia(data)}, {formatarData(data)}
          {data === hoje && <span className="font-normal text-muted-foreground"> · hoje</span>}
        </h2>

        {listaTipos.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">
            Nenhum tipo de restrição cadastrado.{" "}
            {podeEditar ? (
              <Link href="/cadastros/restricoes" className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4">
                Cadastrar tipos
              </Link>
            ) : (
              "Peça à direção para cadastrar."
            )}
          </p>
        ) : (
          <>
            {/* Resumo do dia */}
            {totalDia > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <p className="mb-3 text-sm font-medium text-muted-foreground">Resumo do dia — total das 4 refeições</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {listaTipos.map((t) => {
                    const total = totalPorTipo.get(t.id) ?? 0;
                    if (total === 0) return null;
                    return (
                      <li key={t.id} className="flex items-center justify-between gap-2">
                        <span className="text-sm">{t.nome}</span>
                        <span className="font-semibold tabular-nums">{total}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 border-t pt-3 text-sm">
                  Total: <span className="font-semibold">{totalDia} {totalDia === 1 ? "aluno" : "alunos"}</span> com restrição
                </p>
              </div>
            )}

            {/* Formulário por refeição (editores) ou visualização (consulta) */}
            {podeEditar ? (
              <FormularioContagens key={data} data={data} tipos={listaTipos} valores={valoresPorRefeicao} />
            ) : (
              <div className="flex flex-col gap-4">
                {REFEICOES_RESTRICAO.map((r) => {
                  const total = Object.values(valoresPorRefeicao[r.valor] ?? {}).reduce((s, v) => s + v, 0);
                  return (
                    <section key={r.valor} aria-labelledby={`titulo-${r.valor}`}>
                      <h3 id={`titulo-${r.valor}`} className="mb-2 text-base font-medium">
                        {r.texto}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">{total} aluno{total !== 1 ? "s" : ""}</span>
                      </h3>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {listaTipos.map((t) => (
                          <li key={t.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
                            <span className="text-sm">{t.nome}</span>
                            <span className="font-semibold tabular-nums">{valoresPorRefeicao[r.valor]?.[t.id] ?? 0}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <section aria-labelledby="titulo-historico" className="flex flex-col gap-3">
        <h2 id="titulo-historico" className="text-lg font-semibold">
          Últimos dias
        </h2>
        {historico.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma contagem nos últimos {DIAS_HISTORICO} dias.</p>
        ) : (
          <ul className="flex flex-col divide-y rounded-xl border bg-card">
            {historico.map(([dia, total]) => (
              <li key={dia}>
                <Link href={`/restricoes?data=${dia}`} className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 hover:bg-accent">
                  <span>
                    {nomeDoDia(dia)}, {formatarData(dia)}
                  </span>
                  <span className="font-medium">
                    {total} {total === 1 ? "aluno" : "alunos"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
