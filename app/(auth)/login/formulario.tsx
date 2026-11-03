"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoSenha } from "@/components/comum/CampoSenha";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { esquemaLogin, type DadosLogin } from "@/lib/validacoes/auth";
import { entrar } from "../actions";

export function FormularioLogin({ voltar }: { voltar?: string }) {
  const form = useForm<DadosLogin>({ resolver: zodResolver(esquemaLogin), defaultValues: { email: "", senha: "" } });
  const { enviar, enviando, aviso } = useEnvioFormulario(form, (dados) => entrar(dados, voltar));
  const { errors } = form.formState;

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      {aviso && <AvisoFormulario tipo={aviso.tipo}>{aviso.texto}</AvisoFormulario>}
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
        autoComplete="current-password"
        required
        erro={errors.senha?.message}
        {...form.register("senha")}
      />
      <Link
        href="/recuperar-senha"
        className="-mt-3 inline-flex min-h-11 items-center self-end text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Esqueci minha senha
      </Link>
      <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Entrando…">
        Entrar
      </Botao>
    </form>
  );
}
