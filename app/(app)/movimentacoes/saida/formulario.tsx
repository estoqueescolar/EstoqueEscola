"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListOrderedIcon } from "lucide-react";
import { toast } from "sonner";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoSelecao } from "@/components/comum/CampoSelecao";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { CampoTextoLongo } from "@/components/comum/CampoTextoLongo";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { EtiquetaValidade } from "@/components/estoque/EtiquetaValidade";
import type { ProdutoParaMovimentar } from "@/lib/dados/opcoes-movimentacao";
import { calcularEstoqueDisponivel } from "@/lib/regras/estoque";
import { planejarSaidaFefo, validarSaida } from "@/lib/regras/fefo";
import { formatarQuantidade } from "@/lib/regras/quantidades";
import { lerNumero } from "@/lib/validacoes/comum";
import { esquemaSaida, type DadosSaida } from "@/lib/validacoes/movimentacoes";
import { registrarSaida } from "../actions";

interface Props {
  produtos: ProdutoParaMovimentar[];
  hoje: string;
  diasAlerta: number;
  produtoInicial?: string;
}

export function FormularioSaida({ produtos, hoje, diasAlerta, produtoInicial = "" }: Props) {
  const form = useForm<DadosSaida>({
    resolver: zodResolver(esquemaSaida) as never,
    defaultValues: { produto_id: produtoInicial, quantidade: "", observacao: "" },
  });
  const [produtoId, quantidadeTexto] = useWatch({ control: form.control, name: ["produto_id", "quantidade"] });
  const produto = produtos.find((p) => p.id === produtoId);
  const quantidade = lerNumero(String(quantidadeTexto ?? ""));

  // Prévia com as mesmas regras puras usadas no servidor e testadas no Vitest.
  const disponivel = produto ? calcularEstoqueDisponivel(produto.lotes, hoje) : 0;
  const validacao = produto && quantidade > 0 ? validarSaida({ nomeProduto: produto.nome, sigla: produto.sigla, lotes: produto.lotes, quantidade, hoje }) : null;
  const plano = produto && validacao?.ok ? planejarSaidaFefo(produto.lotes, quantidade, hoje) : [];

  const { enviar, enviando, aviso } = useEnvioFormulario(form, async (dados) => {
    // bloqueia aqui (botão continua habilitado e explica o motivo ao lado do campo)
    if (validacao && !validacao.ok) return { ok: false, mensagem: validacao.mensagem, erros: { quantidade: validacao.mensagem } };
    const resultado = await registrarSaida(dados);
    if (!resultado.ok) return resultado;
    toast.success(resultado.mensagem);
    form.reset({ produto_id: "", quantidade: "", observacao: "" });
    return { ok: true };
  });
  const erros = form.formState.errors;

  const opcoes = produtos.map((p) => ({
    valor: p.id,
    texto: `${p.nome} (${formatarQuantidade(calcularEstoqueDisponivel(p.lotes, hoje), p.sigla)})`,
  }));

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Campos com * são obrigatórios.</p>
      {aviso && <AvisoFormulario tipo={aviso.tipo}>{aviso.texto}</AvisoFormulario>}
      <CampoSelecao rotulo="Produto" required opcoes={opcoes} textoVazio="Escolha o produto…" erro={erros.produto_id?.message} {...form.register("produto_id")} />
      <CampoTexto
        rotulo={produto ? `Quantidade usada (em ${produto.sigla})` : "Quantidade usada"}
        required
        inputMode="decimal"
        autoComplete="off"
        ajuda={produto ? `Disponível: ${formatarQuantidade(disponivel, produto.sigla)} (lotes vencidos não contam).` : undefined}
        // o excesso aparece ligado ao campo (aria-describedby), sem alerta a cada tecla
        erro={validacao && !validacao.ok ? validacao.mensagem : erros.quantidade?.message}
        {...form.register("quantidade")}
      />

      {/* resumo da prévia para leitores de tela (região sempre montada, anúncio educado) */}
      <p className="sr-only" aria-live="polite">
        {plano.length && produto
          ? `Vai sair ${plano.map((r) => `${formatarQuantidade(r.quantidade, produto.sigla)} do lote ${r.codigo}`).join(" e ")}.`
          : ""}
      </p>
      {plano.length > 0 && produto && (
        <section aria-labelledby="titulo-plano" className="rounded-lg border border-primary bg-ok-fundo p-3">
          <h2 id="titulo-plano" className="flex items-center gap-2 font-semibold">
            <ListOrderedIcon className="size-5" aria-hidden="true" /> Vai sair primeiro do que vence antes:
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            {plano.map((r) => {
              const lote = produto.lotes.find((l) => l.id === r.lote_id)!;
              return (
                <li key={r.lote_id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold">{formatarQuantidade(r.quantidade, produto.sigla)}</span>
                  <span>do lote {r.codigo}</span>
                  <EtiquetaValidade dataValidade={lote.data_validade} hoje={hoje} diasAlerta={diasAlerta} />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <CampoTextoLongo rotulo="Observação" ajuda="Opcional. Ex.: almoço de segunda" erro={erros.observacao?.message} {...form.register("observacao")} />
      <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Registrando…">
        Registrar saída
      </Botao>
    </form>
  );
}
