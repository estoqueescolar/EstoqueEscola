import type { TipoCadastro } from "@/lib/validacoes/cadastros";

// Descrição das telas de cadastros auxiliares (usada no servidor e no cliente).
export interface CampoCadastro {
  nome: string;
  rotulo: string;
  tipo: "texto" | "telefone" | "textoLongo";
  obrigatorio?: boolean;
  ajuda?: string;
}

export interface ConfigCadastro {
  titulo: string;
  descricao: string;
  singular: string; // usado nos botões: "Salvar categoria"
  artigo: "o" | "a";
  campos: readonly CampoCadastro[];
  ordenarPor: string;
  principal: string; // coluna exibida em destaque
  secundarias: readonly string[];
}

export const CONFIG_CADASTROS: Record<TipoCadastro, ConfigCadastro> = {
  categorias: {
    titulo: "Categorias",
    descricao: "Grupos de alimentos e materiais, como grãos, laticínios e limpeza.",
    singular: "categoria",
    artigo: "a",
    campos: [{ nome: "nome", rotulo: "Nome", tipo: "texto", obrigatorio: true }],
    ordenarPor: "nome",
    principal: "nome",
    secundarias: [],
  },
  fornecedores: {
    titulo: "Fornecedores",
    descricao: "Quem entrega as mercadorias. Aparece como fornecedor sugerido na lista de compras.",
    singular: "fornecedor",
    artigo: "o",
    campos: [
      { nome: "nome", rotulo: "Nome", tipo: "texto", obrigatorio: true },
      { nome: "telefone", rotulo: "Telefone", tipo: "telefone", ajuda: "Exemplo: (11) 98888-1004" },
      { nome: "observacao", rotulo: "Observação", tipo: "textoLongo", ajuda: "Dia de entrega, pedido mínimo etc." },
    ],
    ordenarPor: "nome",
    principal: "nome",
    secundarias: ["telefone", "observacao"],
  },
  locais: {
    titulo: "Locais de armazenamento",
    descricao: "Onde os alimentos ficam guardados: dispensa, geladeira, freezer e outros.",
    singular: "local",
    artigo: "o",
    campos: [
      { nome: "nome", rotulo: "Nome", tipo: "texto", obrigatorio: true },
      { nome: "descricao", rotulo: "Descrição", tipo: "textoLongo", ajuda: "Exemplo: refrigerados entre 0 °C e 5 °C" },
    ],
    ordenarPor: "nome",
    principal: "nome",
    secundarias: ["descricao"],
  },
  unidades: {
    titulo: "Unidades de medida",
    descricao: "Como cada produto é contado: kg, litro, pacote, lata, dúzia e outras.",
    singular: "unidade",
    artigo: "a",
    campos: [
      { nome: "sigla", rotulo: "Sigla", tipo: "texto", obrigatorio: true, ajuda: "Curta, como kg, L, pct" },
      { nome: "nome", rotulo: "Nome", tipo: "texto", obrigatorio: true, ajuda: "Por extenso, como Quilograma" },
    ],
    ordenarPor: "sigla",
    principal: "nome",
    secundarias: ["sigla"],
  },
};
