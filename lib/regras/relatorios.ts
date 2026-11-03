// Montagem das linhas dos relatórios (puras: recebem dados já lidos e devolvem linhas + resumo).
import { arredondar, formatarQuantidade } from "./quantidades";
import type { ItemListaCompras } from "./compras";

export const TIPOS_RELATORIO = ["consumo", "perdas", "compras"] as const;
export type TipoRelatorio = (typeof TIPOS_RELATORIO)[number];

export interface Coluna {
  chave: string;
  titulo: string;
  tipo: "texto" | "numero" | "data";
}

export type Linha = Record<string, string | number | null>;

export interface ConteudoRelatorio {
  titulo: string;
  nomeAba: string;
  colunas: Coluna[];
  linhas: Linha[];
  resumo: { rotulo: string; valor: string }[];
}

export const TITULOS_RELATORIO: Record<TipoRelatorio, string> = {
  consumo: "Consumo por período",
  perdas: "Vencidos e perdas",
  compras: "Lista de compras",
};

// --- Consumo -----------------------------------------------------------------

export interface SaidaParaRelatorio {
  produto_id: string;
  produto: string;
  categoria: string;
  sigla: string;
  quantidade: number;
  operacao_id: string;
}

// Saídas agrupadas por categoria → produto; uma saída FEFO que usou vários lotes conta como uma saída.
export function montarConsumo(saidas: readonly SaidaParaRelatorio[]): ConteudoRelatorio {
  const porProduto = new Map<string, { categoria: string; produto: string; sigla: string; quantidade: number; operacoes: Set<string> }>();
  for (const s of saidas) {
    const atual = porProduto.get(s.produto_id) ?? { categoria: s.categoria, produto: s.produto, sigla: s.sigla, quantidade: 0, operacoes: new Set<string>() };
    atual.quantidade = arredondar(atual.quantidade + s.quantidade);
    atual.operacoes.add(s.operacao_id);
    porProduto.set(s.produto_id, atual);
  }
  const linhas = [...porProduto.values()]
    .sort((a, b) => a.categoria.localeCompare(b.categoria, "pt-BR") || a.produto.localeCompare(b.produto, "pt-BR"))
    .map((p) => ({ categoria: p.categoria, produto: p.produto, unidade: p.sigla, quantidade: p.quantidade, saidas: p.operacoes.size }));

  const porCategoria = new Map<string, number>();
  for (const l of linhas) porCategoria.set(l.categoria, (porCategoria.get(l.categoria) ?? 0) + l.saidas);
  const totalSaidas = new Set(saidas.map((s) => s.operacao_id)).size;

  return {
    titulo: TITULOS_RELATORIO.consumo,
    nomeAba: "Consumo",
    colunas: [
      { chave: "categoria", titulo: "Categoria", tipo: "texto" },
      { chave: "produto", titulo: "Produto", tipo: "texto" },
      { chave: "unidade", titulo: "Unidade", tipo: "texto" },
      { chave: "quantidade", titulo: "Quantidade consumida", tipo: "numero" },
      { chave: "saidas", titulo: "Nº de saídas", tipo: "numero" },
    ],
    linhas,
    resumo: [
      ...[...porCategoria.entries()].map(([categoria, n]) => ({ rotulo: categoria, valor: `${n} ${n === 1 ? "saída" : "saídas"}` })),
      { rotulo: "Total de saídas", valor: String(totalSaidas) },
      { rotulo: "Produtos consumidos", valor: String(linhas.length) },
    ],
  };
}

// --- Vencidos e perdas -------------------------------------------------------

export interface LoteVencidoParaRelatorio {
  data_validade: string;
  produto: string;
  lote: string;
  quantidade: number;
  sigla: string;
}

export interface BaixaParaRelatorio {
  data: string; // AAAA-MM-DD
  tipo: "perda" | "ajuste";
  produto: string;
  lote: string;
  quantidade: number;
  sigla: string;
  motivo: string | null;
  responsavel: string | null;
}

