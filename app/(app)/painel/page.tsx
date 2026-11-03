import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowDownToLineIcon, ArrowUpFromLineIcon, ChevronRightIcon, CircleCheckIcon, OctagonAlertIcon,
  PackageIcon, ShoppingBasketIcon, TriangleAlertIcon,
} from "lucide-react";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { LinkBotao } from "@/components/comum/CabecalhoPagina";
import { EtiquetaValidade } from "@/components/estoque/EtiquetaValidade";
import { carregarSituacaoEstoque } from "@/lib/dados/painel";
import { NOMES_PERFIL, obterUsuarioAtual, pode } from "@/lib/permissoes";
import { formatarQuantidade } from "@/lib/regras/quantidades";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Painel · Despensa CAPE" };

const AVISOS: Record<string, string> = {
  "senha-alterada": "Senha alterada. Use a nova senha da próxima vez que entrar.",
  "conta-criada": "Conta criada. Você tem acesso de consulta; a direção pode liberar mais.",
};
// Quantos itens de cada alerta aparecem no painel (o restante fica na tela própria).
const ITENS_POR_ALERTA = 6;

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

interface Indicador {
  href: string;
  valor: number;
  rotulo: string;
  Icone: typeof PackageIcon;
  tom: "perigo" | "alerta" | "neutro";
}

const TONS = {
  perigo: "text-destructive bg-perigo-fundo",
  alerta: "text-alerta-texto bg-alerta-fundo",
  neutro: "text-primary bg-ok-fundo",
} as const;

function CartaoIndicador({ href, valor, rotulo, Icone, tom }: Indicador) {
  const ativo = valor > 0;
  return (
    <li>
      <Link href={href} className="flex h-full min-h-24 flex-col justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary">
        <span className={cn("flex size-9 items-center justify-center rounded-lg", ativo ? TONS[tom] : TONS.neutro)}>
          <Icone className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block font-heading text-3xl font-semibold">{valor}</span>
          <span className="text-sm text-muted-foreground">{rotulo}</span>
        </span>
      </Link>
    </li>
  );
}

