"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoSelecao } from "@/components/comum/CampoSelecao";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { esquemaCriarUsuario, type DadosCriarUsuario } from "@/lib/validacoes/auth";
import { criarUsuario } from "./actions";
import { OPCOES_PERFIL } from "./opcoes";

export function FormularioNovoUsuario() {
  const form = useForm<DadosCriarUsuario>({
    resolver: zodResolver(esquemaCriarUsuario),
    defaultValues: { nome: "", email: "", senha: "", perfil: "operador" },
  });
  const { enviar, enviando, aviso } = useEnvioFormulario(form, async (dados) => {
    const resultado = await criarUsuario(dados);
    if (resultado.ok) {
      toast.success(resultado.mensagem);
      form.reset();
      return { ok: true };
    }
    return resultado;
  });
  const { errors } = form.formState;

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 md:grid-cols-2">
      {aviso && (
        <div className="md:col-span-2">
          <AvisoFormulario tipo={aviso.tipo}>{aviso.texto}</AvisoFormulario>
        </div>
      )}
      <CampoTexto rotulo="Nome" autoComplete="off" required erro={errors.nome?.message} {...form.register("nome")} />
      <CampoTexto
        rotulo="E-mail"
        type="email"
        inputMode="email"
        autoComplete="off"
        required
        erro={errors.email?.message}
        {...form.register("email")}
      />
      <CampoTexto
        rotulo="Senha inicial"
        type="text"
        autoComplete="new-password"
        required
        ajuda="Pelo menos 8 caracteres, com letras e números. A pessoa pode trocar depois em “Esqueci minha senha”."
        erro={errors.senha?.message}
        {...form.register("senha")}
      />
      <CampoSelecao rotulo="Perfil de acesso" opcoes={OPCOES_PERFIL} erro={errors.perfil?.message} {...form.register("perfil")} />
      <div className="md:col-span-2">
        <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Criando conta…">
          Criar conta
        </Botao>
      </div>
    </form>
  );
}
