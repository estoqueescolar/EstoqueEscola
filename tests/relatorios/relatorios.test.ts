import ExcelJS from "exceljs";
import { describe, expect, test } from "vitest";
import { gerarPdf } from "@/lib/relatorios/pdf";
import { gerarXlsx } from "@/lib/relatorios/xlsx";
import { SEM_REGISTROS, type MetadadosRelatorio } from "@/lib/relatorios/metadados";
import { montarCompras, montarConsumo, montarPerdas, textoCelula, type ConteudoRelatorio } from "@/lib/regras/relatorios";

const META: MetadadosRelatorio = {
  colegio: "CAPE - Centro de Apoio Pedagógico Especializado",
  inicio: "2026-11-01",
  fim: "2026-11-30",
  emitidoEm: new Date("2026-11-03T15:00:00Z"),
  usuario: "Diretora (demo)",
};

const CONSUMO = montarConsumo([
  { produto_id: "p1", produto: "Leite integral UHT", categoria: "Laticínios", sigla: "L", quantidade: 10, operacao_id: "o1" },
  // a mesma saída FEFO usou dois lotes: conta como uma saída
  { produto_id: "p1", produto: "Leite integral UHT", categoria: "Laticínios", sigla: "L", quantidade: 2.5, operacao_id: "o2" },
  { produto_id: "p1", produto: "Leite integral UHT", categoria: "Laticínios", sigla: "L", quantidade: 1.5, operacao_id: "o2" },
  { produto_id: "p2", produto: "Arroz branco", categoria: "Grãos", sigla: "kg", quantidade: 8, operacao_id: "o3" },
]);

const PERDAS = montarPerdas(
  [{ data_validade: "2026-11-02", produto: "Iogurte natural", lote: "IOG-1020", quantidade: 4, sigla: "kg" }],
  [
    { data: "2026-11-01", tipo: "perda", produto: "Tomate", lote: "TOM-1025", quantidade: 2, sigla: "kg", motivo: "Estragado", responsavel: "Cozinha" },
    { data: "2026-11-03", tipo: "ajuste", produto: "Sal", lote: "SAL-1", quantidade: 1, sigla: "kg", motivo: "Contagem", responsavel: "Cozinha" },
  ],
);

const COMPRAS = montarCompras([
  {
    produto_id: "p3", nome: "Feijão preto", categoria: "Grãos", sigla_unidade: "kg", estoque_atual: 5, estoque_minimo: 8,
    quantidade_a_comprar: 3, fornecedor: "Distribuidora Grão Bom", telefone_fornecedor: "(11) 3333-1001",
  },
]);

const textoDoPdf = (conteudo: ConteudoRelatorio) => Buffer.from(gerarPdf(conteudo, META, { comprimir: false })).toString("latin1");

describe("montagem dos relatórios", () => {
  test("consumo soma por produto e conta cada saída FEFO uma vez", () => {
    const leite = CONSUMO.linhas.find((l) => l.produto === "Leite integral UHT");
    expect(leite).toMatchObject({ quantidade: 14, saidas: 2 });
    expect(CONSUMO.linhas[0].categoria).toBe("Grãos"); // ordenado por categoria
    expect(CONSUMO.resumo).toContainEqual({ rotulo: "Total de saídas", valor: "3" });
  });

  test("perdas junta vencidos, perdas e ajustes por data", () => {
    expect(PERDAS.linhas.map((l) => l.tipo)).toEqual(["Perda", "Vencido em estoque", "Ajuste negativo"]);
    expect(PERDAS.resumo).toContainEqual({ rotulo: "Total de itens", valor: "3" });
  });

  test("formata números com vírgula e datas no padrão brasileiro", () => {
    expect(textoCelula(2.5, "numero")).toBe("2,5");
    expect(textoCelula("2026-11-02", "data")).toBe("02/11/2026");
    expect(textoCelula(null, "texto")).toBe("—");
  });
});

describe("PDF", () => {
  test.each([
    ["consumo", CONSUMO, "Leite integral UHT"],
    ["perdas", PERDAS, "IOG-1020"],
    ["compras", COMPRAS, "Feij"],
  ] as const)("%s tem cabeçalho, período, produto e paginação", (_, conteudo, produto) => {
    const pdf = gerarPdf(conteudo, META, { comprimir: false });
    expect(Buffer.from(pdf.slice(0, 4)).toString()).toBe("%PDF");
    const texto = textoDoPdf(conteudo);
    expect(texto).toContain("CAPE - Centro de Apoio Pedag");
    expect(texto).toContain(conteudo.titulo.slice(0, 10));
    expect(texto).toContain("01/11/2026 a 30/11/2026");
    expect(texto).toContain(produto);
    expect(texto).toContain("Página 1 de");
  });

  test("sem dados, gera o arquivo com a mensagem", () => {
    expect(textoDoPdf(montarConsumo([]))).toContain(SEM_REGISTROS);
  });
});

describe("XLSX", () => {
  const abrir = async (conteudo: ConteudoRelatorio) => {
    const livro = new ExcelJS.Workbook();
    await livro.xlsx.load(Buffer.from(await gerarXlsx(conteudo, META)) as never);
    return livro;
  };

  test("consumo tem aba Resumo, cabeçalho, filtro e a quantidade do produto", async () => {
    const livro = await abrir(CONSUMO);
    expect(livro.worksheets[0].name).toBe("Resumo");
    expect(livro.getWorksheet("Resumo")!.getCell("B2").value).toBe("Consumo por período");
    const aba = livro.getWorksheet("Consumo")!;
    expect(aba.getRow(1).values).toEqual([undefined, "Categoria", "Produto", "Unidade", "Quantidade consumida", "Nº de saídas"]);
    expect(aba.autoFilter).toBeTruthy();
    const linhaLeite = aba.getRows(2, aba.rowCount - 1)!.find((r) => r.getCell(2).value === "Leite integral UHT")!;
    expect(linhaLeite.getCell(4).value).toBe(14);
  });

  test("perdas grava a data como data de verdade", async () => {
    const aba = (await abrir(PERDAS)).getWorksheet("Vencidos e perdas")!;
    expect(aba.getCell("A2").value).toBeInstanceOf(Date);
    expect(aba.getColumn(1).numFmt).toBe("dd/mm/yyyy");
  });

  test("compras e caso vazio", async () => {
    expect((await abrir(COMPRAS)).getWorksheet("Compras")!.getCell("E2").value).toBe(3);
    expect((await abrir(montarCompras([]))).getWorksheet("Compras")!.getCell("A2").value).toBe(SEM_REGISTROS);
  });
});
