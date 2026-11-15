import { NextResponse, type NextRequest } from "next/server";
import { obterUsuarioAtual } from "@/lib/permissoes";
import { carregarSituacaoEstoque } from "@/lib/dados/painel";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { gerarPdfListaCompras, gerarXlsxListaCompras, type ItemListaPdf } from "@/lib/relatorios/lista-compras";
import { formatarQuantidade } from "@/lib/regras/quantidades";

export const maxDuration = 20;

export async function GET(req: NextRequest) {
  const usuario = await obterUsuarioAtual();
  if (!usuario) return NextResponse.redirect(new URL("/login", req.url), 303);

  const formato = req.nextUrl.searchParams.get("formato") === "xlsx" ? "xlsx" : "pdf";

  const supabase = await criarClienteServidor();
  const [{ listaCompras }, { data: extras }] = await Promise.all([
    carregarSituacaoEstoque(),
    supabase.from("lista_compras_manual").select("nome, quantidade, unidade").eq("comprado", false).order("criado_em"),
  ]);

  const itens: ItemListaPdf[] = [
    ...listaCompras.map((i) => ({
      nome: i.nome,
      quantidade: formatarQuantidade(i.quantidade_a_comprar, i.sigla_unidade),
      unidade: "",
      fornecedor: i.fornecedor ?? undefined,
      telefone: i.telefone_fornecedor ?? undefined,
      extra: false,
    })),
    ...(extras ?? []).map((i) => ({
      nome: i.nome,
      quantidade: i.quantidade,
      unidade: i.unidade,
      extra: true,
    })),
  ];

  const nomeUsuario = usuario.nome || usuario.email;
  const nomeArq = `lista_compras_${new Date().toISOString().slice(0, 10)}.${formato}`;

  if (formato === "xlsx") {
    const bytes = await gerarXlsxListaCompras(itens, nomeUsuario);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nomeArq}"`,
      },
    });
  }

  const bytes = gerarPdfListaCompras(itens, nomeUsuario);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeArq}"`,
    },
  });
}
