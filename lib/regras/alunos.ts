import type { Resultado } from "./tipos";

// Do mais leve ao mais grave. O peso ordena listas: o mais grave aparece primeiro.
export const NIVEIS_RESTRICAO = [
  { valor: "leve", texto: "Leve", ajuda: "Desconforto. Evitar o alimento." },
  { valor: "media", texto: "Média", ajuda: "Reação que exige atenção. Separar o prato." },
  { valor: "grave", texto: "Grave", ajuda: "Risco à saúde. Nenhum contato com o alimento." },
] as const;

export type NivelRestricao = (typeof NIVEIS_RESTRICAO)[number]["valor"];

const PESO: Record<NivelRestricao, number> = { leve: 1, media: 2, grave: 3 };

export const textoNivel = (nivel: NivelRestricao) => NIVEIS_RESTRICAO.find((n) => n.valor === nivel)!.texto;

export interface RestricaoDoAluno {
  tipo_restricao_id: string;
  nome: string;
  nivel: NivelRestricao;
}

export interface AlunoComRestricoes {
  id: string;
  nome: string;
  turma: string | null;
  foto_caminho: string | null;
  observacao: string | null;
  restricoes: RestricaoDoAluno[];
}

export interface AlunoNoGrupo<T extends AlunoComRestricoes> {
  aluno: T;
  // nível desta restrição para este aluno
  nivel: NivelRestricao;
}

export interface GrupoRestricao<T extends AlunoComRestricoes = AlunoComRestricoes> {
  tipo_restricao_id: string;
  nome: string;
  alunos: AlunoNoGrupo<T>[];
}

export interface FiltroAlunos {
  busca?: string;
  tipoId?: string;
  apenasGraves?: boolean;
}

const comparar = (a: string, b: string) => a.localeCompare(b, "pt-BR");

// Minúsculas e sem acento, para a busca achar "joao" em "João".
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Mais grave primeiro (a cozinha precisa ver essa antes), depois por nome.
export function ordenarRestricoes(restricoes: readonly RestricaoDoAluno[]): RestricaoDoAluno[] {
  return [...restricoes].sort((a, b) => PESO[b.nivel] - PESO[a.nivel] || comparar(a.nome, b.nome));
}

export function nivelMaisAlto(aluno: Pick<AlunoComRestricoes, "restricoes">): NivelRestricao | null {
  return ordenarRestricoes(aluno.restricoes)[0]?.nivel ?? null;
}

export function temRestricaoGrave(aluno: Pick<AlunoComRestricoes, "restricoes">): boolean {
  return aluno.restricoes.some((r) => r.nivel === "grave");
}

// Texto corrido das restrições: leitores de tela e impressão não dependem de cor.
export function resumoRestricoes(aluno: Pick<AlunoComRestricoes, "restricoes">): string {
  const nomes = ordenarRestricoes(aluno.restricoes).map((r) => `${r.nome} (${textoNivel(r.nivel).toLowerCase()})`);
  if (nomes.length === 0) return "Sem restrição cadastrada";
  if (nomes.length === 1) return nomes[0];
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

export function filtrarAlunos<T extends AlunoComRestricoes>(alunos: readonly T[], filtro: FiltroAlunos): T[] {
  const busca = normalizar(filtro.busca ?? "");
  return alunos.filter((a) => {
    if (busca && !normalizar(`${a.nome} ${a.turma ?? ""}`).includes(busca)) return false;
    if (filtro.tipoId && !a.restricoes.some((r) => r.tipo_restricao_id === filtro.tipoId)) return false;
    if (filtro.apenasGraves && !temRestricaoGrave(a)) return false;
    return true;
  });
}

// Visão "por alergia": cada restrição com os alunos que a têm. Mais grave primeiro, depois por nome.
export function agruparPorRestricao<T extends AlunoComRestricoes>(alunos: readonly T[]): GrupoRestricao<T>[] {
  const grupos = new Map<string, GrupoRestricao<T>>();
  for (const aluno of alunos) {
    for (const r of aluno.restricoes) {
      const grupo = grupos.get(r.tipo_restricao_id) ?? { tipo_restricao_id: r.tipo_restricao_id, nome: r.nome, alunos: [] };
      grupo.alunos.push({ aluno, nivel: r.nivel });
      grupos.set(r.tipo_restricao_id, grupo);
    }
  }
  return [...grupos.values()]
    .map((g) => ({
      ...g,
      alunos: [...g.alunos].sort((a, b) => PESO[b.nivel] - PESO[a.nivel] || comparar(a.aluno.nome, b.aluno.nome)),
    }))
    .sort((a, b) => comparar(a.nome, b.nome));
}

// Primeira e última palavra do nome; usado quando o aluno ainda não tem foto.
export function iniciaisDoNome(nome: string): string {
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return "?";
  const primeira = palavras[0][0];
  const ultima = palavras.length > 1 ? palavras[palavras.length - 1][0] : "";
  return `${primeira}${ultima}`.toLocaleUpperCase("pt-BR");
}

export const FOTO_TAMANHO_MAXIMO = 2 * 1024 * 1024;

const EXTENSAO_POR_TIPO = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type TipoFoto = keyof typeof EXTENSAO_POR_TIPO;

export const TIPOS_FOTO_ACEITOS = Object.keys(EXTENSAO_POR_TIPO) as TipoFoto[];

const ehTipoFoto = (tipo: string): tipo is TipoFoto => tipo in EXTENSAO_POR_TIPO;

export function validarFotoAluno(arquivo: { type: string; size: number }): Resultado {
  if (!ehTipoFoto(arquivo.type)) return { ok: false, mensagem: "Use uma foto em JPEG, PNG ou WebP." };
  if (arquivo.size <= 0) return { ok: false, mensagem: "O arquivo da foto está vazio." };
  if (arquivo.size > FOTO_TAMANHO_MAXIMO) return { ok: false, mensagem: "A foto é grande demais. O limite é 2 MB." };
  return { ok: true };
}

// Formato "<uuid>.<ext>" exigido pelo banco e pelas políticas do bucket.
export function nomeArquivoFoto(arquivoId: string, tipo: TipoFoto): string {
  return `${arquivoId}.${EXTENSAO_POR_TIPO[tipo]}`;
}
