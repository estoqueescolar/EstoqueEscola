import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PencilIcon } from "lucide-react";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { calcularEstoqueProduto } from "@/lib/regras/estoque";
import { FormularioReceita } from "../formulario";
import { GerenciarIngredientes } from "../ingredientes";
import { PrepararReceita } from "../preparar";

export const metadata: Metadata = { title: "Receita · Despensa CAPE" };

export default async function PaginaReceita({ params }: PageProps<"/receitas/[id]">) {
  const { id } = await params;
  const supabase = await criarClienteServidor();

  const [usuario, { data: receita }, { data: produtos }] = await Promise.all([
    obterUsuarioAtual(),
    supabase
      .from("receitas")
      .select("id, nome, descricao, modo_preparo, porcoes_base, ativo, ingredientes_receita(id, produto_id, quantidade, observacao, produtos(nome, unidades(sigla)))")
      .eq("id", id)
      .single(),
    supabase
      .from("produtos")
      .select("id, nome, unidades(sigla), lotes(quantidade)")
      .eq("ativo", true)
      .order("nome"),
  ]);

  if (!receita) notFound();

  const podeEditar = pode(usuario?.perfil, "movimentar");
  const podeDesativar = pode(usuario?.perfil, "cadastrar");

  // Calcula estoque para cada produto (soma dos lotes ativos)
  const estoquePorProduto = new Map<string, number>(
    (produtos ?? []).map((p) => [
      p.id,
      calcularEstoqueProduto((p.lotes ?? []).map((l) => ({ quantidade: l.quantidade }))),
    ]),
  );

  const listaProdutos = (produtos ?? []).map((p) => ({
    valor: p.id,
    texto: p.nome,
    sigla: (p.unidades as { sigla: string } | null)?.sigla ?? "",
    estoque: estoquePorProduto.get(p.id) ?? 0,
  }));

  const ingredientes = (receita.ingredientes_receita ?? []) as {
    id: string; produto_id: string; quantidade: number; observacao: string | null;
    produtos: { nome: string; unidades: { sigla: string } | null } | null;
  }[];

  const ingredientesComEstoque = ingredientes.map((ing) => ({
    ...ing,
    estoque: estoquePorProduto.get(ing.produto_id) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-8">
      <CabecalhoPagina
        titulo={receita.nome}
        descricao={receita.ativo ? undefined : "Esta receita está desativada."}
        voltar={{ href: "/receitas", texto: "Voltar para receitas" }}
      />

      {/* Modo de preparo */}
      {receita.modo_preparo && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Modo de preparo</h2>
          <div className="whitespace-pre-wrap rounded-xl border bg-card p-4 text-sm leading-relaxed">
            {receita.modo_preparo}
          </div>
        </section>
      )}

      {/* Ingredientes */}
      <GerenciarIngredientes
        receitaId={receita.id}
        ingredientes={ingredientes}
        produtos={listaProdutos}
        porcoes_base={receita.porcoes_base}
        podeEditar={podeEditar}
      />

      {/* Preparar receita — Integração A */}
      {podeEditar && receita.ativo && (
        <PrepararReceita
          receitaId={receita.id}
          nome={receita.nome}
          porcoes_base={receita.porcoes_base}
          ingredientes={ingredientesComEstoque}
        />
      )}

      {/* Editar receita */}
      {podeEditar && (
        <section className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <PencilIcon className="size-5" aria-hidden="true" /> Editar receita
          </h2>
          <FormularioReceita receita={receita} />
          {podeDesativar && receita.ativo && (
            <form action={async () => { "use server"; const { desativarReceita } = await import("../actions"); await desativarReceita(id); }}>
              <button type="submit" className="text-sm font-medium text-destructive underline underline-offset-4 hover:no-underline">
                Desativar receita
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
