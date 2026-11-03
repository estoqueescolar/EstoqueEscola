import type { Metadata } from "next";
import { FileSpreadsheetIcon, FileTextIcon } from "lucide-react";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
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

const campoData = "min-h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-base";
const botao = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-base font-medium";

// Formulários GET simples: o navegador baixa o arquivo da rota /api/relatorios/[tipo].
const ERROS: Record<string, string> = {
  pedido: "Confira o período: a data “De” deve ser igual ou anterior a “Até”, num intervalo de até 1 ano.",
  "periodo-grande": "O período tem registros demais para um arquivo só. Escolha um intervalo menor, por exemplo um mês.",
  falha: "Não foi possível gerar o relatório. Tente de novo; se continuar, avise a direção.",
};

export default async function PaginaRelatorios({ searchParams }: PageProps<"/relatorios">) {
  const { erro } = await searchParams;
  const textoErro = typeof erro === "string" && Object.hasOwn(ERROS, erro) ? ERROS[erro] : undefined;
  const hoje = hojeNoColegio();
  const inicioMes = `${hoje.slice(0, 8)}01`;

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina titulo="Relatórios" descricao="Escolha o período e baixe em PDF (para imprimir) ou Excel (para editar)." />
      {textoErro && <AvisoFormulario tipo="erro" focar>{textoErro}</AvisoFormulario>}
      <ul className="grid gap-4 lg:grid-cols-3">
        {TIPOS_RELATORIO.map((tipo) => (
          <li key={tipo} className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
            <div>
              <h2 className="text-lg font-semibold">{TITULOS_RELATORIO[tipo]}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{DESCRICOES[tipo]}</p>
            </div>
            <form action={`/api/relatorios/${tipo}`} method="get" className="mt-auto flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                  De
                  <input type="date" name="inicio" required defaultValue={tipo === "perdas" ? somarDias(hoje, -30) : inicioMes} max={hoje} className={campoData} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                  Até
                  <input type="date" name="fim" required defaultValue={hoje} max={hoje} className={campoData} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="submit" name="formato" value="pdf" className={`${botao} bg-primary text-primary-foreground hover:bg-[var(--manjericao-escuro)]`}>
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
