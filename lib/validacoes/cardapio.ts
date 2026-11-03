import { z } from "zod";
import { ehDataValida, type TipoRefeicao } from "@/lib/regras/cardapio";
import { textoOpcional } from "./comum";

// Data real entre 2020 e 2100 (evita anos absurdos digitados ou forjados na URL).
export const esquemaData = z
  .string()
  .refine(ehDataValida, "Data inválida.")
  .refine((d) => d >= "2020-01-01" && d <= "2100-12-31", "Use uma data entre 2020 e 2100.");

// Um dia do cardápio: as 4 refeições (mesmos tipos de REFEICOES); refeição em branco é apagada.
export const esquemaDiaCardapio = z.object({
  data: esquemaData,
  cafe_da_manha: textoOpcional(1000),
  lanche_da_manha: textoOpcional(1000),
  almoco: textoOpcional(1000),
  lanche_da_tarde: textoOpcional(1000),
}) satisfies z.ZodType<Record<TipoRefeicao | "data", unknown>>;

export type DadosDiaCardapio = z.input<typeof esquemaDiaCardapio>;

const quantidadeAlunos = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? v : v.trim() === "" ? 0 : Number(v.trim())))
  .pipe(
    z
      .number("Use só números inteiros.")
      .int("Use só números inteiros.")
      .min(0, "Não pode ser negativo.")
      .max(2000, "No máximo 2000 alunos."),
  );

// Contagem do dia: quantos alunos com cada restrição (nunca nomes).
export const esquemaContagens = z.object({
  data: esquemaData,
  contagens: z.array(z.object({ tipo_restricao_id: z.uuid(), quantidade_alunos: quantidadeAlunos })).max(50),
});

export type DadosContagens = z.input<typeof esquemaContagens>;
