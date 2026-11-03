import "server-only";
import { cache } from "react";
import { DIAS_ALERTA_VALIDADE_PADRAO } from "@/lib/regras/validade";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export interface Configuracoes {
  diasAlertaValidade: number;
  nomeColegio: string;
}

// Lê a tabela configuracoes (único lugar onde o prazo do alerta de validade é definido).
export const obterConfiguracoes = cache(async (): Promise<Configuracoes> => {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("configuracoes").select("chave, valor");
  const valor = (chave: string) => data?.find((c) => c.chave === chave)?.valor;
  const dias = Number(valor("dias_alerta_validade"));
  const nome = valor("nome_colegio");
  return {
    diasAlertaValidade: Number.isInteger(dias) && dias >= 0 ? dias : DIAS_ALERTA_VALIDADE_PADRAO,
    nomeColegio: typeof nome === "string" && nome.trim() ? nome : "Colégio",
  };
});
