import { z } from "zod";

// Texto obrigatório com limite, sem espaços sobrando.
export const textoObrigatorio = (rotulo: string, max: number) =>
  z.string().trim().min(1, `Informe ${rotulo}.`).max(max, `${rotulo[0].toUpperCase()}${rotulo.slice(1)}: no máximo ${max} caracteres.`);

// Texto opcional: string vazia vira null.
export const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `No máximo ${max} caracteres.`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

export const idObrigatorio = (rotulo: string) => z.uuid(`Escolha ${rotulo}.`);
export const idOpcional = z
  .union([z.uuid(), z.literal("")])
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

// "1.234,5" → 1234.5 | "2,5" → 2.5 | "2.5" → 2.5 (com vírgula, o ponto é separador de milhar)
export function lerNumero(texto: string): number {
  const limpo = texto.trim();
  if (limpo === "") return Number.NaN;
  return Number(limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo);
}

// Quantidade digitada como texto ("2,5" ou "2.5"), com até 3 casas decimais.
export const quantidade = (rotulo: string, { permitirZero = false } = {}) =>
  z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : lerNumero(v)))
    .pipe(
      z
        .number(`Informe ${rotulo} usando só números, por exemplo 2,5.`)
        .refine((n) => Number.isFinite(n), `Informe ${rotulo} usando só números, por exemplo 2,5.`)
        .refine((n) => (permitirZero ? n >= 0 : n > 0), permitirZero ? `${rotulo[0].toUpperCase()}${rotulo.slice(1)} não pode ser negativo.` : `Informe ${rotulo} maior que zero.`)
        .refine((n) => Math.round(n * 1000) / 1000 === n, "Use no máximo 3 casas decimais.")
        .refine((n) => n < 1_000_000_000, "Valor muito grande. Confira o número digitado."),
    );
