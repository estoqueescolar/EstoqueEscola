import { describe, expect, it } from "vitest";
import type { ItemListaCompras } from "@/lib/regras/compras";
import { agruparPorProduto, calcularIndicadores, textoListaCompras } from "@/lib/regras/painel";
import { esquemaConfiguracoes } from "@/lib/validacoes/configuracoes";

const item = (parcial: Partial<ItemListaCompras>): ItemListaCompras => ({
  produto_id: "p1",
  nome: "Arroz branco",
  sigla_unidade: "kg",
  estoque_atual: 4,
  estoque_minimo: 10,
  quantidade_a_comprar: 6,
  fornecedor: null,
  telefone_fornecedor: null,
  ...parcial,
});

describe("agruparPorProduto", () => {
  it("agrupa os lotes de cada produto sem alterar a lista original", () => {
    const lotes = [
      { produto_id: "a", codigo: "1" },
      { produto_id: "b", codigo: "2" },
      { produto_id: "a", codigo: "3" },
    ];
    const mapa = agruparPorProduto(lotes);
    expect(mapa.get("a")?.map((l) => l.codigo)).toEqual(["1", "3"]);
    expect(mapa.get("b")?.map((l) => l.codigo)).toEqual(["2"]);
    expect(lotes).toHaveLength(3);
  });
});

describe("calcularIndicadores", () => {
  it("conta vencidos, próximos, estoque baixo e sem estoque", () => {
    const indicadores = calcularIndicadores(
      [{ situacao: "vencido" }, { situacao: "proximo" }, { situacao: "proximo" }],
      [item({ estoque_atual: 0 }), item({ estoque_atual: 3 })],
    );
    expect(indicadores).toEqual({ vencidos: 1, proximos: 2, estoqueBaixo: 2, semEstoque: 1 });
  });

  it("devolve zero quando não há alertas", () => {
    expect(calcularIndicadores([], [])).toEqual({ vencidos: 0, proximos: 0, estoqueBaixo: 0, semEstoque: 0 });
  });
});

describe("textoListaCompras", () => {
  it("monta uma linha por produto com quantidade e fornecedor", () => {
    const texto = textoListaCompras(
      [item({ fornecedor: "Atacadão do Bairro" }), item({ produto_id: "p2", nome: "Leite", sigla_unidade: "L", quantidade_a_comprar: 2.5 })],
      "03/11/2026",
    );
    expect(texto).toBe("Lista de compras (03/11/2026)\n- Arroz branco: 6 kg (Atacadão do Bairro)\n- Leite: 2,5 L");
  });

  it("avisa quando não há nada para comprar", () => {
    expect(textoListaCompras([], "03/11/2026")).toContain("nada abaixo do mínimo");
  });
});

describe("esquemaConfiguracoes", () => {
  it("aceita dias inteiros entre 1 e 60, inclusive vindos como texto", () => {
    expect(esquemaConfiguracoes.parse({ dias_alerta_validade: "10" })).toEqual({ dias_alerta_validade: 10 });
  });

  it.each([["0"], ["61"], ["2.5"], ["abc"]])("recusa %s", (valor) => {
    expect(esquemaConfiguracoes.safeParse({ dias_alerta_validade: valor }).success).toBe(false);
  });
});
