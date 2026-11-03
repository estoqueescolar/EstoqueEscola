import type { Metadata } from "next";
import { FileSpreadsheetIcon, FileTextIcon } from "lucide-react";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { hojeNoColegio } from "@/lib/regras/datas";
import { somarDias } from "@/lib/regras/cardapio";
import { TIPOS_RELATORIO, TITULOS_RELATORIO, type TipoRelatorio } from "@/lib/regras/relatorios";

export const metadata: Metadata = { title: "Relatórios · Despensa CAPE" };

const DESCRICOES: Record<TipoRelatorio, string> = {
  consumo: "Quanto saiu de cada produto no período, agrupado por categoria.",
  perdas: "Lotes que venceram no período e ainda estão no estoque, perdas e ajustes negativos.",
  compras: "Produtos com estoque igual ou abaixo do mínimo hoje, com quanto comprar e o fornecedor.",
};

const campoData = "min-h-11 rounded-lg border border-input bg-card px-3 text-base";
const botao = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-base font-medium";

// Formulários GET simples: o navegador baixa o arquivo da rota /api/relatorios/[tipo].
export default function PaginaRelatorios() {
  const hoje = hojeNoColegio();
  const inicioMes = `${hoje.slice(0, 8)}01`;

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina titulo="Relatórios" descricao="Escolha o período e baixe em PDF (para imprimir) ou Excel (para editar)." />
      <ul className="grid gap-4 lg:grid-cols-3">
        {TIPOS_RELATORIO.map((tipo) => (
          <li key={tipo} className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
            <div>
              <h2 className="text-lg font-semibold">{TITULOS_RELATORIO[tipo]}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{DESCRICOES[tipo]}</p>
            </div>
            <form action={`/api/relatorios/${tipo}`} method="get" className="mt-auto flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  De
                  <input type="date" name="inicio" required defaultValue={tipo === "perdas" ? somarDias(hoje, -30) : inicioMes} max={hoje} className={campoData} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Até
                  <input type="date" name="fim" required defaultValue={hoje} className={campoData} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="submit" name="formato" value="pdf" className={`${botao} bg-primary text-primary-foreground hover:bg-primary/90`}>
                  <FileTextIcon className="size-5" aria-hidden="true" /> PDF<span className="sr-only"> de {TITULOS_RELATORIO[tipo]}</span>
                </button>
                <button type="submit" name="formato" value="xlsx" className={`${botao} border border-input bg-card hover:bg-accent`}>
                  <FileSpreadsheetIcon className="size-5" aria-hidden="true" /> Excel<span className="sr-only"> de {TITULOS_RELATORIO[tipo]}</span>
                </button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
