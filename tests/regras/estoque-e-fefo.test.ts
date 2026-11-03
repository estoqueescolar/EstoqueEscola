import { describe, expect, it } from "vitest";
import { calcularEstoqueDisponivel, calcularEstoqueProduto, estoqueBaixo, loteAtivo } from "@/lib/regras/estoque";
import { ordenarFefo, planejarSaidaFefo, validarSaida } from "@/lib/regras/fefo";
import type { LoteEstoque } from "@/lib/regras/tipos";

const HOJE = "2026-11-03";

const lote = (id: string, quantidade: number, validade: string, entrada = "2026-10-01"): LoteEstoque => ({
  id, codigo: id.toUpperCase(), quantidade, data_entrada: entrada, data_validade: validade,
});

const lotes = [
  lote("tarde", 5, "2026-12-30"),
  lote("cedo", 3, "2026-11-08"),
  lote("vencido", 2, "2026-11-01"),
  lote("zerado", 0, "2026-11-04"),
];

describe("estoque por lote", () => {
  it("lote com quantidade zero é inativo", () => {
    expect(loteAtivo({ quantidade: 0 })).toBe(false);
    expect(loteAtivo({ quantidade: 0.001 })).toBe(true);
  });

  it("estoque do produto é a soma dos lotes ativos", () => {
    expect(calcularEstoqueProduto(lotes)).toBe(10);
    expect(calcularEstoqueProduto([])).toBe(0);
  });

  it("soma decimais sem erro de ponto flutuante", () => {
    expect(calcularEstoqueProduto([{ quantidade: 0.1 }, { quantidade: 0.2 }])).toBe(0.3);
  });

  it("disponível para consumo exclui lotes vencidos", () => {
    expect(calcularEstoqueDisponivel(lotes, HOJE)).toBe(8);
  });
});

describe("estoque baixo", () => {
  it("é baixo quando igual ou abaixo do mínimo", () => {
    expect(estoqueBaixo(5, 5)).toBe(true);
    expect(estoqueBaixo(4.9, 5)).toBe(true);
    expect(estoqueBaixo(5.001, 5)).toBe(false);
  });

  it("mínimo zero com estoque zero conta como baixo", () => {
    expect(estoqueBaixo(0, 0)).toBe(true);
  });
});

describe("FEFO", () => {
  it("ordena pela validade mais próxima e desempata pela entrada mais antiga", () => {
    const ordenados = ordenarFefo([
      lote("b", 1, "2026-11-10", "2026-10-05"),
      lote("a", 1, "2026-11-10", "2026-10-01"),
      lote("c", 1, "2026-11-09"),
    ]);
    expect(ordenados.map((l) => l.id)).toEqual(["c", "a", "b"]);
  });

  it("retira do lote que vence antes e divide entre lotes", () => {
    expect(planejarSaidaFefo(lotes, 4, HOJE)).toEqual([
      { lote_id: "cedo", codigo: "CEDO", quantidade: 3 },
      { lote_id: "tarde", codigo: "TARDE", quantidade: 1 },
    ]);
  });

  it("não usa lotes vencidos nem zerados", () => {
    const usados = planejarSaidaFefo(lotes, 8, HOJE).map((r) => r.lote_id);
    expect(usados).not.toContain("vencido");
    expect(usados).not.toContain("zerado");
  });

  it("lote que vence hoje ainda pode ser consumido", () => {
    expect(planejarSaidaFefo([lote("hoje", 2, HOJE)], 1, HOJE)).toHaveLength(1);
  });

  it("não altera a lista original", () => {
    const copia = structuredClone(lotes);
    planejarSaidaFefo(lotes, 4, HOJE);
    expect(lotes).toEqual(copia);
  });
});

describe("bloqueio de saída maior que o estoque", () => {
  const base = { nomeProduto: "Arroz", sigla: "kg", lotes, hoje: HOJE };

  it("permite saída até o disponível", () => {
    expect(validarSaida({ ...base, quantidade: 8 })).toEqual({ ok: true });
  });

  it("bloqueia com mensagem clara e cita os vencidos", () => {
    const resultado = validarSaida({ ...base, quantidade: 8.5 });
    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;
    expect(resultado.mensagem).toContain("há 8 kg disponíveis");
    expect(resultado.mensagem).toContain("8,5 kg");
    expect(resultado.mensagem).toContain("2 kg em lotes vencidos");
  });

  it("bloqueia quantidade zero ou negativa", () => {
    expect(validarSaida({ ...base, quantidade: 0 }).ok).toBe(false);
    expect(validarSaida({ ...base, quantidade: -1 }).ok).toBe(false);
  });
});
