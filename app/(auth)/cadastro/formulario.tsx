"use client";

import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheckIcon } from "lucide-react";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoSenha } from "@/components/comum/CampoSenha";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { RequisitosSenha } from "@/components/comum/RequisitosSenha";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { esquemaCadastro, type DadosCadastro } from "@/lib/validacoes/auth";
import { cadastrar } from "../actions";

export function FormularioCadastro() {
  const form = useForm<DadosCadastro>({
    resolver: zodResolver(esquemaCadastro),
    defaultValues: { nome: "", email: "", senha: "", confirmacao: "" },
  });
  const { enviar, enviando, aviso } = useEnvioFormulario(form, cadastrar);
  const { errors } = form.formState;
  const [senha, confirmacao] = useWatch({ control: form.control, name: ["senha", "confirmacao"] });

  if (aviso?.tipo === "sucesso") {
    return (
      <div className="flex flex-col items-start gap-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-ok-fundo text-primary">
          <MailCheckIcon className="size-6" aria-hidden="true" />
        </span>
        <h2 className="text-xl font-semibold">Confira seu e-mail</h2>
        <AvisoFormulario tipo="sucesso" focar>
          {aviso.texto}
        </AvisoFormulario>
        <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline">
          Voltar para entrar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      {aviso && <AvisoFormulario tipo="erro">{aviso.texto}</AvisoFormulario>}
      <CampoTexto rotulo="Nome" autoComplete="name" required erro={errors.nome?.message} {...form.register("nome")} />
      <CampoTexto
        rotulo="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        erro={errors.email?.message}
        {...form.register("email")}
      />
      <CampoSenha
        rotulo="Senha"
        autoComplete="new-password"
        required
        aria-describedby="requisitos-cadastro"
        erro={errors.senha?.message}
        {...form.register("senha")}
      />
      <CampoSenha
        rotulo="Repita a senha"
        autoComplete="new-password"
        required
        erro={errors.confirmacao?.message}
        {...form.register("confirmacao")}
      />
      <RequisitosSenha id="requisitos-cadastro" senha={senha} confirmacao={confirmacao} />
      <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Criando conta…">
        Criar conta
      </Botao>
    </form>
  );
}