const NOMES_TIPO = { vencido: "Vencido em estoque", perda: "Perda", ajuste: "Ajuste negativo" } as const;

export function montarPerdas(vencidos: readonly LoteVencidoParaRelatorio[], baixas: readonly BaixaParaRelatorio[]): ConteudoRelatorio {
  const linhas: Linha[] = [
    ...vencidos.map((l) => ({
      data: l.data_validade, produto: l.produto, lote: l.lote, tipo: NOMES_TIPO.vencido,
      quantidade: l.quantidade, unidade: l.sigla, motivo: "Venceu e ainda está no estoque", usuario: null,
    })),
    ...baixas.map((b) => ({
      data: b.data, produto: b.produto, lote: b.lote, tipo: NOMES_TIPO[b.tipo],
      quantidade: b.quantidade, unidade: b.sigla, motivo: b.motivo, usuario: b.responsavel,
    })),
  ].sort((a, b) => String(a.data).localeCompare(String(b.data)));

  const contar = (tipo: string) => linhas.filter((l) => l.tipo === tipo).length;
  return {
    titulo: TITULOS_RELATORIO.perdas,
    nomeAba: "Vencidos e perdas",
    colunas: [
      { chave: "data", titulo: "Data", tipo: "data" },
      { chave: "produto", titulo: "Produto", tipo: "texto" },
      { chave: "lote", titulo: "Lote", tipo: "texto" },
      { chave: "tipo", titulo: "Tipo", tipo: "texto" },
      { chave: "quantidade", titulo: "Quantidade", tipo: "numero" },
      { chave: "unidade", titulo: "Unidade", tipo: "texto" },
      { chave: "motivo", titulo: "Motivo", tipo: "texto" },
      { chave: "usuario", titulo: "Registrado por", tipo: "texto" },
    ],
    linhas,
    resumo: [
      { rotulo: "Total de itens", valor: String(linhas.length) },
      { rotulo: NOMES_TIPO.vencido, valor: String(contar(NOMES_TIPO.vencido)) },
      { rotulo: "Perdas", valor: String(contar(NOMES_TIPO.perda)) },
      { rotulo: "Ajustes negativos", valor: String(contar(NOMES_TIPO.ajuste)) },
    ],
  };
}

// --- Compras -----------------------------------------------------------------

export function montarCompras(itens: readonly (ItemListaCompras & { categoria: string })[]): ConteudoRelatorio {
  return {
    titulo: TITULOS_RELATORIO.compras,
    nomeAba: "Compras",
    colunas: [
      { chave: "produto", titulo: "Produto", tipo: "texto" },
      { chave: "categoria", titulo: "Categoria", tipo: "texto" },
      { chave: "estoque", titulo: "Estoque atual", tipo: "numero" },
      { chave: "minimo", titulo: "Mínimo", tipo: "numero" },
      { chave: "comprar", titulo: "Quantidade a comprar", tipo: "numero" },
      { chave: "unidade", titulo: "Unidade", tipo: "texto" },
      { chave: "fornecedor", titulo: "Fornecedor sugerido", tipo: "texto" },
      { chave: "telefone", titulo: "Telefone", tipo: "texto" },
    ],
    linhas: itens.map((i) => ({
      produto: i.nome, categoria: i.categoria, estoque: i.estoque_atual, minimo: i.estoque_minimo,
      comprar: i.quantidade_a_comprar, unidade: i.sigla_unidade, fornecedor: i.fornecedor, telefone: i.telefone_fornecedor,
    })),
    resumo: [{ rotulo: "Produtos a comprar", valor: String(itens.length) }],
  };
}

// Valor de célula para exibição (PDF): números com vírgula, datas dd/mm/aaaa, vazio como "—".
export function textoCelula(valor: Linha[string], tipo: Coluna["tipo"]): string {
  if (valor === null || valor === "") return "—";
  if (tipo === "numero") return formatarQuantidade(Number(valor));
  if (tipo === "data") {
    const [ano, mes, dia] = String(valor).split("-");
    return `${dia}/${mes}/${ano}`;
  }
  return String(valor);
}
