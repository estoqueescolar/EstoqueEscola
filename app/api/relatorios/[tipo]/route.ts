import { NextResponse, type NextRequest } from "next/server";
import { obterConfiguracoes } from "@/lib/dados/configuracoes";
import { obterUsuarioAtual } from "@/lib/permissoes";
import { carregarConteudo } from "@/lib/relatorios/dados";
import { nomeArquivo, type MetadadosRelatorio } from "@/lib/relatorios/metadados";
import { gerarPdf } from "@/lib/relatorios/pdf";
import { gerarXlsx } from "@/lib/relatorios/xlsx";
import { esquemaPedidoRelatorio } from "@/lib/validacoes/relatorios";

const TIPOS_CONTEUDO = {
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
} as const;

// Qualquer perfil logado pode gerar (consulta inclusive); os dados passam pelo RLS da sessão.
export async function GET(requisicao: NextRequest, { params }: RouteContext<"/api/relatorios/[tipo]">) {
  const usuario = await obterUsuarioAtual();
  if (!usuario) return NextResponse.json({ mensagem: "Entre novamente para gerar relatórios." }, { status: 401 });

  const busca = requisicao.nextUrl.searchParams;
  const pedido = esquemaPedidoRelatorio.safeParse({
    tipo: (await params).tipo,
    formato: busca.get("formato"),
    inicio: busca.get("inicio"),
    fim: busca.get("fim"),
  });
  if (!pedido.success) return NextResponse.json({ mensagem: pedido.error.issues[0]?.message ?? "Pedido inválido." }, { status: 400 });
  const { tipo, formato, inicio, fim } = pedido.data;

  try {
    const [conteudo, config] = await Promise.all([carregarConteudo(tipo, inicio, fim), obterConfiguracoes()]);
    const meta: MetadadosRelatorio = { colegio: config.nomeColegio, inicio, fim, emitidoEm: new Date(), usuario: usuario.nome || "Usuário" };
    const arquivo = formato === "pdf" ? gerarPdf(conteudo, meta) : await gerarXlsx(conteudo, meta);
    return new NextResponse(Buffer.from(arquivo), {
      headers: {
        "Content-Type": TIPOS_CONTEUDO[formato],
        "Content-Disposition": `attachment; filename="${nomeArquivo(tipo, meta, formato)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ mensagem: "Não foi possível gerar o relatório. Tente de novo." }, { status: 500 });
  }
}
