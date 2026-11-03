import { describe, expect, it } from "vitest";
import { gerarListaCompras } from "@/lib/regras/compras";
import { diferencaEmDias, formatarData, hojeNoColegio } from "@/lib/regras/datas";
import { aplicarAjuste, validarBaixaNoLote, validarMovimentacao } from "@/lib/regras/movimentacoes";
import { formatarQuantidade } from "@/lib/regras/quantidades";
import type { LoteEstoque, ProdutoEstoque } from "@/lib/regras/tipos";
import { classificarValidade, descreverValidade, lotesEmAlerta } from "@/lib/regras/validade";

const HOJE = "2026-11-03";

describe("validade (alerta de 7 dias)", () => {
  it.each([
    ["2026-11-02", "vencido"],
    ["2026-11-03", "proximo"],
    ["2026-11-10", "proximo"],
    ["2026-11-11", "ok"],
  ])("lote com validade %s é %s", (validade, esperado) => {
    expect(classificarValidade({ data_validade: validade }, HOJE)).toBe(esperado);
  });

  it("respeita o número de dias configurado", () => {
    expect(classificarValidade({ data_validade: "2026-11-11" }, HOJE, 10)).toBe("proximo");
  });

  it("alerta só lotes com quantidade e ordena por validade", () => {
    const alertas = lotesEmAlerta(
      [
        { data_validade: "2026-11-05", quantidade: 1 },
        { data_validade: "2026-10-30", quantidade: 2 },
        { data_validade: "2026-10-29", quantidade: 0 },
        { data_validade: "2026-12-30", quantidade: 5 },
      ],
      HOJE,
    );
    expect(alertas.map((a) => [a.data_validade, a.situacao])).toEqual([
      ["2026-10-30", "vencido"],
      ["2026-11-05", "proximo"],
    ]);
  });

  it("descreve a validade em linguagem simples", () => {
    expect(descreverValidade("2026-11-03", HOJE)).toBe("Vence hoje");
    expect(descreverValidade("2026-11-04", HOJE)).toBe("Vence amanhã");
    expect(descreverValidade("2026-11-06", HOJE)).toBe("Vence em 3 dias");
    expect(descreverValidade("2026-11-02", HOJE)).toBe("Vencido há 1 dia");
    expect(descreverValidade("2026-10-31", HOJE)).toBe("Vencido há 3 dias");
  });
});

describe("datas e quantidades", () => {
  it("calcula diferença de dias atravessando meses", () => {
    expect(diferencaEmDias("2026-10-30", "2026-11-02")).toBe(3);
  });

  it("usa o fuso do colégio para definir hoje", () => {
    // 02h UTC do dia 4 ainda é dia 3 em São Paulo
    expect(hojeNoColegio(new Date("2026-11-04T02:00:00Z"))).toBe("2026-11-03");
  });

  it("formata no padrão brasileiro", () => {
    expect(formatarData("2026-11-03")).toBe("03/11/2026");
    expect(formatarQuantidade(2.5, "kg")).toBe("2,5 kg");
    expect(formatarQuantidade(1234.125)).toBe("1.234,125");
  });
});

describe("movimentações", () => {
  it("perda e ajuste exigem motivo", () => {
    expect(validarMovimentacao({ tipo: "perda", quantidade: 1, motivo: " " }).ok).toBe(false);
    expect(validarMovimentacao({ tipo: "ajuste", quantidade: 1 }).ok).toBe(false);
    expect(validarMovimentacao({ tipo: "perda", quantidade: 1, motivo: "Vencido" }).ok).toBe(true);
    expect(validarMovimentacao({ tipo: "saida", quantidade: 1 }).ok).toBe(true);
  });

  it("quantidade deve ser maior que zero", () => {
    expect(validarMovimentacao({ tipo: "entrada", quantidade: 0 }).ok).toBe(false);
  });

  it("perda ou ajuste negativo não ultrapassa o lote", () => {
    expect(validarBaixaNoLote({ codigo: "L1", quantidade: 2 }, 2, "kg").ok).toBe(true);
    const resultado = validarBaixaNoLote({ codigo: "L1", quantidade: 2 }, 2.5, "kg");
    expect(resultado).toEqual({ ok: false, mensagem: expect.stringContaining("tem apenas 2 kg") });
  });

  it("ajuste soma ou subtrai", () => {
    expect(aplicarAjuste(3, 0.5, 1)).toBe(3.5);
    expect(aplicarAjuste(3, 1, -1)).toBe(2);
  });
});

describe("lista de compras", () => {
  const produtos: ProdutoEstoque[] = [
    { id: "arroz", nome: "Arroz", estoque_minimo: 30, sigla_unidade: "kg", fornecedor: { nome: "Grão Bom", telefone: "(11) 1" } },
    { id: "fuba", nome: "Fubá", estoque_minimo: 5, sigla_unidade: "kg", fornecedor: null },
    { id: "sal", nome: "Sal", estoque_minimo: 3, sigla_unidade: "kg" },
    { id: "oleo", nome: "Óleo", estoque_minimo: 6, sigla_unidade: "gf" },
  ];
  const lote = (quantidade: number): LoteEstoque => ({
    id: String(quantidade), codigo: "X", quantidade, data_entrada: "2026-10-01", data_validade: "2027-01-01",
  });
  const lotes = new Map<string, LoteEstoque[]>([
    ["arroz", [lote(20), lote(0)]],
    ["sal", [lote(10)]],
    ["oleo", [lote(6)]],
  ]);

  const lista = gerarListaCompras(produtos, lotes);

  it("inclui só produtos com estoque igual ou abaixo do mínimo", () => {
    expect(lista.map((i) => i.produto_id).sort()).toEqual(["arroz", "fuba", "oleo"]);
  });

  it("calcula quanto falta para o mínimo", () => {
    const porId = Object.fromEntries(lista.map((i) => [i.produto_id, i.quantidade_a_comprar]));
    expect(porId).toEqual({ arroz: 10, fuba: 5, oleo: 0 });
  });

  it("sugere o fornecedor do produto", () => {
    expect(lista.find((i) => i.produto_id === "arroz")?.fornecedor).toBe("Grão Bom");
    expect(lista.find((i) => i.produto_id === "fuba")?.fornecedor).toBeNull();
  });

  it("ordena pelo mais urgente (maior falta proporcional)", () => {
    expect(lista[0].produto_id).toBe("fuba");
  });
});
