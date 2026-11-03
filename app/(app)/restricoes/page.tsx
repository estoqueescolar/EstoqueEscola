import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, ShieldCheckIcon } from "lucide-react";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { ehDataValida, nomeDoDia, somarDias } from "@/lib/regras/cardapio";
import { formatarData, hojeNoColegio } from "@/lib/regras/datas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioContagens } from "./formulario";

export const metadata: Metadata = { title: "Restrições alimentares · Despensa CAPE" };

const DIAS_HISTORICO = 14;
const linkNavegacao = "inline-flex min-h-11 items-center gap-1 rounded-lg border bg-card px-3 text-sm font-medium hover:border-primary";

export default async function PaginaRestricoes({ searchParams }: PageProps<"/restricoes">) {
  const { data: dataParam } = await searchParams;
  const hoje = hojeNoColegio();
  const data = ehDataValida(dataParam) ? dataParam : hoje;

  const supabase = await criarClienteServidor();
  const [usuario, { data: tipos }, { data: contagens }] = await Promise.all([
    obterUsuarioAtual(),
    supabase.from("tipos_restricao").select("id, nome, descricao").order("nome"),
    supabase
      .from("contagem_restricoes")
      .select("data, tipo_restricao_id, quantidade_alunos")
      .gte("data", somarDias(hoje, -DIAS_HISTORICO))
      .lte("data", data > hoje ? data : hoje),
  ]);
  const listaTipos = tipos ?? [];
  const doDia = (contagens ?? []).filter((c) => c.data === data);
  const valores = Object.fromEntries(doDia.map((c) => [c.tipo_restricao_id, c.quantidade_alunos]));
  const podeEditar = pode(usuario?.perfil, "cadastrar");

  // histórico: total por dia, do mais recente para o mais antigo
  const totaisPorDia = new Map<string, number>();
  for (const c of contagens ?? []) totaisPorDia.set(c.data, (totaisPorDia.get(c.data) ?? 0) + c.quantidade_alunos);
  const historico = [...totaisPorDia.entries()].filter(([, t]) => t > 0).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Restrições alimentares"
        descricao="Quantos alunos têm cada restrição no dia, para preparar as refeições especiais."
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
      </nav>

      <section aria-labelledby="titulo-dia" className="flex flex-col gap-3">
        <h2 id="titulo-dia" className="text-lg font-semibold">
          {nomeDoDia(data)}, {formatarData(data)}
          {data === hoje && <span className="font-normal text-muted-foreground"> · hoje</span>}
        </h2>
        {listaTipos.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">
            Nenhum tipo de restrição cadastrado.{" "}
            <Link href="/cadastros/restricoes" className="font-medium text-primary underline underline-offset-4">
              Cadastrar tipos
            </Link>
          </p>
        ) : podeEditar ? (
          <FormularioContagens key={data} data={data} tipos={listaTipos} valores={valores} />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {listaTipos.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
                <span>{t.nome}</span>
                <span className="font-heading text-xl font-semibold">{valores[t.id] ?? 0}</span>
              </li>
            ))}
          </ul>
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
