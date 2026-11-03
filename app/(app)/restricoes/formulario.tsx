"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";
import { CampoTexto } from "@/components/comum/CampoTexto";
import { useEnvioFormulario } from "@/components/comum/use-envio-formulario";
import { esquemaContagens, type DadosContagens } from "@/lib/validacoes/cardapio";
import { salvarContagens } from "./actions";

interface Tipo {
  id: string;
  nome: string;
  descricao: string | null;
}

export function FormularioContagens({ data, tipos, valores }: { data: string; tipos: Tipo[]; valores: Record<string, number> }) {
  const form = useForm<DadosContagens>({
    resolver: zodResolver(esquemaContagens) as never,
    defaultValues: { data, contagens: tipos.map((t) => ({ tipo_restricao_id: t.id, quantidade_alunos: String(valores[t.id] ?? 0) })) },
  });
  const { enviar, enviando, aviso } = useEnvioFormulario(form, salvarContagens);
  const contagens = useWatch({ control: form.control, name: "contagens" });
  const total = (contagens ?? []).reduce((s, c) => s + (Number(c.quantidade_alunos) || 0), 0);

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-6">
      {aviso && <AvisoFormulario tipo={aviso.tipo}>{aviso.texto}</AvisoFormulario>}
      <div className="grid gap-4 sm:grid-cols-2">
        {tipos.map((tipo, i) => (
          <CampoTexto
            key={tipo.id}
            rotulo={tipo.nome}
            ajuda={tipo.descricao ?? undefined}
            inputMode="numeric"
            erro={form.formState.errors.contagens?.[i]?.quantidade_alunos?.message}
            {...form.register(`contagens.${i}.quantidade_alunos`)}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Total: <span className="font-medium text-foreground">{total} {total === 1 ? "aluno" : "alunos"}</span> com restrição neste dia.
      </p>
      <Botao type="submit" tamanho="principal" carregando={enviando} textoCarregando="Salvando…" className="sm:w-fit">
        Salvar contagem
      </Botao>
    </form>
  );
}
