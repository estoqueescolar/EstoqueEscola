import type { Resultado } from "./tipos";

export interface RestricaoDoAluno {
  tipo_restricao_id: string;
  nome: string;
  grave: boolean;
}

export interface AlunoComRestricoes {
  id: string;
  nome: string;
  turma: string | null;
  foto_caminho: string | null;
  observacao: string | null;
  restricoes: RestricaoDoAluno[];
}

export interface GrupoRestricao {
  tipo_restricao_id: string;
  nome: string;
  alunos: AlunoComRestricoes[];
}

export interface FiltroAlunos {
  busca?: string;
  tipoId?: string;
  apenasGraves?: boolean;
}

const comparar = (a: string, b: string) => a.localeCompare(b, "pt-BR");

// Minúsculas e sem acento, para a busca achar "joao" em "João".
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Grave primeiro (a cozinha precisa ver essa antes), depois por nome.
export function ordenarRestricoes(restricoes: readonly RestricaoDoAluno[]): RestricaoDoAluno[] {
  return [...restricoes].sort((a, b) => Number(b.grave) - Number(a.grave) || comparar(a.nome, b.nome));
}

export function temRestricaoGrave(aluno: Pick<AlunoComRestricoes, "restricoes">): boolean {
  return aluno.restricoes.some((r) => r.grave);
}

// Texto corrido das restrições: leitores de tela e impressão não dependem de cor.
export function resumoRestricoes(aluno: Pick<AlunoComRestricoes, "restricoes">): string {
  const nomes = ordenarRestricoes(aluno.restricoes).map((r) => (r.grave ? `${r.nome} (grave)` : r.nome));
  if (nomes.length === 0) return "Sem restrição cadastrada";
  if (nomes.length === 1) return nomes[0];
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

export function filtrarAlunos(alunos: readonly AlunoComRestricoes[], filtro: FiltroAlunos): AlunoComRestricoes[] {
  const busca = normalizar(filtro.busca ?? "");
  return alunos.filter((a) => {
    if (busca && !normalizar(`${a.nome} ${a.turma ?? ""}`).includes(busca)) return false;
    if (filtro.tipoId && !a.restricoes.some((r) => r.tipo_restricao_id === filtro.tipoId)) return false;
    if (filtro.apenasGraves && !temRestricaoGrave(a)) return false;
    return true;
  });
}

// Visão da cozinha: cada restrição com os alunos que a têm. Quem tem reação grave vem primeiro.
export function agruparPorRestricao(alunos: readonly AlunoComRestricoes[]): GrupoRestricao[] {
  const grupos = new Map<string, { grupo: GrupoRestricao; graves: Set<string> }>();
  for (const aluno of alunos) {
    for (const r of aluno.restricoes) {
      const atual = grupos.get(r.tipo_restricao_id) ?? {
        grupo: { tipo_restricao_id: r.tipo_restricao_id, nome: r.nome, alunos: [] },
        graves: new Set<string>(),
      };
      atual.grupo.alunos.push(aluno);
      if (r.grave) atual.graves.add(aluno.id);
      grupos.set(r.tipo_restricao_id, atual);
    }
  }
  return [...grupos.values()]
    .map(({ grupo, graves }) => ({
      ...grupo,
      alunos: [...grupo.alunos].sort((a, b) => Number(graves.has(b.id)) - Number(graves.has(a.id)) || comparar(a.nome, b.nome)),
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
