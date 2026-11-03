export interface LoteEstoque {
  id: string;
  codigo: string;
  quantidade: number;
  data_entrada: string;
  data_validade: string;
}

export interface ProdutoEstoque {
  id: string;
  nome: string;
  estoque_minimo: number;
  sigla_unidade: string;
  fornecedor?: { nome: string; telefone: string | null } | null;
}

export type Resultado = { ok: true } | { ok: false; mensagem: string };
