"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { CampoTextoLongo } from "@/components/comum/CampoTextoLongo";
import { ConfirmarExclusao } from "@/components/comum/ConfirmarExclusao";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CONFIG_CADASTROS } from "@/lib/cadastros-config";
import { ESQUEMAS_CADASTRO, type TipoCadastro } from "@/lib/validacoes/cadastros";
import { excluirCadastro, salvarCadastro } from "../actions";

export type RegistroCadastro = { id: string } & Record<string, string | null>;
type Valores = Record<string, string>;

const maiuscula = (texto: string) => `${texto[0].toUpperCase()}${texto.slice(1)}`;

function Formulario({ tipo, registro, aoSalvar }: { tipo: TipoCadastro; registro?: RegistroCadastro; aoSalvar?: () => void }) {
  const config = CONFIG_CADASTROS[tipo];
  const valoresIniciais = Object.fromEntries(config.campos.map((c) => [c.nome, registro?.[c.nome] ?? ""]));
  const form = useForm<Valores>({
    // o esquema converte "" em null; o formulário trabalha só com texto
    resolver: zodResolver(ESQUEMAS_CADASTRO[tipo] as never),
    defaultValues: valoresIniciais,
  });
  const { enviar, enviando, aviso } = useEnvioFormulario(form, async (dados) => {
    const resultado = await salvarCadastro(tipo, registro?.id ?? null, dados);
    if (!resultado.ok) return resultado;
    toast.success(resultado.mensagem);
    form.reset(registro ? dados : valoresIniciais);
    aoSalvar?.();
    return { ok: true };
  });
  const erros = form.formState.errors;

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 md:grid-cols-2">
      {aviso && (
        <div className="md:col-span-2">
          <AvisoFormulario tipo={aviso.tipo}>{aviso.texto}</AvisoFormulario>
        </div>
      )}
      {config.campos.map((campo) =>
        campo.tipo === "textoLongo" ? (
          <div key={campo.nome} className="md:col-span-2">
            <CampoTextoLongo rotulo={campo.rotulo} ajuda={campo.ajuda} erro={erros[campo.nome]?.message} {...form.register(campo.nome)} />
          </div>
        ) : (
          <CampoTexto
            key={campo.nome}
            rotulo={campo.rotulo}
            ajuda={campo.ajuda}
            required={campo.obrigatorio}
            type={campo.tipo === "telefone" ? "tel" : "text"}
            inputMode={campo.tipo === "telefone" ? "tel" : undefined}
            autoComplete="off"
            erro={erros[campo.nome]?.message}
            {...form.register(campo.nome)}
          />
        ),
      )}
      <div className="md:col-span-2">
        <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Salvando…">
          Salvar {config.singular}
        </Botao>
      </div>
    </form>
  );
}

function DialogoEdicao({ tipo, registro }: { tipo: TipoCadastro; registro: RegistroCadastro }) {
  const [aberto, setAberto] = useState(false);
  const config = CONFIG_CADASTROS[tipo];
  const nome = registro[config.principal] ?? "";
  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Botao variant="outline" aria-label={`Editar ${nome}`}>
          <PencilIcon className="size-5" aria-hidden="true" />
          Editar
        </Botao>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="flex-row items-start justify-between gap-2">
          <div>
            <DialogTitle className="text-xl">Editar {config.singular}</DialogTitle>
            <DialogDescription className="text-base">{nome}</DialogDescription>
          </div>
          <DialogClose asChild>
            <Botao tamanho="icone" variant="ghost" aria-label="Fechar">
              <XIcon className="size-6" aria-hidden="true" />
            </Botao>
          </DialogClose>
        </DialogHeader>
        <Formulario tipo={tipo} registro={registro} aoSalvar={() => setAberto(false)} />
      </DialogContent>
    </Dialog>
  );
}

interface Props {
  tipo: TipoCadastro;
  registros: readonly RegistroCadastro[];
  podeEditar: boolean;
  podeExcluir: boolean;
}

export function GerenciadorCadastro({ tipo, registros, podeEditar, podeExcluir }: Props) {
  const config = CONFIG_CADASTROS[tipo];
  const [excluindo, iniciar] = useTransition();
  // depois de excluir, o item some: o foco vai para o título da lista em vez de cair no topo da página
  const tituloLista = useRef<HTMLHeadingElement>(null);
  const excluir = (registro: RegistroCadastro) =>
    iniciar(async () => {
      const resultado = await excluirCadastro(tipo, registro.id);
      if (resultado.ok) {
        toast.success(resultado.mensagem);
        tituloLista.current?.focus();
      } else toast.error(resultado.mensagem, { duration: Infinity, closeButton: true });
    });

  return (
    <>
      {podeEditar && (
        <section aria-labelledby="titulo-novo" className="rounded-xl border bg-card p-4 sm:p-6">
          <h2 id="titulo-novo" className="mb-1 text-xl font-semibold">
            {config.artigo === "a" ? "Nova" : "Novo"} {config.singular}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">Campos com * são obrigatórios.</p>
          <Formulario tipo={tipo} />
        </section>
      )}
      <section aria-labelledby="titulo-lista" className="flex flex-col gap-3">
        <h2 id="titulo-lista" ref={tituloLista} tabIndex={-1} className="text-xl font-semibold">
          {maiuscula(config.titulo)} cadastrad{config.artigo}s{" "}
          <span className="font-normal text-muted-foreground">({registros.length})</span>
        </h2>
        {registros.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">
            Nenhum{config.artigo === "a" ? "a" : ""} {config.singular} cadastrad{config.artigo} ainda.
            {podeEditar && " Use o formulário acima para cadastrar."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {registros.map((registro) => (
              <li key={registro.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-lg font-semibold break-words">{registro[config.principal]}</p>
                  {config.secundarias.map((coluna) =>
                    registro[coluna] ? (
                      <p key={coluna} className="break-words text-muted-foreground">
                        {registro[coluna]}
                      </p>
                    ) : null,
                  )}
                </div>
                {(podeEditar || podeExcluir) && (
                  <div className="flex shrink-0 gap-2">
                    {podeEditar && <DialogoEdicao tipo={tipo} registro={registro} />}
                    {podeExcluir && (
                      <ConfirmarExclusao
                        nome={registro[config.principal] ?? ""}
                        aoConfirmar={() => excluir(registro)}
                        desabilitado={excluindo}
                      />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
