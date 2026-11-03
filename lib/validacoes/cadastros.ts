import { z } from "zod";
import { idObrigatorio, idOpcional, quantidade, textoObrigatorio, textoOpcional } from "./comum";

export const esquemaCategoria = z.object({ nome: textoObrigatorio("o nome da categoria", 60) });

export const esquemaFornecedor = z.object({
  nome: textoObrigatorio("o nome do fornecedor", 120),
  telefone: textoOpcional(30).refine((t) => !t || /^[\d\s()+\-]{8,30}$/.test(t), "Telefone inválido. Exemplo: (11) 98888-1004."),
  observacao: textoOpcional(500),
});

export const esquemaLocal = z.object({
  nome: textoObrigatorio("o nome do local", 60),
  descricao: textoOpcional(200),
});

export const esquemaUnidade = z.object({
  sigla: textoObrigatorio("a sigla", 15),
  nome: textoObrigatorio("o nome da unidade", 60),
});

export const esquemaTipoRestricao = z.object({
  nome: textoObrigatorio("o nome da restrição", 80),
  descricao: textoOpcional(300),
});

export const esquemaProduto = z.object({
  nome: textoObrigatorio("o nome do produto", 120),
  categoria_id: idObrigatorio("a categoria"),
  unidade_id: idObrigatorio("a unidade de medida"),
  local_padrao_id: idObrigatorio("o local de armazenamento"),
  fornecedor_id: idOpcional,
  estoque_minimo: quantidade("o estoque mínimo", { permitirZero: true }),
  ativo: z.boolean().default(true),
});

// Cadastros auxiliares: o mesmo componente de tela atende todos.
export const TIPOS_CADASTRO = ["categorias", "fornecedores", "locais", "unidades", "restricoes"] as const;
export type TipoCadastro = (typeof TIPOS_CADASTRO)[number];

export const ESQUEMAS_CADASTRO = {
  categorias: esquemaCategoria,
  fornecedores: esquemaFornecedor,
  locais: esquemaLocal,
  unidades: esquemaUnidade,
  restricoes: esquemaTipoRestricao,
} as const;

// Nome da tabela no banco para cada tipo de cadastro.
export const TABELAS_CADASTRO = {
  categorias: "categorias",
  fornecedores: "fornecedores",
  locais: "locais_armazenamento",
  unidades: "unidades",
  restricoes: "tipos_restricao",
} as const satisfies Record<TipoCadastro, string>;

export type DadosProduto = z.input<typeof esquemaProduto>;
