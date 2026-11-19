import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clienteComo } from "./apoio";

// A tela de contagem grava com upsert por (data, tipo_refeicao, tipo_restricao_id).
// Regressão: com índice único parcial, o banco recusava com "no unique or exclusion constraint matching".
const CONFLITO = "data,tipo_refeicao,tipo_restricao_id";
const DATA_TESTE = "2030-01-15";

let admin: SupabaseClient;
let operador: SupabaseClient;
let consulta: SupabaseClient;
let tipoId: string;

beforeAll(async () => {
  [admin, operador, consulta] = await Promise.all([clienteComo("administrador"), clienteComo("operador"), clienteComo("consulta")]);
  const { data } = await consulta.from("tipos_restricao").select("id").limit(1).single();
  tipoId = data!.id;
});

afterAll(async () => {
  await admin.from("contagem_restricoes").delete().eq("data", DATA_TESTE);
});

const linha = (quantidade: number, refeicao = "almoco") => ({
  data: DATA_TESTE,
  tipo_refeicao: refeicao,
  tipo_restricao_id: tipoId,
  quantidade_alunos: quantidade,
});

describe("contagem de restrições por refeição", () => {
  it("salva e depois atualiza a mesma contagem (upsert), sem duplicar", async () => {
    const primeira = await operador.from("contagem_restricoes").upsert(linha(3), { onConflict: CONFLITO });
    expect(primeira.error).toBeNull();
    const segunda = await operador.from("contagem_restricoes").upsert(linha(5), { onConflict: CONFLITO });
    expect(segunda.error).toBeNull();

    const { data } = await operador.from("contagem_restricoes").select("quantidade_alunos").eq("data", DATA_TESTE).eq("tipo_refeicao", "almoco");
    expect(data).toHaveLength(1);
    expect(data![0].quantidade_alunos).toBe(5);
  });

  it("refeições diferentes no mesmo dia são contagens separadas", async () => {
    await operador.from("contagem_restricoes").upsert(linha(2, "cafe_manha"), { onConflict: CONFLITO });
    const { data } = await operador.from("contagem_restricoes").select("tipo_refeicao").eq("data", DATA_TESTE);
    expect(data!.map((l) => l.tipo_refeicao).sort()).toEqual(["almoco", "cafe_manha"]);
  });

  it("recusa inserir a mesma contagem duas vezes sem upsert", async () => {
    const { error } = await operador.from("contagem_restricoes").insert(linha(9));
    expect(error).not.toBeNull();
  });

  it("perfil consulta não grava contagem", async () => {
    const { error } = await consulta.from("contagem_restricoes").upsert(linha(7, "lanche_tarde"), { onConflict: CONFLITO });
    expect(error).not.toBeNull();
  });
});
