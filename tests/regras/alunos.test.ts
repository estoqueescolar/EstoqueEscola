import { describe, expect, it } from "vitest";
import {
  agruparPorRestricao,
  filtrarAlunos,
  FOTO_TAMANHO_MAXIMO,
  iniciaisDoNome,
  nivelMaisAlto,
  nomeArquivoFoto,
  ordenarRestricoes,
  resumoRestricoes,
  temRestricaoGrave,
  validarFotoAluno,
  type AlunoComRestricoes,
} from "@/lib/regras/alunos";
import { esquemaAluno } from "@/lib/validacoes/alunos";

const ID_A = "6f1e1c8e-6b3a-4c2b-9a54-2a8c7d1e0f11";
const ID_B = "7a2f2d9f-7c4b-4d3c-8b65-3b9d8e2f1a22";

const lactose = { tipo_restricao_id: ID_A, nome: "Intolerância à lactose", nivel: "leve" as const };
const amendoim = { tipo_restricao_id: ID_B, nome: "Alergia a amendoim", nivel: "grave" as const };

function aluno(nome: string, restricoes: AlunoComRestricoes["restricoes"], turma: string | null = null): AlunoComRestricoes {
  return { id: nome, nome, turma, foto_caminho: null, observacao: null, restricoes };
}

const ana = aluno("Ana Beatriz Souza", [lactose], "3º ano A");
const joao = aluno("João Pedro Lima", [amendoim, lactose], "2º ano B");
const maria = aluno("Maria Clara Santos", [amendoim]);

describe("níveis", () => {
  const media = { tipo_restricao_id: "c", nome: "Diabetes", nivel: "media" as const };
  it("ordena do mais grave ao mais leve", () => {
    expect(ordenarRestricoes([lactose, media, amendoim]).map((r) => r.nivel)).toEqual(["grave", "media", "leve"]);
  });
  it("informa o nível mais alto do aluno", () => {
    expect(nivelMaisAlto(joao)).toBe("grave");
    expect(nivelMaisAlto(aluno("X", [lactose, media]))).toBe("media");
    expect(nivelMaisAlto(aluno("Y", []))).toBeNull();
  });
});

describe("ordenarRestricoes", () => {
  it("coloca a grave primeiro e ordena o resto pelo nome", () => {
    expect(ordenarRestricoes([lactose, amendoim]).map((r) => r.nome)).toEqual(["Alergia a amendoim", "Intolerância à lactose"]);
  });

  it("não altera a lista original", () => {
    const original = [lactose, amendoim];
    ordenarRestricoes(original);
    expect(original[0]).toBe(lactose);
  });
});

describe("temRestricaoGrave e resumoRestricoes", () => {
  it("detecta restrição grave", () => {
    expect(temRestricaoGrave(joao)).toBe(true);
    expect(temRestricaoGrave(ana)).toBe(false);
  });

  it("descreve as restrições em texto, com a grave marcada", () => {
    expect(resumoRestricoes(joao)).toBe("Alergia a amendoim (grave) e Intolerância à lactose (leve)");
    expect(resumoRestricoes(ana)).toBe("Intolerância à lactose (leve)");
    expect(resumoRestricoes(aluno("Sem restrição", []))).toBe("Sem restrição cadastrada");
  });
});

describe("filtrarAlunos", () => {
  const todos = [ana, joao, maria];

  it("sem filtro devolve todos", () => {
    expect(filtrarAlunos(todos, {})).toHaveLength(3);
  });

  it("busca por nome ignorando acento e maiúsculas", () => {
    expect(filtrarAlunos(todos, { busca: "joao" }).map((a) => a.nome)).toEqual(["João Pedro Lima"]);
    expect(filtrarAlunos(todos, { busca: "  CLARA " }).map((a) => a.nome)).toEqual(["Maria Clara Santos"]);
  });

  it("busca também pela turma", () => {
    expect(filtrarAlunos(todos, { busca: "3º ano" }).map((a) => a.nome)).toEqual(["Ana Beatriz Souza"]);
  });

  it("filtra por tipo de restrição", () => {
    expect(filtrarAlunos(todos, { tipoId: ID_B }).map((a) => a.nome)).toEqual(["João Pedro Lima", "Maria Clara Santos"]);
  });

  it("filtra só os graves", () => {
    expect(filtrarAlunos(todos, { apenasGraves: true }).map((a) => a.nome)).toEqual(["João Pedro Lima", "Maria Clara Santos"]);
  });

  it("combina os filtros", () => {
    expect(filtrarAlunos(todos, { tipoId: ID_A, busca: "ana" }).map((a) => a.nome)).toEqual(["Ana Beatriz Souza"]);
    expect(filtrarAlunos(todos, { tipoId: ID_A, busca: "maria" })).toEqual([]);
  });
});

