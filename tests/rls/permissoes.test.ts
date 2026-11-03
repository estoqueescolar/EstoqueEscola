import { beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clienteAnonimo, clienteComo } from "./apoio";

let admin: SupabaseClient;
let operador: SupabaseClient;
let consulta: SupabaseClient;
let produtoId: string;
let loteId: string;
let categoriaId: string;

beforeAll(async () => {
  [admin, operador, consulta] = await Promise.all([
    clienteComo("administrador"),
    clienteComo("operador"),
    clienteComo("consulta"),
  ]);
  const { data: produto } = await consulta.from("produtos").select("id, categoria_id").eq("nome", "Arroz branco tipo 1").single();
  produtoId = produto!.id;
  categoriaId = produto!.categoria_id;
  const { data: lote } = await consulta.from("lotes").select("id").eq("produto_id", produtoId).limit(1).single();
  loteId = lote!.id;
});

describe("visitante sem login", () => {
  it("não lê nenhum dado do estoque", async () => {
    const { data } = await clienteAnonimo().from("produtos").select("id");
    expect(data ?? []).toHaveLength(0);
  });
});

describe("perfil consulta", () => {
  it("lê estoque, lotes e movimentações", async () => {
    const { data: produtos } = await consulta.from("produtos").select("id");
    const { data: movs } = await consulta.from("movimentacoes").select("id").limit(1);
    expect(produtos!.length).toBeGreaterThan(30);
    expect(movs).toHaveLength(1);
  });

  it("não insere cadastros", async () => {
    const { error } = await consulta.from("categorias").insert({ nome: "Teste consulta" });
    expect(error).not.toBeNull();
  });

  it("não altera produtos", async () => {
    const { data } = await consulta.from("produtos").update({ estoque_minimo: 999 }).eq("id", produtoId).select();
    expect(data ?? []).toHaveLength(0);
    const { data: produto } = await consulta.from("produtos").select("estoque_minimo").eq("id", produtoId).single();
    expect(Number(produto!.estoque_minimo)).not.toBe(999);
  });

  it("não registra movimentações", async () => {
    const { error } = await consulta.rpc("registrar_saida", { p_produto_id: produtoId, p_quantidade: 1 });
    expect(error?.message).toMatch(/perfil não permite/);
  });

  it("não lê o perfil de outros usuários", async () => {
    const { data } = await consulta.from("perfis").select("email");
    expect(data).toHaveLength(1);
  });

  it("não altera configurações", async () => {
    const { data } = await consulta.from("configuracoes").update({ valor: 30 }).eq("chave", "dias_alerta_validade").select();
    expect(data ?? []).toHaveLength(0);
  });
});

describe("perfil operador", () => {
  it("cadastra e edita cadastros", async () => {
    const { data, error } = await operador.from("fornecedores").insert({ nome: `Fornecedor do teste RLS ${crypto.randomUUID()}` }).select().single();
    expect(error).toBeNull();
    const { error: erroEdicao } = await operador.from("fornecedores").update({ telefone: "(11) 0000-0000" }).eq("id", data!.id);
    expect(erroEdicao).toBeNull();
  });

  it("não exclui cadastros", async () => {
    const { data } = await operador.from("categorias").delete().eq("id", categoriaId).select();
    expect(data ?? []).toHaveLength(0);
  });

  it("não edita nem exclui movimentações", async () => {
    const { data: mov } = await operador.from("movimentacoes").select("id").limit(1).single();
    const { error: erroEdicao } = await operador.from("movimentacoes").update({ quantidade: 1 }).eq("id", mov!.id);
    const { error: erroExclusao } = await operador.from("movimentacoes").delete().eq("id", mov!.id);
    expect(erroEdicao).not.toBeNull();
    expect(erroExclusao).not.toBeNull();
  });

  it("não insere movimentação diretamente (só pelas RPCs)", async () => {
    const { error } = await operador.from("movimentacoes").insert({
      tipo: "entrada", sentido: 1, produto_id: produtoId, lote_id: loteId, quantidade: 1,
    });
    expect(error).not.toBeNull();
  });

  it("não altera a quantidade do lote diretamente", async () => {
    const { error } = await operador.from("lotes").update({ quantidade: 9999 }).eq("id", loteId);
    expect(error).not.toBeNull();
  });

  it("não gerencia perfis", async () => {
    const { data } = await operador.from("perfis").update({ perfil: "administrador" }).neq("perfil", "x").select();
    expect(data ?? []).toHaveLength(0);
  });
});

describe("perfil administrador", () => {
  it("lê todos os perfis", async () => {
    const { data } = await admin.from("perfis").select("id");
    expect(data!.length).toBeGreaterThanOrEqual(3);
  });

  it("não altera o próprio perfil", async () => {
    const { data: eu } = await admin.auth.getUser();
    const { error } = await admin.from("perfis").update({ perfil: "consulta" }).eq("id", eu.user!.id);
    expect(error?.message).toMatch(/próprio perfil/);
  });

  it("exclui cadastros sem uso", async () => {
    const { data } = await admin.from("categorias").insert({ nome: `Categoria temporária ${crypto.randomUUID()}` }).select().single();
    const { data: excluidas } = await admin.from("categorias").delete().eq("id", data!.id).select();
    expect(excluidas).toHaveLength(1);
  });
});

describe("nome do responsável no histórico", () => {
  it("consulta vê o nome de quem registrou, mas não lê e-mails de outros perfis", async () => {
    const { data } = await consulta.from("movimentacoes").select("responsavel").limit(1).single();
    expect(data?.responsavel).toBeTruthy();
    const { data: perfis } = await consulta.from("perfis").select("email");
    expect(perfis).toHaveLength(1);
  });

  it("visitante sem login não chama a função", async () => {
    const { data } = await clienteAnonimo().from("movimentacoes").select("responsavel");
    expect(data ?? []).toHaveLength(0);
  });
});
