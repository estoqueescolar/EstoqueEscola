import { z } from "zod";
import { idObrigatorio, idOpcional, quantidade, textoObrigatorio, textoOpcional } from "./comum";

const data = (rotulo: string) => z.iso.date(`Informe ${rotulo} no formato dd/mm/aaaa.`);

export const esquemaEntrada = z
  .object({
    produto_id: idObrigatorio("o produto"),
    quantidade: quantidade("a quantidade recebida"),
    data_entrada: data("a data de entrada"),
    data_validade: data("a data de validade"),
    codigo: textoOpcional(40),
    fornecedor_id: idOpcional,
    local_id: idOpcional,
    observacao: textoOpcional(500),
  })
  .refine((d) => d.data_validade > d.data_entrada, {
    path: ["data_validade"],
    message: "A validade deve ser depois da data de entrada. Confira a data na embalagem.",
  });

export const esquemaSaida = z.object({
  produto_id: idObrigatorio("o produto"),
  quantidade: quantidade("a quantidade usada"),
  observacao: textoOpcional(500),
});

export const esquemaPerda = z.object({
  lote_id: idObrigatorio("o lote"),
  quantidade: quantidade("a quantidade perdida"),
  motivo: textoObrigatorio("o motivo da perda", 300),
  observacao: textoOpcional(500),
});

export const esquemaAjuste = z.object({
  lote_id: idObrigatorio("o lote"),
  quantidade: quantidade("a quantidade do ajuste"),
  // aceita "1"/"-1" (formulário) e 1/-1 (valor já convertido pelo zodResolver no cliente)
  sentido: z.coerce
    .string()
    .pipe(z.enum(["1", "-1"], "Escolha se o ajuste aumenta ou diminui o estoque."))
    .transform(Number),
  motivo: textoObrigatorio("o motivo do ajuste", 300),
  observacao: textoOpcional(500),
});

export type DadosEntrada = z.input<typeof esquemaEntrada>;
export type DadosSaida = z.input<typeof esquemaSaida>;
export type DadosPerda = z.input<typeof esquemaPerda>;
export type DadosAjuste = z.input<typeof esquemaAjuste>;

export const MOTIVOS_PERDA = ["Vencido", "Estragado", "Embalagem danificada", "Contaminado", "Descartado"] as const;