describe("agruparPorRestricao", () => {
  it("lista cada restrição com os alunos que a têm, graves primeiro e depois por nome", () => {
    const grupos = agruparPorRestricao([ana, joao, maria]);
    expect(grupos.map((g) => g.nome)).toEqual(["Alergia a amendoim", "Intolerância à lactose"]);
    expect(grupos[0].alunos.map((a) => a.aluno.nome)).toEqual(["João Pedro Lima", "Maria Clara Santos"]);
    expect(grupos[1].alunos.map((a) => a.aluno.nome)).toEqual(["Ana Beatriz Souza", "João Pedro Lima"]);
  });

  it("um aluno com duas restrições aparece nos dois grupos", () => {
    const grupos = agruparPorRestricao([joao]);
    expect(grupos).toHaveLength(2);
  });

  it("lista vazia gera nenhum grupo", () => {
    expect(agruparPorRestricao([])).toEqual([]);
  });
});

describe("iniciaisDoNome", () => {
  it.each([
    ["Ana Beatriz Souza", "AS"],
    ["João", "J"],
    ["  maria  clara ", "MC"],
    ["", "?"],
  ])("%s → %s", (nome, esperado) => {
    expect(iniciaisDoNome(nome)).toBe(esperado);
  });
});

describe("foto do aluno", () => {
  it("aceita JPEG, PNG e WebP até 2 MB", () => {
    expect(validarFotoAluno({ type: "image/jpeg", size: 1000 })).toEqual({ ok: true });
    expect(validarFotoAluno({ type: "image/png", size: FOTO_TAMANHO_MAXIMO })).toEqual({ ok: true });
    expect(validarFotoAluno({ type: "image/webp", size: 1 })).toEqual({ ok: true });
  });

  it("recusa outro tipo de arquivo, arquivo vazio e arquivo grande", () => {
    expect(validarFotoAluno({ type: "application/pdf", size: 1000 }).ok).toBe(false);
    expect(validarFotoAluno({ type: "image/gif", size: 1000 }).ok).toBe(false);
    expect(validarFotoAluno({ type: "image/png", size: 0 }).ok).toBe(false);
    expect(validarFotoAluno({ type: "image/png", size: FOTO_TAMANHO_MAXIMO + 1 }).ok).toBe(false);
  });

  it("monta o nome do arquivo no formato exigido pelo banco", () => {
    expect(nomeArquivoFoto(ID_A, "image/jpeg")).toBe(`${ID_A}.jpg`);
    expect(nomeArquivoFoto(ID_A, "image/png")).toBe(`${ID_A}.png`);
    expect(nomeArquivoFoto(ID_A, "image/webp")).toBe(`${ID_A}.webp`);
    expect(nomeArquivoFoto(ID_A, "image/jpeg")).toMatch(/^[0-9a-f-]{36}\.(jpg|png|webp)$/);
  });
});

describe("esquemaAluno", () => {
  const base = { nome: "  Ana Beatriz  ", restricoes: [{ tipo_restricao_id: ID_A, nivel: "leve" as const }] };

  it("aceita o mínimo e limpa os textos", () => {
    const r = esquemaAluno.parse({ ...base, turma: "", observacao: "  " });
    expect(r.nome).toBe("Ana Beatriz");
    expect(r.turma).toBeNull();
    expect(r.observacao).toBeNull();
    expect(r.autorizacao_responsaveis).toBe(false);
  });

  it("exige o nome", () => {
    expect(esquemaAluno.safeParse({ ...base, nome: "   " }).success).toBe(false);
  });

  it("exige ao menos uma restrição", () => {
    const r = esquemaAluno.safeParse({ ...base, restricoes: [] });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Escolha ao menos uma restrição.");
  });

  it("recusa restrição repetida e id inválido", () => {
    const repetida = [
      { tipo_restricao_id: ID_A, nivel: "leve" as const },
      { tipo_restricao_id: ID_A, nivel: "grave" as const },
    ];
    expect(esquemaAluno.safeParse({ ...base, restricoes: repetida }).success).toBe(false);
    expect(esquemaAluno.safeParse({ ...base, restricoes: [{ tipo_restricao_id: "abc", nivel: "leve" as const }] }).success).toBe(false);
  });

  it("limita tamanhos", () => {
    expect(esquemaAluno.safeParse({ ...base, nome: "a".repeat(121) }).success).toBe(false);
    expect(esquemaAluno.safeParse({ ...base, turma: "a".repeat(41) }).success).toBe(false);
    expect(esquemaAluno.safeParse({ ...base, observacao: "a".repeat(501) }).success).toBe(false);
  });

  it("assume nível leve quando não informado e recusa nível desconhecido", () => {
    const r = esquemaAluno.parse({ ...base, restricoes: [{ tipo_restricao_id: ID_A }] });
    expect(r.restricoes[0].nivel).toBe("leve");
    expect(esquemaAluno.safeParse({ ...base, restricoes: [{ tipo_restricao_id: ID_A, nivel: "altissimo" }] }).success).toBe(false);
  });
});
