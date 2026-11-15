import { NextResponse } from "next/server";
import { obterUsuarioAtual } from "@/lib/permissoes";
import { ehDataValida } from "@/lib/regras/cardapio";
import { hojeNoColegio } from "@/lib/regras/datas";
import { gerarPdfRestricoes } from "@/lib/relatorios/restricoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function GET(request: Request) {
  const usuario = await obterUsuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const dataParam = searchParams.get("data") ?? "";
  const data = ehDataValida(dataParam) ? dataParam : hojeNoColegio();

  const supabase = await criarClienteServidor();
  const [{ data: tipos }, { data: contagens }] = await Promise.all([
    supabase.from("tipos_restricao").select("id, nome").order("nome"),
    supabase
      .from("contagem_restricoes")
      .select("tipo_restricao_id, tipo_refeicao, quantidade_alunos")
      .eq("data", data)
      .not("tipo_refeicao", "is", null),
  ]);

  const valores: Record<string, Record<string, number>> = {};
  for (const c of contagens ?? []) {
    if (c.tipo_refeicao) {
      valores[c.tipo_refeicao] ??= {};
      valores[c.tipo_refeicao][c.tipo_restricao_id] = c.quantidade_alunos;
    }
  }

  const bytes = gerarPdfRestricoes({
    data,
    tipos: tipos ?? [],
    valores,
    usuario: usuario.nome,
  });

  const [ano, mes, dia] = data.split("-");
  const nomeArquivo = `restricoes_${ano}${mes}${dia}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nomeArquivo}"`,
    },
  });
}
