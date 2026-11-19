import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clienteAnonimo, clienteComo } from "./apoio";

const BUCKET = "fotos-alunos";
// PNG mínimo de 1x1 pixel
const PNG = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="),
  (c) => c.charCodeAt(0),
);

let admin: SupabaseClient;
let operador: SupabaseClient;
let consulta: SupabaseClient;
let tipoId: string;
let alunoId: string;
const caminhosCriados: string[] = [];

beforeAll(async () => {
  [admin, operador, consulta] = await Promise.all([
    clienteComo("administrador"),
    clienteComo("operador"),
    clienteComo("consulta"),
  ]);
  const { data: tipo } = await consulta.from("tipos_restricao").select("id").eq("nome", "Alergia a amendoim").single();
  tipoId = tipo!.id;
});

afterAll(async () => {
  if (caminhosCriados.length > 0) await operador.storage.from(BUCKET).remove(caminhosCriados);
  if (alunoId) await admin.from("alunos").delete().eq("id", alunoId);
});

describe("visitante sem login", () => {
  it("não lê alunos nem restrições de alunos", async () => {
    const anonimo = clienteAnonimo();
    const { data: alunos } = await anonimo.from("alunos").select("id");
    const { data: vinculos } = await anonimo.from("alunos_restricoes").select("aluno_id");
    expect(alunos ?? []).toHaveLength(0);
    expect(vinculos ?? []).toHaveLength(0);
  });

  it("não lê nem baixa fotos, nem pela URL pública", async () => {
    const caminho = `${crypto.randomUUID()}.png`;
    const { error: erroEnvio } = await operador.storage.from(BUCKET).upload(caminho, PNG, { contentType: "image/png" });
    expect(erroEnvio).toBeNull();
    caminhosCriados.push(caminho);

    const anonimo = clienteAnonimo();
    const { data: lista } = await anonimo.storage.from(BUCKET).list();
    const { data: baixado, error: erroDownload } = await anonimo.storage.from(BUCKET).download(caminho);
    expect(lista ?? []).toHaveLength(0);
    expect(baixado).toBeNull();
    expect(erroDownload).not.toBeNull();

    const resposta = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${caminho}`);
    expect(resposta.ok).toBe(false);
  });

  it("não escreve em alunos nem em restrições de alunos", async () => {
    const anonimo = clienteAnonimo();
    const { error: erroAluno } = await anonimo.from("alunos").insert({ nome: "Visitante" });
    const { error: erroVinculo } = await anonimo
      .from("alunos_restricoes")
      .insert({ aluno_id: crypto.randomUUID(), tipo_restricao_id: tipoId });
    expect(erroAluno).not.toBeNull();
    expect(erroVinculo).not.toBeNull();
  });
});

describe("perfil consulta", () => {
  it("lê alunos e as restrições de cada um", async () => {
    const { data: alunos } = await consulta.from("alunos").select("id, nome");
    const { data: vinculos } = await consulta.from("alunos_restricoes").select("aluno_id, nivel");
    expect(alunos!.length).toBeGreaterThanOrEqual(4);
    expect(vinculos!.some((v) => v.nivel === "grave")).toBe(true);
  });

  it("não cadastra aluno", async () => {
    const { error } = await consulta.from("alunos").insert({ nome: "Teste consulta" });
    expect(error).not.toBeNull();
  });

  it("não altera nem exclui aluno", async () => {
    const { data: aluno } = await consulta.from("alunos").select("id, nome").limit(1).single();
    const { data: alterados } = await consulta.from("alunos").update({ nome: "Alterado" }).eq("id", aluno!.id).select();
    const { data: excluidos } = await consulta.from("alunos").delete().eq("id", aluno!.id).select();
    expect(alterados ?? []).toHaveLength(0);
    expect(excluidos ?? []).toHaveLength(0);
    const { data: depois } = await consulta.from("alunos").select("nome").eq("id", aluno!.id).single();
    expect(depois!.nome).toBe(aluno!.nome);
  });

  it("não altera, insere nem exclui restrições de alunos", async () => {
    const { data: vinculo } = await consulta.from("alunos_restricoes").select("aluno_id, tipo_restricao_id, nivel").limit(1).single();
    const { error: erroInsercao } = await consulta
      .from("alunos_restricoes")
      .insert({ aluno_id: vinculo!.aluno_id, tipo_restricao_id: crypto.randomUUID() });
    const { data: alterados } = await consulta
      .from("alunos_restricoes")
      .update({ nivel: vinculo!.nivel === "grave" ? "leve" : "grave" })
      .eq("aluno_id", vinculo!.aluno_id)
      .eq("tipo_restricao_id", vinculo!.tipo_restricao_id)
      .select();
    const { data: excluidos } = await consulta
      .from("alunos_restricoes")
      .delete()
      .eq("aluno_id", vinculo!.aluno_id)
      .eq("tipo_restricao_id", vinculo!.tipo_restricao_id)
      .select();
    expect(erroInsercao).not.toBeNull();
    expect(alterados ?? []).toHaveLength(0);
    expect(excluidos ?? []).toHaveLength(0);
  });

  it("não envia nem exclui foto", async () => {
    const caminho = `${crypto.randomUUID()}.png`;
    const { error } = await consulta.storage.from(BUCKET).upload(caminho, PNG, { contentType: "image/png" });
    expect(error).not.toBeNull();

    const existente = `${crypto.randomUUID()}.png`;
    await operador.storage.from(BUCKET).upload(existente, PNG, { contentType: "image/png" });
    caminhosCriados.push(existente);
    await consulta.storage.from(BUCKET).remove([existente]);
    const { data: baixada } = await operador.storage.from(BUCKET).download(existente);
    expect(baixada).not.toBeNull();
  });
});

describe("perfil operador", () => {
  it("cadastra aluno com restrição grave", async () => {
    const { data: aluno, error } = await operador
      .from("alunos")
      .insert({ nome: "Aluno Teste RLS", turma: "Teste", autorizacao_responsaveis: true })
      .select("id")
      .single();
    expect(error).toBeNull();
    alunoId = aluno!.id;
    const { error: erroVinculo } = await operador
      .from("alunos_restricoes")
      .insert({ aluno_id: alunoId, tipo_restricao_id: tipoId, nivel: "grave" });
    expect(erroVinculo).toBeNull();
  });

  it("não cria o mesmo vínculo duas vezes", async () => {
    const { error } = await operador.from("alunos_restricoes").insert({ aluno_id: alunoId, tipo_restricao_id: tipoId });
    expect(error).not.toBeNull();
  });

  it("rejeita nível desconhecido", async () => {
    const { error } = await operador.from("alunos_restricoes").update({ nivel: "altissimo" }).eq("aluno_id", alunoId);
    expect(error).not.toBeNull();
  });

  it("rejeita nome vazio", async () => {
    const { error } = await operador.from("alunos").insert({ nome: "   " });
    expect(error).not.toBeNull();
  });

  it("altera aluno e remove restrição", async () => {
    const { data: alterados } = await operador.from("alunos").update({ turma: "Turma nova" }).eq("id", alunoId).select();
    expect(alterados).toHaveLength(1);
    const { data: removidos } = await operador.from("alunos_restricoes").delete().eq("aluno_id", alunoId).select();
    expect(removidos).toHaveLength(1);
  });

  it("não exclui aluno (só o administrador)", async () => {
    const { data } = await operador.from("alunos").delete().eq("id", alunoId).select();
    expect(data ?? []).toHaveLength(0);
  });

  it("não cria nem altera o tipo de restrição de um aluno inexistente", async () => {
    const { error } = await operador
      .from("alunos_restricoes")
      .insert({ aluno_id: crypto.randomUUID(), tipo_restricao_id: tipoId });
    expect(error).not.toBeNull();
  });

  it("envia foto, e consulta só a vê por URL assinada", async () => {
    const caminho = `${crypto.randomUUID()}.png`;
    const { error } = await operador.storage.from(BUCKET).upload(caminho, PNG, { contentType: "image/png" });
    expect(error).toBeNull();
    caminhosCriados.push(caminho);

    const { data: assinada, error: erroAssinatura } = await consulta.storage.from(BUCKET).createSignedUrl(caminho, 60);
    expect(erroAssinatura).toBeNull();
    expect(assinada!.signedUrl).toContain("token=");

    const { data: anonima } = await clienteAnonimo().storage.from(BUCKET).createSignedUrl(caminho, 60);
    expect(anonima).toBeNull();
  });

  it("não envia foto com nome fora do padrão (pasta, '..' ou nome livre)", async () => {
    for (const nome of ["pasta/" + crypto.randomUUID() + ".png", "../" + crypto.randomUUID() + ".png", "foto-livre.png"]) {
      const { error } = await operador.storage.from(BUCKET).upload(nome, PNG, { contentType: "image/png" });
      expect(error, nome).not.toBeNull();
    }
  });

  it("não envia foto maior que 2 MB", async () => {
    const caminho = `${crypto.randomUUID()}.png`;
    const grande = new Uint8Array(3 * 1024 * 1024);
    const { error } = await operador.storage.from(BUCKET).upload(caminho, grande, { contentType: "image/png" });
    expect(error).not.toBeNull();
  });

  it("só aceita foto_caminho no formato <uuid>.<ext>", async () => {
    for (const caminho of ["../outra.png", "pasta/" + crypto.randomUUID() + ".png", "foto.png", ""]) {
      const { error } = await operador.from("alunos").update({ foto_caminho: caminho }).eq("id", alunoId);
      expect(error, caminho).not.toBeNull();
    }
    const valido = `${crypto.randomUUID()}.webp`;
    const { error } = await operador.from("alunos").update({ foto_caminho: valido }).eq("id", alunoId);
    expect(error).toBeNull();
  });

  it("não envia arquivo que não seja imagem", async () => {
    const caminho = `${crypto.randomUUID()}.txt`;
    const { error } = await operador.storage.from(BUCKET).upload(caminho, new Blob(["texto"]), { contentType: "text/plain" });
    expect(error).not.toBeNull();
  });
});

describe("usuário desativado", () => {
  it("perde a leitura de alunos, restrições e fotos", async () => {
    const { data: perfil } = await admin.from("perfis").select("id").eq("email", "consulta@colegio.local").single();
    const caminho = `${crypto.randomUUID()}.png`;
    await operador.storage.from(BUCKET).upload(caminho, PNG, { contentType: "image/png" });
    caminhosCriados.push(caminho);

    await admin.from("perfis").update({ ativo: false }).eq("id", perfil!.id);
    try {
      const { data: alunos } = await consulta.from("alunos").select("id");
      const { data: vinculos } = await consulta.from("alunos_restricoes").select("aluno_id");
      const { data: foto } = await consulta.storage.from(BUCKET).download(caminho);
      expect(alunos ?? []).toHaveLength(0);
      expect(vinculos ?? []).toHaveLength(0);
      expect(foto).toBeNull();
    } finally {
      await admin.from("perfis").update({ ativo: true }).eq("id", perfil!.id);
    }
  });
});

describe("perfil administrador", () => {
  it("exclui aluno e as restrições vão junto", async () => {
    const { data: aluno } = await admin.from("alunos").insert({ nome: "Aluno Excluir RLS" }).select("id").single();
    await admin.from("alunos_restricoes").insert({ aluno_id: aluno!.id, tipo_restricao_id: tipoId });
    const { data: excluidos } = await admin.from("alunos").delete().eq("id", aluno!.id).select();
    expect(excluidos).toHaveLength(1);
    const { data: restantes } = await admin.from("alunos_restricoes").select("aluno_id").eq("aluno_id", aluno!.id);
    expect(restantes ?? []).toHaveLength(0);
  });
});
