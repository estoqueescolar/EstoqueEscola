"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon, ImageIcon, Loader2Icon, PlusIcon, SearchIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { FotoAluno } from "@/components/alunos/FotoAluno";
import { SeletorNivel } from "@/components/alunos/SeletorNivel";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { CampoTextoLongo } from "@/components/comum/CampoTextoLongo";
import { ConfirmarExclusao } from "@/components/comum/ConfirmarExclusao";
import { ErroFoto, reduzirFoto } from "@/lib/fotos/reduzir-foto";
import { nomeArquivoFoto, normalizar, validarFotoAluno, type NivelRestricao } from "@/lib/regras/alunos";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import { cn } from "@/lib/utils";
import { esquemaAluno, type DadosAluno } from "@/lib/validacoes/alunos";
import { criarTipoRestricao, excluirAluno, salvarAluno } from "./actions";

const BUCKET = "fotos-alunos";
const VOLTAR = "/restricoes/alunos";
const ID_TIRAR_FOTO = "foto-camera";
const ID_BUSCA_ALERGIA = "busca-alergia";
const idCaixaRestricao = (id: string) => `restricao-${id}`;
const MSG_FALHA_REDE = "Não foi possível salvar. Sem conexão com o servidor. Confira a internet e tente de novo.";

// Devolve o foco depois que o elemento focado some da tela (teclado e leitor de tela).
function focarDepois(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}

interface Tipo {
  id: string;
  nome: string;
}

interface AlunoEdicao {
  id: string;
  nome: string;
  turma: string | null;
  observacao: string | null;
  autorizacao_responsaveis: boolean;
  fotoUrl: string | null;
  restricoes: { tipo_restricao_id: string; nivel: NivelRestricao }[];
}

interface Props {
  tipos: Tipo[];
  aluno?: AlunoEdicao;
  podeExcluir: boolean;
}

const classeBotaoArquivo =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 text-base font-medium hover:bg-accent has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring";

