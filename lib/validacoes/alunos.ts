import { z } from "zod";
import { textoObrigatorio, textoOpcional } from "./comum";

const restricaoDoAluno = z.object({
  tipo_restricao_id: z.uuid("Escolha uma restrição válida."),
  nivel: z.enum(["leve", "media", "grave"], { message: "Escolha o nível: leve, média ou grave." }).default("leve"),
});

export const esquemaAluno = z.object({
  nome: textoObrigatorio("o nome do aluno", 120),
  turma: textoOpcional(40),
  observacao: textoOpcional(500),
  autorizacao_responsaveis: z.boolean().default(false),
  restricoes: z
    .array(restricaoDoAluno)
    .min(1, "Escolha ao menos uma restrição.")
    .max(20, "No máximo 20 restrições por aluno.")
    .refine((lista) => new Set(lista.map((r) => r.tipo_restricao_id)).size === lista.length, "Há restrição repetida."),
});

export type DadosAluno = z.input<typeof esquemaAluno>;

// Nome do arquivo no bucket privado: "<uuid>.<ext>". undefined mantém a foto atual; null remove.
export const esquemaFotoCaminho = z
  .string()
  .regex(/^[0-9a-f-]{36}\.(jpg|png|webp)$/, "Foto inválida.")
  .nullable()
  .optional();
