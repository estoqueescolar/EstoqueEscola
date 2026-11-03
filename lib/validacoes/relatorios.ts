import { z } from "zod";
import { diferencaEmDias } from "@/lib/regras/datas";
import { TIPOS_RELATORIO } from "@/lib/regras/relatorios";
import { esquemaData } from "./cardapio";

export const PERIODO_MAXIMO_DIAS = 366;

// Parâmetros da rota de relatórios (tipo vem do caminho; o resto da URL).
export const esquemaPedidoRelatorio = z
  .object({
    tipo: z.enum(TIPOS_RELATORIO, "Relatório desconhecido."),
    formato: z.enum(["pdf", "xlsx"], "Escolha PDF ou Excel."),
    inicio: esquemaData,
    fim: esquemaData,
  })
  .refine((p) => p.inicio <= p.fim, { message: "A data inicial deve ser antes da final.", path: ["fim"] })
  .refine((p) => diferencaEmDias(p.inicio, p.fim) <= PERIODO_MAXIMO_DIAS, { message: "Escolha um período de até 1 ano.", path: ["fim"] });
