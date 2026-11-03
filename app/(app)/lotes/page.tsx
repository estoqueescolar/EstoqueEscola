import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";
import { CabecalhoPagina, LinkBotao } from "@/components/comum/CabecalhoPagina";
import { CartaoLote } from "@/components/estoque/CartaoLote";
import { obterConfiguracoes } from "@/lib/dados/configuracoes";
import { listarLotes } from "@/lib/dados/lotes";
import { carregarOpcoesProduto } from "@/lib/dados/produtos";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { hojeNoColegio } from "@/lib/regras/datas";
import { classificarValidade } from "@/lib/regras/validade";
import { FiltrosLotes } from "./filtros";

export const metadata: Metadata = { title: "Lotes e validade · Despensa CAPE" };

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");
const semAcento = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default async function PaginaLotes({ searchParams }: PageProps<"/lotes">) {
  const p = await searchParams;
  const filtros = { busca: texto(p.busca), local: texto(p.local), situacao: texto(p.situacao) };
  const incluirInativos = filtros.situacao === "encerrados";
  const [usuario, config, lotes, opcoes] = await Promise.all([
    obterUsuarioAtual(),
    obterConfiguracoes(),
    listarLotes({ incluirInativos }),
    carregarOpcoesProduto(),
  ]);
  const hoje = hojeNoColegio();
  const busca = semAcento(filtros.busca);

  const lista = lotes.filter((l) => {
    if (incluirInativos && l.ativo) return false;
    if (busca && !semAcento(l.produto).includes(busca) && !semAcento(l.codigo).includes(busca)) return false;
    if (filtros.local && l.local_id !== filtros.local) return false;
    if (filtros.situacao === "vencidos" || filtros.situacao === "proximos") {
      const situacao = classificarValidade(l, hoje, config.diasAlertaValidade);
      return filtros.situacao === "vencidos" ? situacao === "vencido" : situacao === "proximo";
    }
    return true;
  });
  const filtrando = Object.values(filtros).some(Boolean);
  const plural = (n: number) => (n === 1 ? "1 lote" : `${n} lotes`);

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Lotes e validade"
        descricao="Lotes com estoque, do que vence antes para o que vence depois."
        acoes={
          pode(usuario?.perfil, "movimentar") && (
            <LinkBotao href="/lotes/entrada" principal>
              <PlusIcon className="size-5" aria-hidden="true" /> Registrar entrada
            </LinkBotao>
          )
        }
      />
      <FiltrosLotes key={JSON.stringify(filtros)} locais={opcoes.locais} valores={filtros} diasAlerta={config.diasAlertaValidade} />
      <p role="status" className="text-muted-foreground">
        {filtrando ? `${lista.length} de ${plural(lotes.length)}` : plural(lista.length)}
      </p>
      {lista.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-6 text-center text-muted-foreground">
          {filtrando ? "Nenhum lote encontrado com esses filtros." : "Nenhum lote com estoque. Registre uma entrada de mercadoria."}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((lote) => (
            <li key={lote.id}>
              <CartaoLote lote={lote} hoje={hoje} diasAlerta={config.diasAlertaValidade} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
