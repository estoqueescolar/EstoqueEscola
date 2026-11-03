import { z } from "zod";

export const DIAS_ALERTA_MAXIMO = 60;

export const esquemaConfiguracoes = z.object({
  dias_alerta_validade: z.coerce
    .number("Informe um número de dias.")
    .int("Use um número inteiro de dias.")
    .min(1, "Use pelo menos 1 dia.")
    .max(DIAS_ALERTA_MAXIMO, `Use no máximo ${DIAS_ALERTA_MAXIMO} dias.`),
});

export type DadosConfiguracoes = z.input<typeof esquemaConfiguracoes>;
