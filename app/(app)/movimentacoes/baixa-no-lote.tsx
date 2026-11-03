"use client";

import { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoSelecao } from "@/components/comum/CampoSelecao";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { CampoTextoLongo } from "@/components/comum/CampoTextoLongo";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { EtiquetaValidade } from "@/components/estoque/EtiquetaValidade";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ProdutoParaMovimentar } from "@/lib/dados/opcoes-movimentacao";
import { formatarData } from "@/lib/regras/datas";
import { validarBaixaNoLote } from "@/lib/regras/movimentacoes";
import { formatarQuantidade } from "@/lib/regras/quantidades";
import { lerNumero } from "@/lib/validacoes/comum";
import { esquemaAjuste, esquemaPerda, MOTIVOS_PERDA } from "@/lib/validacoes/movimentacoes";
import { registrarAjuste, registrarPerda } from "./actions";

interface Props {
  tipo: "perda" | "ajuste";
  produtos: ProdutoParaMovimentar[];
  hoje: string;
  diasAlerta: number;
  loteInicial?: string;
}

type Valores = { produto_id: string; lote_id: string; quantidade: string; sentido: string; motivo: string; observacao: string };

const SENTIDOS = [
  { valor: "-1", texto: "Diminuir — tem menos do que o sistema mostra" },
  { valor: "1", texto: "Aumentar — tem mais do que o sistema mostra" },
];

