import "server-only";
import type { AlunoComRestricoes, NivelRestricao } from "@/lib/regras/alunos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const BUCKET_FOTOS = "fotos-alunos";
const VALIDADE_URL_FOTO_SEGUNDOS = 60 * 60;

export interface AlunoListado extends AlunoComRestricoes {
  autorizacao_responsaveis: boolean;
  fotoUrl: string | null;
}

const COLUNAS =
  "id, nome, turma, foto_caminho, observacao, autorizacao_responsaveis, alunos_restricoes(tipo_restricao_id, nivel, tipos_restricao(nome))";

type LinhaAluno = {
  id: string;
  nome: string;
  turma: string | null;
  foto_caminho: string | null;
  observacao: string | null;
  autorizacao_responsaveis: boolean;
  alunos_restricoes: { tipo_restricao_id: string; nivel: string; tipos_restricao: { nome: string } | null }[];
};

// As fotos ficam em bucket privado: cada tela recebe URLs assinadas e temporárias (1 hora).
async function montarAlunos(linhas: LinhaAluno[]): Promise<AlunoListado[]> {
  const supabase = await criarClienteServidor();
  const caminhos = linhas.flatMap((l) => (l.foto_caminho ? [l.foto_caminho] : []));
  const urls = new Map<string, string>();
  if (caminhos.length > 0) {
    const { data } = await supabase.storage.from(BUCKET_FOTOS).createSignedUrls(caminhos, VALIDADE_URL_FOTO_SEGUNDOS);
    for (const item of data ?? []) if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  }
  return linhas.map((l) => ({
    id: l.id,
    nome: l.nome,
    turma: l.turma,
    foto_caminho: l.foto_caminho,
    observacao: l.observacao,
    autorizacao_responsaveis: l.autorizacao_responsaveis,
    fotoUrl: l.foto_caminho ? (urls.get(l.foto_caminho) ?? null) : null,
    restricoes: l.alunos_restricoes.map((r) => ({
      tipo_restricao_id: r.tipo_restricao_id,
      nome: r.tipos_restricao?.nome ?? "Restrição",
      nivel: r.nivel as NivelRestricao,
    })),
  }));
}

export async function listarAlunos(): Promise<AlunoListado[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("alunos").select(COLUNAS).eq("ativo", true).order("nome");
  if (error) throw new Error("Não foi possível carregar os alunos.");
  return montarAlunos(data as LinhaAluno[]);
}

export async function obterAluno(id: string): Promise<AlunoListado | null> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("alunos").select(COLUNAS).eq("id", id).eq("ativo", true).maybeSingle();
  if (error) throw new Error("Não foi possível carregar o aluno.");
  if (!data) return null;
  const [aluno] = await montarAlunos([data as LinhaAluno]);
  return aluno;
}
