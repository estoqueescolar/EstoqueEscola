import Link from "next/link";
import type { MovimentacaoListada } from "@/lib/dados/movimentacoes";
import { formatarQuantidade } from "@/lib/regras/quantidades";
import { SeloMovimentacao } from "./SeloMovimentacao";

const formatoDataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface Props {
  movimentacoes: readonly MovimentacaoListada[];
  textoVazio: string;
  // esconde o produto quando a lista já é de um produto só
  mostrarProduto?: boolean;
}

// Histórico em cartões (cabe em 375px sem rolagem lateral). Somente leitura: movimentações são imutáveis.
export function ListaMovimentacoes({ movimentacoes, textoVazio, mostrarProduto = true }: Props) {
  if (!movimentacoes.length) {
    return <p className="rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">{textoVazio}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {movimentacoes.map((m) => (
        <li key={m.id} className="flex flex-col gap-2 rounded-xl border bg-card p-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeloMovimentacao tipo={m.tipo} />
              <span className="text-lg font-semibold">
                <span aria-hidden="true">{m.sentido === 1 ? "+" : "−"}</span>
                <span className="sr-only">{m.sentido === 1 ? "entrou " : "saiu "}</span>
                {formatarQuantidade(m.quantidade, m.sigla)}
              </span>
              {mostrarProduto && (
                <Link href={`/produtos/${m.produto_id}`} className="font-medium break-words underline underline-offset-4">
                  {m.produto}
                </Link>
              )}
            </div>
            <p className="text-muted-foreground">
              Lote{" "}
              <Link href={`/lotes/${m.lote_id}`} className="underline underline-offset-4">
                {m.lote}
              </Link>{" "}
              · {m.local}
            </p>
            {m.motivo && (
              <p>
                <span className="font-medium">Motivo:</span> {m.motivo}
              </p>
            )}
            {m.observacao && <p className="break-words text-muted-foreground">{m.observacao}</p>}
          </div>
          <p className="shrink-0 text-sm text-muted-foreground md:text-right">
            <time dateTime={m.data_hora}>{formatoDataHora.format(new Date(m.data_hora))}</time>
            <span className="block">{m.responsavel ?? "—"}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
