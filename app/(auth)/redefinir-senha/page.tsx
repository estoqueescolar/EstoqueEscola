"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoSenha } from "@/components/comum/CampoSenha";
import { RequisitosSenha } from "@/components/comum/RequisitosSenha";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { esquemaNovaSenha, type DadosNovaSenha } from "@/lib/validacoes/auth";
import { definirNovaSenha } from "../actions";
import { ETAPAS_RECUPERACAO, EtapasFluxo } from "../etapas";

// Aberta pelo link do e-mail de recuperação (rota /auth/confirmar cria a sessão antes).
export default function PaginaRedefinirSenha() {
  const form = useForm<DadosNovaSenha>({
    resolver: zodResolver(esquemaNovaSenha),
    defaultValues: { senha: "", confirmacao: "" },
  });
  const { enviar, enviando, aviso } = useEnvioFormulario(form, definirNovaSenha);
  const { errors } = form.formState;
  const [senha, confirmacao] = useWatch({ control: form.control, name: ["senha", "confirmacao"] });

  return (
    <div className="flex flex-col gap-6">
      <title>Nova senha · Despensa CAPE</title>
      <EtapasFluxo atual={2} etapas={ETAPAS_RECUPERACAO} />
      <div>
        <h1 className="text-2xl font-semibold">Criar nova senha</h1>
        <p className="mt-1 text-muted-foreground">Quase lá. Escolha uma senha que você consiga lembrar.</p>
      </div>
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        {aviso && <AvisoFormulario tipo={aviso.tipo}>{aviso.texto}</AvisoFormulario>}
        <CampoSenha
          rotulo="Nova senha"
          autoComplete="new-password"
          required
          aria-describedby="requisitos-nova-senha"
          erro={errors.senha?.message}
          {...form.register("senha")}
        />
        <CampoSenha
          rotulo="Repita a nova senha"
          autoComplete="new-password"
          required
          erro={errors.confirmacao?.message}
          {...form.register("confirmacao")}
        />
        <RequisitosSenha id="requisitos-nova-senha" senha={senha} confirmacao={confirmacao} />
        <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Salvando…">
          Salvar nova senha
        </Botao>
      </form>
    </div>
  );
}
