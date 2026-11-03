"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeftIcon, MailCheckIcon } from "lucide-react";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { esquemaRecuperarSenha, type DadosRecuperarSenha } from "@/lib/validacoes/auth";
import { solicitarRecuperacao } from "../actions";
import { ETAPAS_RECUPERACAO, EtapasFluxo } from "../etapas";

export default function PaginaRecuperarSenha() {
  const form = useForm<DadosRecuperarSenha>({ resolver: zodResolver(esquemaRecuperarSenha), defaultValues: { email: "" } });
  const { enviar, enviando, aviso } = useEnvioFormulario(form, solicitarRecuperacao);
  // "Usar outro e-mail" esconde a confirmação e volta ao formulário
  const [editando, setEditando] = useState(false);
  const enviado = aviso?.tipo === "sucesso" && !editando;

  return (
    <div className="flex flex-col gap-6">
      <title>Recuperar senha · Despensa CAPE</title>
      <Link
        href="/login"
        className="-ml-1 inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        <ChevronLeftIcon className="size-4" aria-hidden="true" /> Voltar para entrar
      </Link>
      <EtapasFluxo atual={1} etapas={ETAPAS_RECUPERACAO} />
      {enviado ? (
        <div className="flex flex-col items-start gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-ok-fundo text-primary">
            <MailCheckIcon className="size-6" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold">Confira seu e-mail</h1>
          <AvisoFormulario tipo="sucesso" focar>
            {aviso.texto}
          </AvisoFormulario>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-muted-foreground">
            <li>Abra a mensagem que enviamos (veja também a caixa de spam).</li>
            <li>Toque no link. Ele vale por pouco tempo e só funciona uma vez.</li>
            <li>Crie a nova senha na tela que vai abrir.</li>
          </ol>
          <Botao type="button" variant="outline" onClick={() => setEditando(true)}>
            Usar outro e-mail
          </Botao>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-semibold">Esqueceu a senha?</h1>
            <p className="mt-1 text-muted-foreground">
              Sem problema. Informe o e-mail da sua conta e enviamos um link para criar uma senha nova.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              setEditando(false);
              return enviar(e);
            }}
            noValidate
            className="flex flex-col gap-4"
          >
            {aviso?.tipo === "erro" && <AvisoFormulario tipo="erro">{aviso.texto}</AvisoFormulario>}
            <CampoTexto
              rotulo="E-mail"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              erro={form.formState.errors.email?.message}
              {...form.register("email")}
            />
            <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Enviando…">
              Enviar link
            </Botao>
          </form>
        </>
      )}
    </div>
  );
}
