"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { esquemaConfiguracoes, type DadosConfiguracoes } from "@/lib/validacoes/configuracoes";
import { salvarConfiguracoes } from "./actions";

export function FormularioConfiguracoes({ diasAlerta }: { diasAlerta: number }) {
  const form = useForm<DadosConfiguracoes, unknown, DadosConfiguracoes>({
    resolver: zodResolver(esquemaConfiguracoes) as never,
    defaultValues: { dias_alerta_validade: diasAlerta },
  });
  const { enviar, enviando, aviso } = useEnvioFormulario(form, salvarConfiguracoes);

  return (
    <form onSubmit={enviar} noValidate className="flex max-w-md flex-col gap-4">
      {aviso && <AvisoFormulario tipo={aviso.tipo}>{aviso.texto}</AvisoFormulario>}
      <CampoTexto
        rotulo="Avisar quantos dias antes do vencimento"
        inputMode="numeric"
        required
        ajuda="Lotes que vencem dentro desse prazo aparecem no painel e no filtro de lotes. O padrão é 7 dias."
        erro={form.formState.errors.dias_alerta_validade?.message}
        {...form.register("dias_alerta_validade")}
      />
      <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Salvando…" className="sm:w-fit">
        Salvar prazo
      </Botao>
    </form>
  );
}
