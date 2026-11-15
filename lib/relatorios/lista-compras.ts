import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { COR_PRIMARIA, COR_PRIMARIA_HEX } from "./metadados";

export interface ItemListaPdf {
  nome: string;
  quantidade: string;
  unidade: string;
  fornecedor?: string;
  telefone?: string;
  extra?: boolean; // true = item manual
}

const MARGEM = 15;
const dataBr = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" }).format(d);

// PDF com layout de lista de mercado: produto, quantidade, espaço para preço e check.
export function gerarPdfListaCompras(itens: ItemListaPdf[], usuario: string, { comprimir = true } = {}): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: comprimir });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const hoje = dataBr(new Date());

  const cabecalho = () => {
    doc.setTextColor(30, 40, 35);
    doc.setFont("helvetica", "bold").setFontSize(10).text("Despensa CAPE", MARGEM, 14);
    doc.setFontSize(16).setTextColor(...COR_PRIMARIA).text("Lista de compras", MARGEM, 22);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(80, 90, 85);
    doc.text(`Emitido em ${hoje} por ${usuario}`, MARGEM, 28);
    doc.setDrawColor(...COR_PRIMARIA).setLineWidth(0.4).line(MARGEM, 31, largura - MARGEM, 31);
    // Rodapé
    doc.setFontSize(8);
    doc.text("Gerado pelo Despensa CAPE", MARGEM, altura - 8);
    doc.text(`Página ${doc.getCurrentPageInfo().pageNumber}`, largura - MARGEM, altura - 8, { align: "right" });
  };

  const linhas = itens.map((i) => [
    i.nome,
    `${i.quantidade}${i.unidade ? " " + i.unidade : ""}`,
    i.fornecedor ?? "",
    i.extra ? "Extra" : "Est. baixo",
    "",   // check (preenchimento manual)
  ]);

  autoTable(doc, {
    startY: 36,
    margin: { top: 36, left: MARGEM, right: MARGEM, bottom: 16 },
    head: [["Produto", "Quantidade", "Fornecedor", "Tipo", "v"]],
    body: linhas,
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: [30, 40, 35] },
    headStyles: { fillColor: COR_PRIMARIA, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [244, 247, 245] },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 28, halign: "right" },
      2: { cellWidth: 36 },
      3: { cellWidth: 24 },
      4: { cellWidth: 10, halign: "center" },
    },
    didDrawPage: cabecalho,
  });

  return new Uint8Array(doc.output("arraybuffer"));
}

// XLSX simples: produto, quantidade, unidade, fornecedor, telefone, tipo, preço (vazio).
export async function gerarXlsxListaCompras(itens: ItemListaPdf[], usuario: string): Promise<Uint8Array> {
  const livro = new ExcelJS.Workbook();
  livro.creator = "Despensa CAPE";
  livro.created = new Date();

  const aba = livro.addWorksheet("Lista de compras", { views: [{ state: "frozen", ySplit: 1 }] });
  aba.columns = [
    { header: "Produto", key: "nome", width: 32 },
    { header: "Quantidade", key: "quantidade", width: 14 },
    { header: "Unidade", key: "unidade", width: 12 },
    { header: "Fornecedor", key: "fornecedor", width: 28 },
    { header: "Telefone", key: "telefone", width: 18 },
    { header: "Tipo", key: "tipo", width: 14 },
    { header: "Preço R$", key: "preco", width: 12 },
  ];

  const cab = aba.getRow(1);
  cab.eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR_PRIMARIA_HEX } };
  });

  for (const i of itens) {
    aba.addRow({
      nome: i.nome,
      quantidade: i.quantidade,
      unidade: i.unidade,
      fornecedor: i.fornecedor ?? "",
      telefone: i.telefone ?? "",
      tipo: i.extra ? "Extra" : "Estoque baixo",
      preco: null,
    });
  }

  // Rodapé
  aba.addRow([]);
  const rodape = aba.addRow([`Emitido em ${dataBr(new Date())} por ${usuario} · Despensa CAPE`]);
  rodape.getCell(1).font = { italic: true, color: { argb: "FF888888" } };

  return new Uint8Array(await livro.xlsx.writeBuffer());
}
