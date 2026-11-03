"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoTextoLongo } from "@/components/comum/CampoTextoLongo";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { REFEICOES } from "@/lib/regras/cardapio";
import { esquemaDiaCardapio, type DadosDiaCardapio } from "@/lib/validacoes/cardapio";
import { salvarDiaCardapio } from "../actions";

const EXEMPLOS: Record<string, string> = {
  cafe_da_manha: "Ex.: pão com manteiga, leite com achocolatado e banana",
  lanche_da_manha: "Ex.: iogurte natural com aveia",
  almoco: "Ex.: arroz, feijão carioca, frango assado e salada de alface",
  lanche_da_tarde: "Ex.: biscoito de maisena e suco de laranja",
};

export function FormularioDiaCardapio({ data, valores }: { data: string; valores: Record<string, string> }) {
  const form = useForm<DadosDiaCardapio>({
    resolver: zodResolver(esquemaDiaCardapio) as never,
    defaultValues: { data, ...valores } as never,
  });
  const { enviar, enviando, aviso } = useEnvioFormulario(form, salvarDiaCardapio);

  return (
    <form onSubmit={enviar} noValidate className="flex max-w-2xl flex-col gap-4 rounded-xl border bg-card p-4 sm:p-6">
      {aviso && <AvisoFormulario tipo={aviso.tipo}>{aviso.texto}</AvisoFormulario>}
      {REFEICOES.map(({ tipo, nome }) => (
        <CampoTextoLongo
          key={tipo}
          rotulo={nome}
          ajuda={EXEMPLOS[tipo]}
          maxLength={1000}
          erro={form.formState.errors[tipo]?.message}
          {...form.register(tipo)}
        />
      ))}
      <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Salvando…" className="sm:w-fit">
        Salvar cardápio do dia
      </Botao>
    </form>
  );
}