function SecaoAlerta({ id, titulo, href, textoLink, children }: { id: string; titulo: string; href: string; textoLink: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={id} className="text-lg font-semibold">
          {titulo}
        </h2>
        <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">
          {textoLink} <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function TudoEmDia({ texto }: { texto: string }) {
  return (
    <p className="flex items-center gap-2 rounded-lg bg-ok-fundo p-3 text-sm">
      <CircleCheckIcon className="size-5 shrink-0 text-primary" aria-hidden="true" /> {texto}
    </p>
  );
}

export default async function PaginaPainel({ searchParams }: PageProps<"/painel">) {
  const [usuario, situacao, { aviso }] = await Promise.all([obterUsuarioAtual(), carregarSituacaoEstoque(), searchParams]);
  const textoAviso = typeof aviso === "string" && Object.hasOwn(AVISOS, aviso) ? AVISOS[aviso] : undefined;
  const { indicadores, alertasValidade, listaCompras, hoje, diasAlerta } = situacao;
  const podeMovimentar = pode(usuario?.perfil, "movimentar");

  const cartoes: Indicador[] = [
    { href: "/lotes?situacao=vencidos", valor: indicadores.vencidos, rotulo: indicadores.vencidos === 1 ? "lote vencido" : "lotes vencidos", Icone: OctagonAlertIcon, tom: "perigo" },
    { href: "/lotes?situacao=proximos", valor: indicadores.proximos, rotulo: `vencem em até ${plural(diasAlerta, "dia", "dias")}`, Icone: TriangleAlertIcon, tom: "alerta" },
    { href: "/compras", valor: indicadores.estoqueBaixo, rotulo: "com estoque baixo", Icone: ShoppingBasketIcon, tom: "perigo" },
    { href: "/produtos", valor: situacao.produtosAtivos, rotulo: "produtos ativos", Icone: PackageIcon, tom: "neutro" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {textoAviso && <AvisoFormulario tipo="sucesso">{textoAviso}</AvisoFormulario>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Olá, {usuario?.nome || "boas-vindas"}!</h1>
          <p className="mt-1 text-muted-foreground">
            {usuario ? NOMES_PERFIL[usuario.perfil] : ""} · resumo da cozinha hoje
          </p>
        </div>
        {podeMovimentar && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <LinkBotao href="/lotes/entrada" principal>
              <ArrowDownToLineIcon className="size-5" aria-hidden="true" /> Registrar entrada
            </LinkBotao>
            <LinkBotao href="/movimentacoes/saida">
              <ArrowUpFromLineIcon className="size-5" aria-hidden="true" /> Registrar saída
            </LinkBotao>
          </div>
        )}
      </div>

      <section aria-label="Indicadores">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cartoes.map((c) => (
            <CartaoIndicador key={c.href} {...c} />
          ))}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SecaoAlerta id="titulo-validade" titulo="Validade" href="/lotes" textoLink="Ver lotes">
          {alertasValidade.length === 0 ? (
            <TudoEmDia texto={`Nenhum lote vencido ou vencendo nos próximos ${plural(diasAlerta, "dia", "dias")}.`} />
          ) : (
            <ul className="flex flex-col divide-y">
              {alertasValidade.slice(0, ITENS_POR_ALERTA).map((lote) => (
                <li key={lote.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/lotes/${lote.id}`} className="inline-flex min-h-11 items-center font-medium break-words underline-offset-4 hover:underline">
                      {lote.produto}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Lote {lote.codigo} · {formatarQuantidade(lote.quantidade, lote.sigla)} · {lote.local}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <EtiquetaValidade dataValidade={lote.data_validade} hoje={hoje} diasAlerta={diasAlerta} comData={false} />
                    {podeMovimentar && lote.situacao === "vencido" && (
                      <Link
                        href={`/movimentacoes/perda?lote=${lote.id}`}
                        className="inline-flex min-h-11 items-center text-sm font-medium text-destructive underline-offset-4 hover:underline"
                      >
                        Registrar perda<span className="sr-only"> do lote {lote.codigo}</span>
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {alertasValidade.length > ITENS_POR_ALERTA && (
            <p className="text-sm text-muted-foreground">e mais {plural(alertasValidade.length - ITENS_POR_ALERTA, "lote", "lotes")}.</p>
          )}
        </SecaoAlerta>

        <SecaoAlerta id="titulo-compras" titulo="Estoque baixo" href="/compras" textoLink="Lista de compras">
          {listaCompras.length === 0 ? (
            <TudoEmDia texto="Todos os produtos estão acima do estoque mínimo." />
          ) : (
            <ul className="flex flex-col divide-y">
              {listaCompras.slice(0, ITENS_POR_ALERTA).map((item) => (
                <li key={item.produto_id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/produtos/${item.produto_id}`} className="inline-flex min-h-11 items-center font-medium break-words underline-offset-4 hover:underline">
                      {item.nome}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.estoque_atual <= 0 ? "Sem estoque" : `Tem ${formatarQuantidade(item.estoque_atual, item.sigla_unidade)}`} · mínimo{" "}
                      {formatarQuantidade(item.estoque_minimo, item.sigla_unidade)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-perigo-fundo px-2.5 py-1 text-sm font-medium text-destructive">
                    Comprar {formatarQuantidade(item.quantidade_a_comprar, item.sigla_unidade)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {listaCompras.length > ITENS_POR_ALERTA && (
            <p className="text-sm text-muted-foreground">e mais {plural(listaCompras.length - ITENS_POR_ALERTA, "produto", "produtos")}.</p>
          )}
        </SecaoAlerta>
      </div>

      {pode(usuario?.perfil, "alterarConfiguracoes") && (
        <p className="text-sm text-muted-foreground">
          O alerta de validade avisa com {plural(diasAlerta, "dia", "dias")} de antecedência.{" "}
          <Link href="/configuracoes" className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline">
            Alterar prazo
          </Link>
        </p>
      )}
    </div>
  );
}
