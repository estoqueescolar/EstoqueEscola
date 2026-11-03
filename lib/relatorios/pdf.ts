import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { textoCelula, type ConteudoRelatorio } from "@/lib/regras/relatorios";
import { COR_PRIMARIA, SEM_REGISTROS, textoEmissao, textoPeriodo, type MetadadosRelatorio } from "./metadados";

const MARGEM = 15;
const TOPO_TABELA = 40;
const TOTAL_PAGINAS = "{total_paginas}";

// PDF do relatório (puro: não acessa banco). `comprimir: false` permite procurar o texto nos testes.
export function gerarPdf(conteudo: ConteudoRelatorio, meta: MetadadosRelatorio, { comprimir = true } = {}): Uint8Array {
  const doc = new jsPDF({ orientation: conteudo.colunas.length > 6 ? "landscape" : "portrait", unit: "mm", format: "a4", compress: comprimir });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();

  const cabecalhoERodape = () => {
    doc.setTextColor(30, 40, 35);
    doc.setFont("helvetica", "bold").setFontSize(10).text(meta.colegio, MARGEM, 14);
    doc.setFontSize(15).setTextColor(...COR_PRIMARIA).text(conteudo.titulo, MARGEM, 22);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(80, 90, 85);
    doc.text(`Período: ${textoPeriodo(meta)}`, MARGEM, 28);
    doc.text(`Emitido em ${textoEmissao(meta)} por ${meta.usuario}`, MARGEM, 33);
    doc.setDrawColor(...COR_PRIMARIA).setLineWidth(0.4).line(MARGEM, 36, largura - MARGEM, 36);

    const pagina = doc.getCurrentPageInfo().pageNumber;
    doc.setFontSize(8).setTextColor(110, 115, 112);
    doc.text(`Página ${pagina} de ${TOTAL_PAGINAS}`, largura - MARGEM, altura - 8, { align: "right" });
    doc.text("Gerado pelo Despensa CAPE", MARGEM, altura - 8);
  };

  if (conteudo.linhas.length) {
    autoTable(doc, {
      startY: TOPO_TABELA,
      margin: { top: TOPO_TABELA, left: MARGEM, right: MARGEM, bottom: 16 },
      head: [conteudo.colunas.map((c) => c.titulo)],
      body: conteudo.linhas.map((l) => conteudo.colunas.map((c) => textoCelula(l[c.chave], c.tipo))),
      styles: { font: "helvetica", fontSize: 9, cellPadding: 1.8, textColor: [30, 40, 35] },
      headStyles: { fillColor: COR_PRIMARIA, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [244, 247, 245] },
      columnStyles: Object.fromEntries(conteudo.colunas.map((c, i) => [i, c.tipo === "numero" ? { halign: "right" } : {}])),
      didDrawPage: cabecalhoERodape,
    });
  } else {
    cabecalhoERodape();
    doc.setFontSize(11).setTextColor(30, 40, 35).text(SEM_REGISTROS, MARGEM, TOPO_TABELA + 6);
  }

  const fimTabela = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? TOPO_TABELA + 10;
  autoTable(doc, {
    startY: fimTabela + 8,
    margin: { top: TOPO_TABELA, left: MARGEM, right: MARGEM, bottom: 16 },
    head: [["Resumo", ""]],
    body: conteudo.resumo.map((r) => [r.rotulo, r.valor]),
    tableWidth: 110,
    styles: { font: "helvetica", fontSize: 9, cellPadding: 1.6 },
    headStyles: { fillColor: [231, 239, 234], textColor: COR_PRIMARIA, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    didDrawPage: cabecalhoERodape,
  });

  doc.putTotalPages(TOTAL_PAGINAS);
  return new Uint8Array(doc.output("arraybuffer"));
}
