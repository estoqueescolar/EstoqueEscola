import { describe, expect, it } from "vitest";
import { esquemaFornecedor, esquemaProduto } from "@/lib/validacoes/cadastros";
import { quantidade } from "@/lib/validacoes/comum";

const ID = "6f1e1c8e-6b3a-4c2b-9a54-2a8c7d1e0f11";

describe("quantidade digitada", () => {
  const q = quantidade("a quantidade");
  it.each([
    ["2,5", 2.5],
    ["2.5", 2.5],
    ["1.234,5", 1234.5],
    [" 10 ", 10],
    [3, 3],
  ])("aceita %s", (entrada, esperado) => {
    expect(q.parse(entrada)).toBe(esperado);
  });

  it.each(["", "abc", "0", "-1", "1,2345"])("recusa %s", (entrada) => {
    expect(q.safeParse(entrada).success).toBe(false);
  });

  it("estoque mínimo aceita zero", () => {
    expect(quantidade("o estoque mínimo", { permitirZero: true }).parse("0")).toBe(0);
  });
});

describe("produto", () => {
  const base = { nome: "Arroz", categoria_id: ID, unidade_id: ID, local_padrao_id: ID, estoque_minimo: "30" };

  it("fornecedor é opcional e vazio vira null", () => {
    expect(esquemaProduto.parse({ ...base, fornecedor_id: "" }).fornecedor_id).toBeNull();
  });

  it("exige categoria, unidade e local", () => {
    const r = esquemaProduto.safeParse({ ...base, categoria_id: "" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Escolha a categoria.");
  });

  it("remove espaços do nome e recusa nome vazio", () => {
    expect(esquemaProduto.parse({ ...base, nome: "  Feijão  " }).nome).toBe("Feijão");
    expect(esquemaProduto.safeParse({ ...base, nome: "   " }).success).toBe(false);
  });
});

describe("fornecedor", () => {
  it("telefone vazio vira null e telefone inválido é recusado", () => {
    expect(esquemaFornecedor.parse({ nome: "X", telefone: "" }).telefone).toBeNull();
    expect(esquemaFornecedor.safeParse({ nome: "X", telefone: "abc" }).success).toBe(false);
    expect(esquemaFornecedor.parse({ nome: "X", telefone: "(11) 98888-1004" }).telefone).toBe("(11) 98888-1004");
  });
});

describe("movimentações (Zod)", async () => {
  const { esquemaAjuste, esquemaEntrada, esquemaPerda } = await import("@/lib/validacoes/movimentacoes");

  it("entrada exige validade depois da entrada", () => {
    const base = { produto_id: ID, quantidade: "5", data_entrada: "2026-11-03" };
    expect(esquemaEntrada.safeParse({ ...base, data_validade: "2026-11-03" }).success).toBe(false);
    expect(esquemaEntrada.safeParse({ ...base, data_validade: "2026-11-04" }).success).toBe(true);
  });

  it("entrada: código, local e fornecedor em branco viram null", () => {
    const r = esquemaEntrada.parse({ produto_id: ID, quantidade: "1,5", data_entrada: "2026-11-03", data_validade: "2026-12-01", codigo: "", local_id: "", fornecedor_id: "" });
    expect(r).toMatchObject({ quantidade: 1.5, codigo: null, local_id: null, fornecedor_id: null });
  });

  it("perda e ajuste exigem motivo", () => {
    expect(esquemaPerda.safeParse({ lote_id: ID, quantidade: "1", motivo: " " }).success).toBe(false);
    expect(esquemaAjuste.safeParse({ lote_id: ID, quantidade: "1", sentido: "1", motivo: "" }).success).toBe(false);
  });

  it("ajuste converte o sentido e recusa valores fora de +1/-1", () => {
    expect(esquemaAjuste.parse({ lote_id: ID, quantidade: "1", sentido: "-1", motivo: "Inventário" }).sentido).toBe(-1);
    expect(esquemaAjuste.safeParse({ lote_id: ID, quantidade: "1", sentido: "2", motivo: "Inventário" }).success).toBe(false);
  });

  it("dados já convertidos pelo formulário passam de novo no servidor", () => {
    const doFormulario = esquemaAjuste.parse({ lote_id: ID, quantidade: "0,5", sentido: "1", motivo: "Inventário" });
    expect(esquemaAjuste.parse(doFormulario)).toEqual(doFormulario);
    const entrada = esquemaEntrada.parse({ produto_id: ID, quantidade: "2", data_entrada: "2026-11-03", data_validade: "2026-12-01" });
    expect(esquemaEntrada.parse(entrada)).toEqual(entrada);
  });
});
