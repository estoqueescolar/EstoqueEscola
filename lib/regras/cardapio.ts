// Cardápio planejado e contagem de restrições alimentares (só números, sem identificar alunos).
// Datas são strings "AAAA-MM-DD", como nas outras regras.

export const REFEICOES = [
  { tipo: "cafe_da_manha", nome: "Café da manhã" },
  { tipo: "lanche_da_manha", nome: "Lanche da manhã" },
  { tipo: "almoco", nome: "Almoço" },
  { tipo: "lanche_da_tarde", nome: "Lanche da tarde" },
] as const;
export type TipoRefeicao = (typeof REFEICOES)[number]["tipo"];

const NOMES_DIA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const DIAS_LETIVOS = 5;

function paraUtc(data: string): Date {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia));
}

const paraTexto = (d: Date) => d.toISOString().slice(0, 10);

export function somarDias(data: string, dias: number): string {
  const d = paraUtc(data);
  d.setUTCDate(d.getUTCDate() + dias);
  return paraTexto(d);
}

export function nomeDoDia(data: string): string {
  return NOMES_DIA[paraUtc(data).getUTCDay()];
}

// Segunda-feira da semana da data (sábado e domingo levam à semana seguinte, que é a próxima a planejar).
export function inicioDaSemana(data: string): string {
  const diaSemana = paraUtc(data).getUTCDay();
  if (diaSemana === 0) return somarDias(data, 1);
  if (diaSemana === 6) return somarDias(data, 2);
  return somarDias(data, 1 - diaSemana);
}

// Dias letivos (segunda a sexta) a partir da segunda-feira informada.
export function diasDaSemana(segunda: string): string[] {
  return Array.from({ length: DIAS_LETIVOS }, (_, i) => somarDias(segunda, i));
}

export function ehDataValida(texto: unknown): texto is string {
  if (typeof texto !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  return paraTexto(paraUtc(texto)) === texto;
}

export interface ItemCardapio {
  data: string;
  tipo_refeicao: string;
  descricao: string;
}

export type SemanaCardapio = { data: string; refeicoes: Record<TipoRefeicao, string | null> }[];

// Monta a grade dia × refeição; refeição sem cadastro fica null.
export function montarSemana(itens: readonly ItemCardapio[], segunda: string): SemanaCardapio {
  return diasDaSemana(segunda).map((data) => ({
    data,
    refeicoes: Object.fromEntries(
      REFEICOES.map(({ tipo }) => [tipo, itens.find((i) => i.data === data && i.tipo_refeicao === tipo)?.descricao ?? null]),
    ) as Record<TipoRefeicao, string | null>,
  }));
}

// Quantas refeições do dia ainda não foram planejadas.
export function refeicoesPendentes(dia: SemanaCardapio[number]): number {
  return REFEICOES.filter(({ tipo }) => !dia.refeicoes[tipo]).length;
}

export interface Contagem {
  quantidade_alunos: number;
}

export function totalAlunos(contagens: readonly Contagem[]): number {
  return contagens.reduce((soma, c) => soma + c.quantidade_alunos, 0);
}
