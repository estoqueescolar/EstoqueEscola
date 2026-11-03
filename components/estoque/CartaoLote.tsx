import Link from "next/link";
import { ChevronRightIcon, MapPinIcon } from "lucide-react";
import type { LoteListado } from "@/lib/dados/lotes";
import { formatarData } from "@/lib/regras/datas";
import { formatarQuantidade } from "@/lib/regras/quantidades";
import { EtiquetaValidade } from "./EtiquetaValidade";

interface Props {
  lote: LoteListado;
  hoje: string;
  diasAlerta: number;
  mostrarProduto?: boolean;
}

// Cartão de lote: o que é, onde está, quanto tem e quando vence.
export function CartaoLote({ lote, hoje, diasAlerta, mostrarProduto = true }: Props) {
  return (
    <Link href={`/lotes/${lote.id}`} className="flex h-full flex-col gap-2 rounded-xl border bg-card p-4 hover:border-primary">
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          {mostrarProduto && <span className="block text-lg font-semibold break-words">{lote.produto}</span>}
          <span className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
            Lote {lote.codigo}
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="size-4" aria-hidden="true" /> {lote.local}
            </span>
          </span>
        </span>
        <ChevronRightIcon className="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
      </span>
      <span>
        <span className="font-heading text-2xl font-semibold">{formatarQuantidade(lote.quantidade)}</span>{" "}
        <span className="text-muted-foreground">{lote.sigla}</span>
        <span className="ml-2 text-sm text-muted-foreground">entrou em {formatarData(lote.data_entrada)}</span>
      </span>
      {lote.ativo ? (
        <EtiquetaValidade dataValidade={lote.data_validade} hoje={hoje} diasAlerta={diasAlerta} />
      ) : (
        <span className="text-sm font-medium text-muted-foreground">Lote encerrado (quantidade zero)</span>
      )}
    </Link>
  );
}
