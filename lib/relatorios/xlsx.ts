import ExcelJS from "exceljs";
import type { ConteudoRelatorio } from "@/lib/regras/relatorios";
import { COR_PRIMARIA_HEX, SEM_REGISTROS, textoEmissao, textoPeriodo, type MetadadosRelatorio } from "./metadados";

const LARGURA_MIN = 10;
const LARGURA_MAX = 50;

const paraData = (d: string) => {
  const [ano, mes, dia] = d.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia));
};

// Planilha do relatório (pura): aba "Resumo" primeiro e depois a aba de dados.
export async function gerarXlsx(conteudo: ConteudoRelatorio, meta: MetadadosRelatorio): Promise<Uint8Array> {
  const livro = new ExcelJS.Workbook();
  livro.creator = "Despensa CAPE";
  livro.created = meta.emitidoEm;

  const resumo = livro.addWorksheet("Resumo");
  resumo.columns = [{ width: 28 }, { width: 48 }];
  const linhasResumo: [string, string][] = [
    ["Colégio", meta.colegio],
    ["Relatório", conteudo.titulo],
    ["Período", textoPeriodo(meta)],
    ["Emitido em", textoEmissao(meta)],
    ["Gerado por", meta.usuario],
    ["", ""],
    ...conteudo.resumo.map((r): [string, string] => [r.rotulo, r.valor]),
  ];
  linhasResumo.forEach((l) => resumo.addRow(l));
  resumo.getColumn(1).font = { bold: true };
  resumo.getCell("B2").font = { bold: true, size: 13, color: { argb: COR_PRIMARIA_HEX } };

  const aba = livro.addWorksheet(conteudo.nomeAba, { views: [{ state: "frozen", ySplit: 1 }] });
  const cabecalho = aba.addRow(conteudo.colunas.map((c) => c.titulo));
  cabecalho.eachCell((celula) => {
    celula.font = { bold: true, color: { argb: "FFFFFFFF" } };
    celula.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR_PRIMARIA_HEX } };
  });
  aba.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: conteudo.colunas.length } };

  if (!conteudo.linhas.length) aba.addRow([SEM_REGISTROS]);
  for (const linha of conteudo.linhas) {
    aba.addRow(conteudo.colunas.map((c) => {
      const v = linha[c.chave];
      if (v === null || v === "") return null;
      if (c.tipo === "data") return paraData(String(v));
      return c.tipo === "numero" ? Number(v) : String(v);
    }));
  }

  conteudo.colunas.forEach((c, i) => {
    const coluna = aba.getColumn(i + 1);
    if (c.tipo === "data") coluna.numFmt = "dd/mm/yyyy";
    if (c.tipo === "numero") coluna.numFmt = "#,##0.###";
    const maior = Math.max(c.titulo.length, ...conteudo.linhas.map((l) => String(l[c.chave] ?? "").length));
    coluna.width = Math.min(Math.max(maior + 2, LARGURA_MIN), LARGURA_MAX);
  });

  return new Uint8Array(await livro.xlsx.writeBuffer());
}