function Etapa({ numero, titulo, descricao, children, id }: { numero: number; titulo: string; descricao?: string; children: ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex gap-3">
        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {numero}
        </span>
        <div>
          <h2 id={id} className="text-lg font-semibold leading-8">
            <span className="sr-only">Passo {numero}: </span>
            {titulo}
          </h2>
          {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function FormularioAluno({ tipos: tiposIniciais, aluno, podeExcluir }: Props) {
  const router = useRouter();
  const [enviando, iniciar] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const [tipos, setTipos] = useState(tiposIniciais);

  // Foto: nada alterado | foto nova já reduzida | remoção da atual
  const [fotoNova, setFotoNova] = useState<{ blob: Blob; previa: string } | null>(null);
  const [removerFoto, setRemoverFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [preparandoFoto, setPreparandoFoto] = useState(false);

  // Busca de alergias; quando não acha, oferece criar com o texto digitado.
  const [buscaAlergia, setBuscaAlergia] = useState("");
  const [erroNova, setErroNova] = useState<string | null>(null);
  const [criando, iniciarCriacao] = useTransition();

  const form = useForm<DadosAluno, unknown, z.output<typeof esquemaAluno>>({
    resolver: zodResolver(esquemaAluno),
    defaultValues: {
      nome: aluno?.nome ?? "",
      turma: aluno?.turma ?? "",
      observacao: aluno?.observacao ?? "",
      autorizacao_responsaveis: aluno?.autorizacao_responsaveis ?? false,
      restricoes: aluno?.restricoes ?? [],
    },
  });
  const { errors } = form.formState;
  const restricoes = useWatch({ control: form.control, name: "restricoes" }) ?? [];
  const nomeAluno = useWatch({ control: form.control, name: "nome" });
  const autorizado = useWatch({ control: form.control, name: "autorizacao_responsaveis" });

  // Libera a memória da prévia ao trocar a foto ou sair da tela.
  useEffect(() => () => { if (fotoNova) URL.revokeObjectURL(fotoNova.previa); }, [fotoNova]);

  function alterarRestricoes(proximas: DadosAluno["restricoes"]) {
    form.setValue("restricoes", proximas, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  }

  function alternarRestricao(id: string) {
    alterarRestricoes(
      restricoes.some((r) => r.tipo_restricao_id === id)
        ? restricoes.filter((r) => r.tipo_restricao_id !== id)
        : [...restricoes, { tipo_restricao_id: id, nivel: "leve" }],
    );
  }

  function mudarNivel(id: string, nivel: NivelRestricao) {
    alterarRestricoes(restricoes.map((r) => (r.tipo_restricao_id === id ? { ...r, nivel } : r)));
  }

  async function aoEscolherFoto(arquivo: File | undefined) {
    if (!arquivo) return;
    setErroFoto(null);
    setPreparandoFoto(true);
    try {
      const blob = await reduzirFoto(arquivo);
      const validacao = validarFotoAluno({ type: blob.type, size: blob.size });
      if (!validacao.ok) {
        setErroFoto(validacao.mensagem);
        return;
      }
      setFotoNova({ blob, previa: URL.createObjectURL(blob) });
      setRemoverFoto(false);
    } catch (erro) {
      setErroFoto(erro instanceof ErroFoto ? erro.message : "Não foi possível usar essa foto. Tente outra imagem.");
    } finally {
      setPreparandoFoto(false);
    }
  }

  const termo = normalizar(buscaAlergia);
  const tiposVisiveis = termo ? tipos.filter((t) => normalizar(t.nome).includes(termo)) : tipos;
  const existeIgual = tipos.some((t) => normalizar(t.nome) === termo);
  const podeCriar = termo.length > 0 && !existeIgual;

  function criarAlergia() {
    const nome = buscaAlergia.trim();
    if (criando || nome === "") return;
    setErroNova(null);
    iniciarCriacao(async () => {
      const r = await criarTipoRestricao({ nome });
      if (!r.ok || !r.dados) {
        setErroNova(r.ok ? "Não foi possível criar a alergia. Tente de novo." : (r.erros?.nome ?? r.mensagem));
        return;
      }
      const criada = r.dados;
      setTipos((atuais) => [...atuais, criada].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      alterarRestricoes([...restricoes, { tipo_restricao_id: criada.id, nivel: "leve" }]);
      setBuscaAlergia("");
      focarDepois(idCaixaRestricao(criada.id));
      toast.success(r.mensagem ?? "Alergia criada.");
    });
  }

  const enviar = form.handleSubmit((dados) => {
    setAviso(null);
    iniciar(async () => {
      const supabase = criarClienteNavegador();
      let caminhoFoto: string | null | undefined;
      if (fotoNova) {
        caminhoFoto = nomeArquivoFoto(crypto.randomUUID(), "image/jpeg");
        const { error } = await supabase.storage.from(BUCKET).upload(caminhoFoto, fotoNova.blob, { contentType: "image/jpeg" });
        if (error) {
          setAviso("Não foi possível enviar a foto. Confira a internet e tente de novo.");
          return;
        }
      } else if (removerFoto) {
        caminhoFoto = null;
      }

      let resultado: Awaited<ReturnType<typeof salvarAluno>>;
      try {
        resultado = await salvarAluno(aluno?.id ?? null, dados, caminhoFoto);
      } catch {
        if (typeof caminhoFoto === "string") await supabase.storage.from(BUCKET).remove([caminhoFoto]);
        setAviso(MSG_FALHA_REDE);
        return;
      }
      if (!resultado.ok) {
        // a action só grava a foto no último passo: se falhou, nenhum aluno aponta para ela
        if (typeof caminhoFoto === "string") await supabase.storage.from(BUCKET).remove([caminhoFoto]);
        Object.entries(resultado.erros ?? {}).forEach(([campo, mensagem]) =>
          form.setError(campo as keyof DadosAluno, { message: mensagem }),
        );
        setAviso(resultado.mensagem);
        return;
      }
      toast.success(resultado.mensagem ?? "Aluno salvo.");
      router.push(VOLTAR);
      router.refresh();
    });
  });

  function excluir() {
    if (!aluno) return;
    iniciar(async () => {
      const r = await excluirAluno(aluno.id);
      if (!r.ok) {
        setAviso(r.mensagem);
        return;
      }
      toast.success(r.mensagem ?? "Aluno excluído.");
      router.push(VOLTAR);
      router.refresh();
    });
  }

  const urlFoto = fotoNova ? fotoNova.previa : removerFoto ? null : (aluno?.fotoUrl ?? null);
  const temFoto = urlFoto !== null;
  const erroRestricoes = errors.restricoes?.message ?? errors.restricoes?.root?.message;
  const quantidadeMarcadas = restricoes.length;

  return (
    <form onSubmit={enviar} noValidate className="flex max-w-3xl flex-col gap-5">
      {aviso && <AvisoFormulario tipo="erro">{aviso}</AvisoFormulario>}

      <Etapa numero={1} id="titulo-dados" titulo="Quem é o aluno" descricao="A foto ajuda a cozinha a reconhecer o rosto na hora de servir.">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="flex flex-col items-center gap-3 sm:w-44">
            <FotoAluno url={urlFoto} nome={nomeAluno || "Aluno"} />
            <div className="flex w-full flex-col gap-2">
              <label className={classeBotaoArquivo}>
                <CameraIcon className="size-5" aria-hidden="true" />
                Tirar foto
                <input id={ID_TIRAR_FOTO} type="file" accept="image/*" capture="user" className="sr-only" disabled={preparandoFoto} onChange={(e) => { void aoEscolherFoto(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              <label className={classeBotaoArquivo}>
                <ImageIcon className="size-5" aria-hidden="true" />
                Da galeria
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={preparandoFoto} onChange={(e) => { void aoEscolherFoto(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              {temFoto && (
                <Botao type="button" variant="ghost" onClick={() => { setFotoNova(null); setRemoverFoto(true); focarDepois(ID_TIRAR_FOTO); }}>
                  <Trash2Icon className="size-5" aria-hidden="true" /> Remover foto
                </Botao>
              )}
            </div>
            {preparandoFoto && (
              <p role="status" className="flex items-center gap-2 text-sm font-medium">
                <Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Preparando foto…
              </p>
            )}
            {erroFoto && <p role="alert" className="text-center text-sm font-medium text-destructive">{erroFoto}</p>}
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <CampoTexto rotulo="Nome completo" required autoComplete="off" erro={errors.nome?.message} {...form.register("nome")} />
            <CampoTexto rotulo="Turma" autoComplete="off" ajuda="Opcional. Exemplo: 3º ano A." erro={errors.turma?.message} {...form.register("turma")} />
            <CampoTextoLongo
              rotulo="Recado para a cozinha"
              ajuda="Opcional. Exemplo: “Leva caneta de adrenalina na mochila”."
              erro={errors.observacao?.message}
              {...form.register("observacao")}
            />
          </div>
        </div>
      </Etapa>

      <Etapa
        numero={2}
        id="titulo-alergias"
        titulo="Alergias e restrições"
        descricao="Marque pelo menos uma e escolha o nível. Não achou na lista? Crie a alergia aqui mesmo."
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ID_BUSCA_ALERGIA} className="text-sm font-medium">Procurar alergia</label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id={ID_BUSCA_ALERGIA}
              type="search"
              value={buscaAlergia}
              onChange={(e) => { setBuscaAlergia(e.target.value); setErroNova(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (podeCriar && tiposVisiveis.length === 0) criarAlergia(); } }}
              placeholder="Exemplo: camarão"
              autoComplete="off"
              maxLength={80}
              aria-describedby={erroNova ? "erro-nova-alergia" : undefined}
              className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-base"
            />
          </div>
          {erroNova && <p id="erro-nova-alergia" role="alert" className="text-sm font-medium text-destructive">{erroNova}</p>}
        </div>

        {podeCriar && (
          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-primary bg-ok-fundo p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              {tiposVisiveis.length === 0 ? "Nenhuma alergia com esse nome." : "Não é nenhuma dessas?"} Crie e ela já fica marcada para este aluno.
            </p>
            <Botao type="button" onClick={criarAlergia} carregando={criando} textoCarregando="Criando…" className="shrink-0">
              <PlusIcon className="size-5" aria-hidden="true" /> Criar “{buscaAlergia.trim()}”
            </Botao>
          </div>
        )}

        {tipos.length === 0 && !podeCriar && (
          <p className="rounded-xl border border-dashed p-3 text-sm">Nenhuma alergia cadastrada ainda. Digite o nome acima para criar a primeira.</p>
        )}

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {quantidadeMarcadas === 0 ? "Nenhuma marcada" : `${quantidadeMarcadas} ${quantidadeMarcadas === 1 ? "marcada" : "marcadas"}`}
        </p>

        <ul className="flex flex-col gap-2">
          {tiposVisiveis.map((tipo) => {
            const atual = restricoes.find((r) => r.tipo_restricao_id === tipo.id);
            return (
              <li key={tipo.id} className={cn("rounded-xl border transition-colors motion-reduce:transition-none", atual ? "border-primary bg-ok-fundo" : "border-input bg-card")}>
                <label className="flex min-h-12 cursor-pointer items-center gap-3 px-3 py-2 text-base">
                  <input
                    id={idCaixaRestricao(tipo.id)}
                    type="checkbox"
                    className="size-6 shrink-0 accent-primary"
                    checked={!!atual}
                    onChange={() => alternarRestricao(tipo.id)}
                    aria-invalid={erroRestricoes ? true : undefined}
                    aria-describedby={erroRestricoes ? "erro-restricoes" : undefined}
                  />
                  <span className={cn(atual && "font-medium")}>{tipo.nome}</span>
                </label>
                {atual && (
                  <div className="border-t border-primary/0 px-3 pb-3">
                    <SeletorNivel restricao={tipo.nome} nome={`nivel-${tipo.id}`} valor={atual.nivel ?? "leve"} aoMudar={(n) => mudarNivel(tipo.id, n)} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {erroRestricoes && <p id="erro-restricoes" role="alert" className="text-sm font-medium text-destructive">{erroRestricoes}</p>}
      </Etapa>

      <Etapa numero={3} id="titulo-autorizacao" titulo="Autorização da família">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base">
          <input type="checkbox" className="size-6 shrink-0 accent-primary" {...form.register("autorizacao_responsaveis")} />
          A família autorizou o uso do nome e da foto
        </label>
        <p className="text-sm text-muted-foreground">O documento assinado fica com a direção. Aqui só registramos que ele existe.</p>
        {temFoto && !autorizado && (
          <p className="flex items-start gap-2 rounded-lg bg-alerta-fundo p-3 text-sm text-alerta-texto">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Sem autorização da família, não cadastre a foto. Confirme com a direção antes de salvar.
          </p>
        )}
      </Etapa>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Salvando…" disabled={preparandoFoto}>
          {aluno ? "Salvar alterações" : "Cadastrar aluno"}
        </Botao>
        <Botao type="button" variant="outline" onClick={() => router.push(VOLTAR)} disabled={enviando}>
          Cancelar
        </Botao>
        {aluno && podeExcluir && (
          <div className="sm:ml-auto">
            <ConfirmarExclusao nome={aluno.nome} aoConfirmar={excluir} desabilitado={enviando} />
          </div>
        )}
      </div>
    </form>
  );
}
