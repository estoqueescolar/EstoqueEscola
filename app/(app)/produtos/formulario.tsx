"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoSelecao } from "@/components/comum/CampoSelecao";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { ConfirmarExclusao } from "@/components/comum/ConfirmarExclusao";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { Label } from "@/components/ui/label";
import { esquemaProduto, type DadosProduto } from "@/lib/validacoes/cadastros";
import type { OpcoesProduto } from "@/lib/dados/produtos";
import { excluirProduto, salvarProduto } from "./actions";

interface Props {
  opcoes: OpcoesProduto;
  produto?: { id: string; nome: string; valores: DadosProduto };
  podeExcluir?: boolean;
}

const VAZIO: DadosProduto = {
  nome: "", categoria_id: "", unidade_id: "", local_padrao_id: "", fornecedor_id: "", estoque_minimo: "", ativo: true,
};

export function FormularioProduto({ opcoes, produto, podeExcluir = false }: Props) {
  const form = useForm<DadosProduto>({
    resolver: zodResolver(esquemaProduto) as never,
    defaultValues: produto?.valores ?? VAZIO,
  });
  const { enviar, enviando, aviso } = useEnvioFormulario(form, async (dados) => {
    const resultado = await salvarProduto(produto?.id ?? null, dados);
    if (resultado.ok) toast.success(resultado.mensagem ?? "Produto salvo.");
    return resultado.ok ? { ok: true } : resultado;
  });
  const [excluindo, iniciar] = useTransition();
  const erros = form.formState.errors;
  const semCadastros = !opcoes.categorias.length || !opcoes.unidades.length || !opcoes.locais.length;

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 md:grid-cols-2">
      {semCadastros && (
        <div className="md:col-span-2">
          <AvisoFormulario tipo="erro">
            Antes de cadastrar produtos, cadastre ao menos uma categoria, uma unidade e um local em{" "}
            <Link href="/cadastros" className="underline">Cadastros</Link>.
          </AvisoFormulario>
        </div>
      )}
      {aviso && (
        <div className="md:col-span-2">
          <AvisoFormulario tipo={aviso.tipo}>{aviso.texto}</AvisoFormulario>
        </div>
      )}
      <p className="text-sm text-muted-foreground md:col-span-2">Campos com * são obrigatórios.</p>
      <div className="md:col-span-2">
        <CampoTexto rotulo="Nome do produto" required autoComplete="off" erro={erros.nome?.message} {...form.register("nome")} />
      </div>
      <CampoSelecao rotulo="Categoria" required opcoes={opcoes.categorias} textoVazio="Escolha…" erro={erros.categoria_id?.message} {...form.register("categoria_id")} />
      <CampoSelecao rotulo="Unidade de medida" required opcoes={opcoes.unidades} textoVazio="Escolha…" erro={erros.unidade_id?.message} {...form.register("unidade_id")} />
      <CampoSelecao rotulo="Local de armazenamento" required opcoes={opcoes.locais} textoVazio="Escolha…" erro={erros.local_padrao_id?.message} {...form.register("local_padrao_id")} />
      <CampoSelecao rotulo="Fornecedor" opcoes={opcoes.fornecedores} textoVazio="Nenhum" erro={erros.fornecedor_id?.message} {...form.register("fornecedor_id")} />
      <CampoTexto
        rotulo="Estoque mínimo"
        required
        inputMode="decimal"
        autoComplete="off"
        ajuda="Quando o estoque chegar a este valor ou menos, o produto entra na lista de compras."
        erro={erros.estoque_minimo?.message}
        {...form.register("estoque_minimo")}
      />
      {produto && (
        <div className="flex items-center self-center md:pt-6">
          <Label className="flex min-h-11 cursor-pointer items-center gap-3 text-base font-medium">
            <input type="checkbox" className="size-6 accent-[var(--manjericao)]" {...form.register("ativo")} />
            Produto ativo (aparece nas listas e alertas)
          </Label>
        </div>
      )}
      <div className="flex flex-wrap gap-3 md:col-span-2">
        <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Salvando…" disabled={semCadastros}>
          Salvar produto
        </Botao>
        {produto && podeExcluir && (
          <ConfirmarExclusao
            nome={produto.nome}
            desabilitado={excluindo}
            aoConfirmar={() =>
              iniciar(async () => {
                const resultado = await excluirProduto(produto.id);
                if (!resultado.ok) toast.error(resultado.mensagem, { duration: Infinity, closeButton: true });
              })
            }
          />
        )}
      </div>
    </form>
  );
}