// Perda e ajuste são feitos em um lote específico: escolhe o produto, depois o lote.
export function FormularioBaixaNoLote({ tipo, produtos, hoje, diasAlerta, loteInicial = "" }: Props) {
  const produtoDoLote = produtos.find((p) => p.lotes.some((l) => l.id === loteInicial))?.id ?? "";
  const esquema = tipo === "perda" ? esquemaPerda : esquemaAjuste;
  const form = useForm<Valores>({
    resolver: zodResolver(esquema as never),
    defaultValues: { produto_id: produtoDoLote, lote_id: produtoDoLote ? loteInicial : "", quantidade: "", sentido: "-1", motivo: "", observacao: "" },
  });
  const [produtoId, loteId, quantidadeTexto, sentido] = useWatch({ control: form.control, name: ["produto_id", "lote_id", "quantidade", "sentido"] });
  const produto = produtos.find((p) => p.id === produtoId);
  // perda só em lote com saldo; ajuste também em lote zerado (corrigir contagem)
  const lotes = (produto?.lotes ?? []).filter((l) => tipo === "ajuste" || l.quantidade > 0);
  const lote = lotes.find((l) => l.id === loteId);
  const quantidade = lerNumero(String(quantidadeTexto ?? ""));
  const diminui = tipo === "perda" || sentido === "-1";
  const excesso = lote && diminui && quantidade > 0 ? validarBaixaNoLote(lote, quantidade, produto!.sigla) : null;

  const formulario = useRef<HTMLFormElement>(null);
  const { enviar, enviando, aviso } = useEnvioFormulario(form, async (dados) => {
    if (excesso && !excesso.ok) return { ok: false, mensagem: excesso.mensagem, erros: { quantidade: excesso.mensagem } };
    const resultado = tipo === "perda" ? await registrarPerda(dados) : await registrarAjuste(dados);
    if (!resultado.ok) return resultado;
    toast.success(resultado.mensagem);
    form.reset({ produto_id: "", lote_id: "", quantidade: "", sentido: "-1", motivo: "", observacao: "" });
    return { ok: true };
  });
  const erros = form.formState.errors;
  const opcoesProduto = produtos
    .filter((p) => tipo === "ajuste" || p.estoque > 0)
    .map((p) => ({ valor: p.id, texto: `${p.nome} (${formatarQuantidade(p.estoque, p.sigla)})` }));
  // validade logo depois do código: é o que mais importa e não pode ser cortado em 375px
  const opcoesLote = lotes.map((l) => ({
    valor: l.id,
    texto: `${l.codigo} · vence ${formatarData(l.data_validade).slice(0, 5)} · ${formatarQuantidade(l.quantidade, produto?.sigla)} · ${l.local}`,
  }));
  const resumoPerda = lote && quantidade > 0 ? `${formatarQuantidade(quantidade, produto?.sigla)} do lote ${lote.codigo}` : "do lote escolhido";

  return (
    <form ref={formulario} onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Campos com * são obrigatórios.</p>
      {aviso && <AvisoFormulario tipo={aviso.tipo}>{aviso.texto}</AvisoFormulario>}
      <CampoSelecao
        rotulo="Produto"
        required
        opcoes={opcoesProduto}
        textoVazio="Escolha o produto…"
        erro={erros.produto_id?.message}
        {...form.register("produto_id", { onChange: () => form.setValue("lote_id", "") })}
      />
      <CampoSelecao
        rotulo="Lote"
        required
        opcoes={opcoesLote}
        textoVazio={produto ? "Escolha o lote…" : "Escolha o produto primeiro"}
        erro={erros.lote_id?.message}
        {...form.register("lote_id")}
      />
      <p className="sr-only" aria-live="polite">
        {produto ? `${lotes.length === 1 ? "1 lote disponível" : `${lotes.length} lotes disponíveis`} para ${produto.nome}.` : ""}
      </p>
      {lote && (
        <p className="flex flex-wrap items-center gap-2">
          Lote {lote.codigo}: <strong>{formatarQuantidade(lote.quantidade, produto?.sigla)}</strong>
          <EtiquetaValidade dataValidade={lote.data_validade} hoje={hoje} diasAlerta={diasAlerta} />
        </p>
      )}
      {tipo === "ajuste" && (
        <CampoSelecao rotulo="O ajuste vai…" required opcoes={SENTIDOS} erro={erros.sentido?.message} {...form.register("sentido")} />
      )}
      <CampoTexto
        rotulo={produto ? `Quantidade (em ${produto.sigla})` : "Quantidade"}
        required
        inputMode="decimal"
        autoComplete="off"
        erro={excesso && !excesso.ok ? excesso.mensagem : erros.quantidade?.message}
        {...form.register("quantidade")}
      />
      <CampoTexto
        rotulo="Motivo"
        required
        autoComplete="off"
        ajuda={tipo === "perda" ? "Ex.: Vencido, Estragado, Embalagem danificada" : "Ex.: Contagem do inventário de sexta"}
        erro={erros.motivo?.message}
        {...form.register("motivo")}
      />
      {tipo === "perda" && (
        <div role="group" aria-label="Sugestões de motivo" className="-mt-2 flex flex-wrap gap-2">
          {MOTIVOS_PERDA.map((m) => (
            <Botao key={m} type="button" variant="outline" onClick={() => form.setValue("motivo", m, { shouldValidate: true })}>
              {m}
            </Botao>
          ))}
        </div>
      )}
      <CampoTextoLongo rotulo="Observação" ajuda="Opcional" erro={erros.observacao?.message} {...form.register("observacao")} />
      {tipo === "perda" ? (
        // perda não pode ser desfeita: confirma antes de enviar
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Botao type="button" tamanho="principal" variant="destructive" carregando={enviando} textoCarregando="Registrando…">
              Registrar perda
            </Botao>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Registrar perda de {resumoPerda}?</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                A quantidade sai do estoque e não dá para desfazer. Se errar, corrija depois com um ajuste.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="bg-muted">
              <AlertDialogCancel className="min-h-11 text-base">Voltar</AlertDialogCancel>
              <AlertDialogAction className="min-h-11 text-base" variant="destructive" onClick={() => formulario.current?.requestSubmit()}>
                Registrar perda
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Registrando…">
          Registrar ajuste
        </Botao>
      )}
    </form>
  );
}
