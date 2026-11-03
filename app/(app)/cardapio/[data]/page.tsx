import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/comum/CabecalhoPagina";
import { obterUsuarioAtual, pode } from "@/lib/permissoes";
import { ehDataValida, inicioDaSemana, nomeDoDia, REFEICOES } from "@/lib/regras/cardapio";
import { formatarData } from "@/lib/regras/datas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioDiaCardapio } from "./formulario";

export const metadata: Metadata = { title: "Editar cardápio · Despensa CAPE" };

export default async function PaginaEditarDia({ params }: PageProps<"/cardapio/[data]">) {
  const { data } = await params;
  if (!ehDataValida(data)) notFound();
  const usuario = await obterUsuarioAtual();
  if (!pode(usuario?.perfil, "cadastrar")) redirect("/cardapio");

  const supabase = await criarClienteServidor();
  const { data: itens } = await supabase.from("cardapio_planejado").select("tipo_refeicao, descricao").eq("data", data);
  const valores = Object.fromEntries(REFEICOES.map(({ tipo }) => [tipo, itens?.find((i) => i.tipo_refeicao === tipo)?.descricao ?? ""]));

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo={`${nomeDoDia(data)}, ${formatarData(data)}`}
        descricao="Escreva o que será servido em cada refeição. Deixe em branco o que ainda não foi definido."
        voltar={{ href: `/cardapio?semana=${inicioDaSemana(data)}`, texto: "Cardápio da semana" }}
      />
      <FormularioDiaCardapio data={data} valores={valores} />
    </div>
  );
}
