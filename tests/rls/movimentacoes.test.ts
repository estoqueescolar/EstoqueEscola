import { beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clienteComo } from "./apoio";

// Testa as RPCs transacionais com um produto criado só para o teste.
let operador: SupabaseClient;
let produtoId: string;

const hoje = new Date();
const dia = (deslocamento: number) =>
  new Date(hoje.getTime() + deslocamento * 86_400_000).toISOString().slice(0, 10);

async function estoque(): Promise<number> {
  const { data } = await operador.from("lotes").select("quantidade").eq("produto_id", produtoId);
  return (data ?? []).reduce((soma, l) => soma + Number(l.quantidade), 0);
}

beforeAll(async () => {
  operador = await clienteComo("operador");
  const { data: base } = await operador.from("produtos").select("categoria_id, unidade_id, local_padrao_id").limit(1).single();
  const { data: produto, error } = await operador
    .from("produtos")
    .insert({ ...base, nome: `Produto teste ${Date.now()}`, estoque_minimo: 2 })
    .select("id")
    .single();
  if (error) throw error;
  produtoId = produto.id;

  // dois lotes: o que vence antes deve sair primeiro (FEFO); um terceiro já vencido
  await operador.rpc("registrar_entrada", { p_produto_id: produtoId, p_quantidade: 5, p_data_validade: dia(30), p_codigo: "TARDE" });
  await operador.rpc("registrar_entrada", { p_produto_id: produtoId, p_quantidade: 3, p_data_validade: dia(5), p_codigo: "CEDO" });
  await operador.rpc("registrar_entrada", {
    p_produto_id: produtoId, p_quantidade: 2, p_data_entrada: dia(-20), p_data_validade: dia(-2), p_codigo: "VENCIDO",
  });
});

describe("entrada", () => {
  it("acrescenta ao lote existente com o mesmo código", async () => {
    await operador.rpc("registrar_entrada", { p_produto_id: produtoId, p_quantidade: 1, p_data_validade: dia(30), p_codigo: "TARDE" });
    const { data } = await operador.from("lotes").select("quantidade").eq("produto_id", produtoId).eq("codigo", "TARDE").single();
    expect(Number(data!.quantidade)).toBe(6);
  });

  it("recusa validade anterior à entrada", async () => {
    const { error } = await operador.rpc("registrar_entrada", { p_produto_id: produtoId, p_quantidade: 1, p_data_validade: dia(-1) });
    expect(error?.message).toMatch(/depois da data de entrada/);
  });
});

describe("saída (FEFO)", () => {
  it("bloqueia saída maior que o disponível e explica os vencidos", async () => {
    const antes = await estoque();
    const { error } = await operador.rpc("registrar_saida", { p_produto_id: produtoId, p_quantidade: 10 });
    expect(error?.message).toMatch(/Estoque insuficiente.*há 9 .* disponíveis/);
    expect(error?.message).toMatch(/lotes vencidos/);
    expect(await estoque()).toBe(antes);
  });

  it("retira primeiro do lote que vence antes e divide entre lotes", async () => {
    const { data, error } = await operador.rpc("registrar_saida", { p_produto_id: produtoId, p_quantidade: 4 });
    expect(error).toBeNull();
    expect(data).toEqual([
      expect.objectContaining({ codigo: "CEDO", quantidade: 3 }),
      expect.objectContaining({ codigo: "TARDE", quantidade: 1 }),
    ]);
    const { data: cedo } = await operador.from("lotes").select("quantidade, ativo").eq("produto_id", produtoId).eq("codigo", "CEDO").single();
    expect(Number(cedo!.quantidade)).toBe(0);
    expect(cedo!.ativo).toBe(false);
  });
});

describe("perda e ajuste", () => {
  it("perda exige motivo", async () => {
    const { data: lote } = await operador.from("lotes").select("id").eq("produto_id", produtoId).eq("codigo", "VENCIDO").single();
    const { error } = await operador.rpc("registrar_perda", { p_lote_id: lote!.id, p_quantidade: 1, p_motivo: "  " });
    expect(error?.message).toMatch(/motivo/);
  });

  it("perda do lote vencido zera o lote", async () => {
    const { data: lote } = await operador.from("lotes").select("id").eq("produto_id", produtoId).eq("codigo", "VENCIDO").single();
    const { error } = await operador.rpc("registrar_perda", { p_lote_id: lote!.id, p_quantidade: 2, p_motivo: "Vencido" });
    expect(error).toBeNull();
    expect(await estoque()).toBe(5);
  });

  it("ajuste negativo não deixa o lote abaixo de zero; positivo soma", async () => {
    const { data: lote } = await operador.from("lotes").select("id").eq("produto_id", produtoId).eq("codigo", "TARDE").single();
    const { error: erro } = await operador.rpc("registrar_ajuste", {
      p_lote_id: lote!.id, p_quantidade: 50, p_sentido: -1, p_motivo: "Inventário",
    });
    expect(erro?.message).toMatch(/abaixo de zero/);
    await operador.rpc("registrar_ajuste", { p_lote_id: lote!.id, p_quantidade: 0.5, p_sentido: 1, p_motivo: "Inventário" });
    expect(await estoque()).toBe(5.5);
  });

  it("o histórico registra todas as operações com o usuário", async () => {
    const { data } = await operador.from("movimentacoes").select("tipo, usuario_id").eq("produto_id", produtoId);
    const tipos = new Set(data!.map((m) => m.tipo));
    expect(tipos).toEqual(new Set(["entrada", "saida", "perda", "ajuste"]));
    expect(data!.every((m) => m.usuario_id)).toBe(true);
  });
});
