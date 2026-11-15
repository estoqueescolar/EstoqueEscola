"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { falha, type ResultadoAcao } from "@/lib/erros";
import { exigirPermissao } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const esquemaItem = z.object({
  nome: z.string().min(1, "Informe o nome do item.").max(100),
  quantidade: z.string().min(1, "Informe a quantidade.").max(50),
  unidade: z.string().max(20).default(""),
});

export async function adicionarItemLista(dados: unknown): Promise<ResultadoAcao> {
  await exigirPermissao("movimentar");
  const v = esquemaItem.safeParse(dados);
  if (!v.success) return { ok: false, mensagem: "Confira os campos.", erros: Object.fromEntries(Object.entries(v.error.flatten().fieldErrors).map(([k, e]) => [k, e?.[0] ?? ""])) };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("lista_compras_manual").insert({ nome: v.data.nome.trim(), quantidade: v.data.quantidade.trim(), unidade: v.data.unidade.trim() });
  if (error) return falha(error);

  revalidatePath("/compras");
  return { ok: true, mensagem: "Item adicionado." };
}

export async function marcarComprado(id: string, comprado: boolean): Promise<ResultadoAcao> {
  await exigirPermissao("movimentar");
  if (!z.uuid().safeParse(id).success) return { ok: false, mensagem: "ID inválido." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("lista_compras_manual").update({ comprado }).eq("id", id);
  if (error) return falha(error);

  revalidatePath("/compras");
  return { ok: true, mensagem: "" };
}

export async function removerItemLista(id: string): Promise<ResultadoAcao> {
  await exigirPermissao("movimentar");
  if (!z.uuid().safeParse(id).success) return { ok: false, mensagem: "ID inválido." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("lista_compras_manual").delete().eq("id", id);
  if (error) return falha(error);

  revalidatePath("/compras");
  return { ok: true, mensagem: "" };
}

export async function limparComprados(): Promise<ResultadoAcao> {
  await exigirPermissao("movimentar");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("lista_compras_manual").delete().eq("comprado", true);
  if (error) return falha(error);

  revalidatePath("/compras");
  return { ok: true, mensagem: "Itens comprados removidos." };
}
