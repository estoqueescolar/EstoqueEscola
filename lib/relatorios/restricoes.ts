import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { COR_PRIMARIA } from "./metadados";

export interface DadosRestricoesPdf {
  data: string; // AAAA-MM-DD
  tipos: { id: string; nome: string }[];
  // valores[tipo_refeicao][tipo_restricao_id] = quantidade
  valores: Record<string, Record<string, number>>;
  usuario: string;
}

const REFEICOES = [
  { valor: "cafe_manha",   texto: "Café da manhã" },
  { valor: "lanche_manha", texto: "Lanche da manhã" },
  { valor: "almoco",       texto: "Almoço" },
  { valor: "lanche_tarde", texto: "Lanche da tarde" },
] as const;

const MARGEM = 15;

function dataBr(iso: string) {
  return iso.split("-").reverse().join("/");
}

function nomeDiaSemana(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const d = new Date(ano, mes - 1, dia);
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(d);
}

export function gerarPdfRestricoes(dados: DadosRestricoesPdf): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const largura = doc.internal.pageSize.getWidth();

  // Cabeçalho
  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(30, 40, 35);
  doc.text("Despensa CAPE", MARGEM, 14);
  doc.setFontSize(18).setTextColor(...COR_PRIMARIA);
  doc.text("Restrições alimentares", MARGEM, 23);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(60, 70, 65);
  const diaSemana = nomeDiaSemana(dados.data);
  const dataFormatada = dataBr(dados.data);
  doc.text(`${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${dataFormatada}`, MARGEM, 31);
  doc.setFontSize(8).setTextColor(120, 130, 125);
  doc.text(`Emitido em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date())} por ${dados.usuario}`, MARGEM, 37);

  // Linha divisória
  doc.setDrawColor(...COR_PRIMARIA);
  doc.setLineWidth(0.5);
  doc.line(MARGEM, 40, largura - MARGEM, 40);

  let y = 47;

  // Uma tabela por refeição
  for (const ref of REFEICOES) {
    const vals = dados.valores[ref.valor] ?? {};
    const total = Object.values(vals).reduce((s, v) => s + v, 0);

    // Título da refeição
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...COR_PRIMARIA);
    doc.text(`${ref.texto}`, MARGEM, y);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(80, 90, 85);
    doc.text(`${total} aluno${total !== 1 ? "s" : ""}`, largura - MARGEM, y, { align: "right" });
    y += 2;

    const linhas = dados.tipos.map((t) => [t.nome, String(vals[t.id] ?? 0)]);

    autoTable(doc, {
      startY: y,
      head: [["Restrição", "Alunos"]],
      body: linhas,
      theme: "striped",
      headStyles: { fillColor: COR_PRIMARIA, textColor: 255, fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 10, textColor: [30, 40, 35] },
      columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 25, halign: "center", fontStyle: "bold" } },
      margin: { left: MARGEM, right: MARGEM },
      tableWidth: largura - MARGEM * 2,
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    if (y > 240 && ref.valor !== "lanche_tarde") {
      doc.addPage();
      y = 20;
    }
  }

  // Resumo total
  const totalGeral = dados.tipos.reduce((s, t) => {
    return s + REFEICOES.reduce((sr, r) => sr + (dados.valores[r.valor]?.[t.id] ?? 0), 0);
  }, 0);

  if (y < 260) {
    doc.setDrawColor(180, 190, 185);
    doc.setLineWidth(0.3);
    doc.line(MARGEM, y, largura - MARGEM, y);
    y += 5;
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(30, 40, 35);
    doc.text(`Total do dia: ${totalGeral} aluno${totalGeral !== 1 ? "s" : ""} com restrição alimentar`, MARGEM, y);
  }

  return doc.output("arraybuffer") as unknown as Uint8Array;
}
