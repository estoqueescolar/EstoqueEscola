"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoSelecao } from "@/components/comum/CampoSelecao";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { CampoTextoLongo } from "@/components/comum/CampoTextoLongo";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { esquemaEntrada, type DadosEntrada } from "@/lib/validacoes/movimentacoes";
import { registrarEntrada } from "../../movimentacoes/actions";

interface Opcao {
  valor: string;
  texto: string;
}

interface Props {
  produtos: (Opcao & { sigla: string })[];
  locais: Opcao[];
  fornecedores: Opcao[];
  hoje: string;
  produtoInicial?: string;
}

export function FormularioEntrada({ produtos, locais, fornecedores, hoje, produtoInicial = "" }: Props) {
  const form = useForm<DadosEntrada>({
    resolver: zodResolver(esquemaEntrada) as never,
    defaultValues: {
      produto_id: produtoInicial, quantidade: "", data_entrada: hoje, data_validade: "",
      codigo: "", fornecedor_id: "", local_id: "", observacao: "",
    },
  });
  const produtoId = useWatch({ control: form.control, name: "produto_id" });
  const sigla = produtos.find((p) => p.valor === produtoId)?.sigla;
  const { enviar, enviando, aviso } = useEnvioFormulario(form, registrarEntrada);
  const erros = form.formState.errors;

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 md:grid-cols-2">
      <p className="text-sm text-muted-foreground md:col-span-2">Campos com * são obrigatórios.</p>
      {aviso && (
        <div className="md:col-span-2">
          <AvisoFormulario tipo={aviso.tipo}>{aviso.texto}</AvisoFormulario>
        </div>
      )}
      <div className="md:col-span-2">
        <CampoSelecao rotulo="Produto" required opcoes={produtos} textoVazio="Escolha o produto…" erro={erros.produto_id?.message} {...form.register("produto_id")} />
      </div>
      <CampoTexto
        rotulo={sigla ? `Quantidade recebida (em ${sigla})` : "Quantidade recebida"}
        required
        inputMode="decimal"
        autoComplete="off"
        erro={erros.quantidade?.message}
        {...form.register("quantidade")}
      />
      <CampoTexto
        rotulo="Código do lote"
        autoComplete="off"
        ajuda="Opcional. Em branco, o sistema cria um código. Se repetir um código existente do mesmo produto, a quantidade é somada a ele."
        erro={erros.codigo?.message}
        {...form.register("codigo")}
      />
      <CampoTexto rotulo="Data de entrada" type="date" required max={hoje} erro={erros.data_entrada?.message} {...form.register("data_entrada")} />
      <CampoTexto
        rotulo="Data de validade"
        type="date"
        required
        min={hoje}
        ajuda="A data impressa na embalagem."
        erro={erros.data_validade?.message}
        {...form.register("data_validade")}
      />
      <CampoSelecao rotulo="Local de armazenamento" opcoes={locais} textoVazio="Local padrão do produto" erro={erros.local_id?.message} {...form.register("local_id")} />
      <CampoSelecao rotulo="Fornecedor" opcoes={fornecedores} textoVazio="Fornecedor do produto" erro={erros.fornecedor_id?.message} {...form.register("fornecedor_id")} />
      <div className="md:col-span-2">
        <CampoTextoLongo rotulo="Observação" ajuda="Opcional. Ex.: nota fiscal 1234" erro={erros.observacao?.message} {...form.register("observacao")} />
      </div>
      <div className="md:col-span-2">
        <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Registrando…">
          Registrar entrada
        </Botao>
      </div>
    </form>
  );
}
