import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGridIcon, PlusIcon, PrinterIcon, SearchIcon, ShieldAlertIcon, TriangleAlertIcon, UsersIcon } from "lucide-react";
import { AbasRestricoes } from "@/components/alunos/AbasRestricoes";
import { CartaoAluno } from "@/components/alunos/CartaoAluno";
import { GuiaCadastro } from "@/components/alunos/GuiaCadastro";
import { MiniaturaAluno } from "@/components/alunos/MiniaturaAluno";
import { Botao } from "@/components/comum/Botao";
import { LinkBotao } from "@/components/comum/CabecalhoPagina";
import { listarAlunos } from "@/lib/dados/alunos";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { agruparPorRestricao, filtrarAlunos, temRestricaoGrave } from "@/lib/regras/alunos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Alunos e alergias · Despensa CAPE" };

const primeiro = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export default async function PaginaAlunos({ searchParams }: PageProps<"/restricoes/alunos">) {
  const params = await searchParams;
  const busca = primeiro(params.busca)?.slice(0, 80) ?? "";
  const tipoId = primeiro(params.restricao) ?? "";
  const apenasGraves = primeiro(params.graves) === "1";
  const porAlergia = primeiro(params.ver) === "alergia";

  const supabase = await criarClienteServidor();
  const [usuario, alunos, tipos] = await Promise.all([
    obterUsuarioAtual(),
    listarAlunos(),
    supabase.from("tipos_restricao").select("id, nome").order("nome"),
  ]);
  if (tipos.error) throw new Error("Não foi possível carregar a lista de restrições.");
  const podeEditar = pode(usuario?.perfil, "cadastrar");

  const filtrados = filtrarAlunos(alunos, { busca, tipoId: tipoId || undefined, apenasGraves });
  const grupos = agruparPorRestricao(filtrados).filter((g) => !tipoId || g.tipo_restricao_id === tipoId);
  const temFiltro = busca !== "" || tipoId !== "" || apenasGraves;
  const totalGraves = alunos.filter(temRestricaoGrave).length;

  // Mantém os filtros ao trocar de visão.
  const linkVisao = (alergia: boolean) => {
    const q = new URLSearchParams();
    if (busca) q.set("busca", busca);
    if (tipoId) q.set("restricao", tipoId);
    if (apenasGraves) q.set("graves", "1");
    if (alergia) q.set("ver", "alergia");
    const texto = q.toString();
    return texto ? `/restricoes/alunos?${texto}` : "/restricoes/alunos";
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Restrições alimentares</h1>
            <p className="mt-1 text-muted-foreground">Quem tem cada alergia, com foto, para preparar e servir com segurança.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {alunos.length > 0 && (
              <LinkBotao href="/imprimir/alunos">
                <PrinterIcon className="size-5" aria-hidden="true" /> Imprimir lista
              </LinkBotao>
            )}
            {podeEditar && (
              <LinkBotao href="/restricoes/alunos/novo" principal>
                <PlusIcon className="size-5" aria-hidden="true" /> Cadastrar aluno
              </LinkBotao>
            )}
          </div>
        </div>
        <AbasRestricoes atual="/restricoes/alunos" />
      </header>

      {podeEditar && <GuiaCadastro />}

      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Dados de crianças: use só na cozinha. Não fotografe a tela nem compartilhe fora da escola.
      </p>

      {alunos.length > 0 && (
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-card p-4">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <UsersIcon className="size-4" aria-hidden="true" /> Alunos com restrição
            </dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{alunos.length}</dd>
          </div>
          <div className={cn("rounded-2xl border p-4", totalGraves > 0 ? "border-destructive bg-perigo-fundo" : "bg-card")}>
            <dt className={cn("flex items-center gap-2 text-sm", totalGraves > 0 ? "text-destructive" : "text-muted-foreground")}>
              <TriangleAlertIcon className="size-4" aria-hidden="true" /> Com reação grave
            </dt>
            <dd className={cn("mt-1 text-2xl font-semibold tabular-nums", totalGraves > 0 && "text-destructive")}>{totalGraves}</dd>
          </div>
        </dl>
      )}

      <form method="get" role="search" aria-label="Filtrar alunos" className="flex flex-col gap-3 md:flex-row md:items-end">
        {porAlergia && <input type="hidden" name="ver" value="alergia" />}
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="busca" className="text-sm font-medium">Buscar aluno</label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="busca"
              name="busca"
              type="search"
              defaultValue={busca}
              maxLength={80}
              autoComplete="off"
              placeholder="Nome ou turma"
              className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-base"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 md:w-64">
          <label htmlFor="filtro-restricao" className="text-sm font-medium">Alergia ou restrição</label>
          <select id="filtro-restricao" name="restricao" defaultValue={tipoId} className="h-11 w-full rounded-lg border border-input bg-card px-3 text-base">
            <option value="">Todas</option>
            {tipos.data.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>
        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-input bg-card px-3 text-base">
          <input type="checkbox" name="graves" value="1" defaultChecked={apenasGraves} className="size-5 accent-destructive" />
          Só grave
        </label>
        <div className="flex gap-2">
          <Botao type="submit" className="flex-1 md:flex-none">Filtrar</Botao>
          {temFiltro && (
            <Link href={porAlergia ? "/restricoes/alunos?ver=alergia" : "/restricoes/alunos"} className="flex min-h-11 flex-1 items-center justify-center rounded-lg px-4 text-base font-medium text-primary underline underline-offset-4 md:flex-none">
              Limpar
            </Link>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {temFiltro ? `${plural(filtrados.length, "aluno encontrado", "alunos encontrados")}` : plural(filtrados.length, "aluno", "alunos")}
        </p>
        <nav aria-label="Modo de exibição" className="flex gap-1 rounded-lg border bg-muted p-1">
          {[
            { alergia: false, texto: "Por aluno", Icone: UsersIcon },
            { alergia: true, texto: "Por alergia", Icone: LayoutGridIcon },
          ].map(({ alergia, texto, Icone }) => (
            <Link
              key={texto}
              href={linkVisao(alergia)}
              aria-current={porAlergia === alergia ? "page" : undefined}
              className={cn(
                "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-3 text-base font-medium sm:flex-none",
                porAlergia === alergia ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icone className="size-4" aria-hidden="true" /> {texto}
            </Link>
          ))}
        </nav>
      </div>

      {alunos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card p-8 text-center">
          <UsersIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium">Nenhum aluno cadastrado ainda</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {podeEditar ? "Cadastre o primeiro aluno com alergia para a cozinha ver aqui." : "Peça à direção ou à cozinha para cadastrar os alunos."}
          </p>
          {podeEditar && (
            <LinkBotao href="/restricoes/alunos/novo" principal>
              <PlusIcon className="size-5" aria-hidden="true" /> Cadastrar aluno
            </LinkBotao>
          )}
        </div>
      ) : filtrados.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card p-6 text-center text-muted-foreground">
          Nenhum aluno com esses filtros. Confira o nome ou use “Limpar”.
        </p>
      ) : porAlergia ? (
        <div className="flex flex-col gap-8">
          {grupos.map((g) => (
            <section key={g.tipo_restricao_id} aria-labelledby={`grupo-${g.tipo_restricao_id}`} className="flex flex-col gap-3">
              <h2 id={`grupo-${g.tipo_restricao_id}`} className="flex items-baseline gap-2 border-b pb-2 text-lg font-semibold">
                {g.nome}
                <span className="text-sm font-normal text-muted-foreground">{plural(g.alunos.length, "aluno", "alunos")}</span>
              </h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {g.alunos.map(({ aluno, nivel }) => (
                  <MiniaturaAluno key={aluno.id} aluno={aluno} nivel={nivel} podeEditar={podeEditar} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2" aria-label="Alunos">
          {filtrados.map((a) => (
            <CartaoAluno key={a.id} aluno={a} podeEditar={podeEditar} />
          ))}
        </ul>
      )}
    </div>
  );
}
