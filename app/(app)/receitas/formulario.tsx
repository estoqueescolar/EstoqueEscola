"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { CampoTextoLongo } from "@/components/comum/CampoTextoLongo";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { criarReceita, atualizarReceita } from "./actions";

const esquema = z.object({
  nome: z.string().min(1, "Informe o nome da receita.").max(120),
  descricao: z.string().max(500).optional(),
  modo_preparo: z.string().max(5000).optional(),
  porcoes_base: z.coerce.number().int().min(1, "Mínimo 1 porção."),
});

type Dados = z.infer<typeof esquema>;

interface Props {
  receita?: { id: string; nome: string; descricao: string | null; modo_preparo: string | null; porcoes_base: number };
}

export function FormularioReceita({ receita }: Props) {
  const form = useForm<Dados, unknown, Dados>({
    resolver: zodResolver(esquema) as never,
    defaultValues: {
      nome: receita?.nome ?? "",
      descricao: receita?.descricao ?? "",
      modo_preparo: receita?.modo_preparo ?? "",
      porcoes_base: receita?.porcoes_base ?? 4,
    },
  });

  const { enviar, enviando, aviso } = useEnvioFormulario(
    form,
    receita
      ? (dados: Dados) => atualizarReceita(receita.id, dados)
      : criarReceita,
  );

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5 rounded-xl border bg-card p-5 sm:p-6">
      {aviso?.tipo === "erro" && <AvisoFormulario tipo="erro">{aviso.texto}</AvisoFormulario>}
      {aviso?.tipo === "sucesso" && <AvisoFormulario tipo="sucesso">{aviso.texto}</AvisoFormulario>}

      <CampoTexto
        rotulo="Nome da receita"
        required
        placeholder="Ex: Arroz com frango"
        erro={form.formState.errors.nome?.message}
        {...form.register("nome")}
      />

      <CampoTextoLongo
        rotulo="Descrição"
        ajuda="Resumo rápido do prato (opcional)"
        rows={2}
        erro={form.formState.errors.descricao?.message}
        {...form.register("descricao")}
      />

      <CampoTexto
        rotulo="Porções base"
        type="number"
        min={1}
        required
        ajuda="Quantidade de porções para a qual os ingredientes são calculados"
        erro={form.formState.errors.porcoes_base?.message}
        {...form.register("porcoes_base")}
      />

      <CampoTextoLongo
        rotulo="Modo de preparo"
        ajuda="Passo a passo do preparo (opcional)"
        rows={6}
        erro={form.formState.errors.modo_preparo?.message}
        {...form.register("modo_preparo")}
      />

      <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Salvando…">
        {receita ? "Salvar alterações" : "Criar receita"}
      </Botao>
    </form>
  );
}
