import type { Perfil } from "@/lib/permissoes";

export interface ItemMenu {
  href: string;
  texto: string;
  icone:
    | "painel" | "produtos" | "lotes" | "movimentacoes" | "cardapio"
    | "restricoes" | "relatorios" | "cadastros" | "usuarios" | "compras" | "configuracoes";
  // perfis que veem o item; ausente = todos
  perfis?: readonly Perfil[];
  // funcionalidade ainda em construção: aparece no menu com cadeado e não navega
  bloqueado?: boolean;
}

export const ITENS_MENU: readonly ItemMenu[] = [
  { href: "/painel", texto: "Painel", icone: "painel" },
  { href: "/produtos", texto: "Produtos", icone: "produtos" },
  { href: "/lotes", texto: "Lotes e validade", icone: "lotes" },
  { href: "/movimentacoes", texto: "Movimentações", icone: "movimentacoes" },
  { href: "/compras", texto: "Lista de compras", icone: "compras" },
  { href: "/cardapio", texto: "Cardápio", icone: "cardapio" },
  { href: "/restricoes", texto: "Restrições", icone: "restricoes" },
  { href: "/relatorios", texto: "Relatórios", icone: "relatorios" },
  { href: "/cadastros", texto: "Cadastros", icone: "cadastros" },
  { href: "/usuarios", texto: "Usuários", icone: "usuarios", perfis: ["administrador"] },
  { href: "/configuracoes", texto: "Configurações", icone: "configuracoes", perfis: ["administrador"] },
];

export function itensDoPerfil(perfil: Perfil): ItemMenu[] {
  return ITENS_MENU.filter((item) => !item.perfis || item.perfis.includes(perfil));
}
