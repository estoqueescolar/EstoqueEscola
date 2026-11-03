"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRightIcon, BoxesIcon, CalendarDaysIcon, FileTextIcon, HouseIcon,
  ArchiveIcon, LockIcon, MenuIcon, PackageIcon, XIcon, UsersIcon, UtensilsIcon, ShoppingBasketIcon, SlidersHorizontalIcon, TagsIcon,
} from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Botao } from "./Botao";
import { cn } from "@/lib/utils";
import type { ItemMenu } from "./navegacao";

const ICONES: Record<ItemMenu["icone"], typeof HouseIcon> = {
  painel: HouseIcon,
  produtos: PackageIcon,
  lotes: BoxesIcon,
  movimentacoes: ArrowLeftRightIcon,
  cardapio: CalendarDaysIcon,
  restricoes: UtensilsIcon,
  relatorios: FileTextIcon,
  cadastros: TagsIcon,
  compras: ShoppingBasketIcon,
  configuracoes: SlidersHorizontalIcon,
  usuarios: UsersIcon,
};

function ativo(caminho: string, href: string) {
  return caminho === href || caminho.startsWith(`${href}/`);
}

function Lista({ itens, aoNavegar }: { itens: readonly ItemMenu[]; aoNavegar?: () => void }) {
  const caminho = usePathname();
  return (
    <ul className="flex flex-col gap-1">
      {itens.map((item) => {
        const Icone = ICONES[item.icone];
        const atual = ativo(caminho, item.href);
        if (item.bloqueado) {
          return (
            <li key={item.href}>
              <span
                aria-disabled="true"
                className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-lg px-3 text-base font-medium text-muted-foreground select-none"
              >
                <Icone className="size-5 shrink-0" aria-hidden="true" />
                <span className="flex-1">{item.texto}</span>
                <LockIcon className="size-4 shrink-0 text-destructive" aria-hidden="true" />
                <span className="rounded-full bg-perigo-fundo px-2 py-0.5 text-xs font-medium text-destructive">Em breve</span>
              </span>
            </li>
          );
        }
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={aoNavegar}
              aria-current={atual ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-base font-medium",
                atual ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent",
              )}
            >
              <Icone className="size-5 shrink-0" aria-hidden="true" />
              {item.texto}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

interface Props {
  itens: readonly ItemMenu[];
  // mostrado dentro da gaveta, já que no celular o cabeçalho não tem espaço
  usuario?: { nome: string; perfil: string };
  // "lateral": lista fixa (telas >= 1024px); "gaveta": botão "Menu" que abre uma gaveta (telas menores)
  modo: "lateral" | "gaveta";
}

export function MenuPrincipal({ itens, modo, usuario }: Props) {
  const [aberto, setAberto] = useState(false);
  if (modo === "lateral") {
    return (
      <nav aria-label="Menu principal">
        <Lista itens={itens} />
      </nav>
    );
  }
  return (
    <>
      <div className="lg:hidden">
        <Sheet open={aberto} onOpenChange={setAberto}>
          <SheetTrigger className="flex min-h-11 items-center gap-2 rounded-lg border border-input bg-card px-3 text-base font-medium">
            <MenuIcon className="size-5" aria-hidden="true" />
            Menu
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="w-72 bg-background p-4">
            <SheetHeader className="flex-row items-center justify-between p-0 pb-2">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <ArchiveIcon className="size-5 text-primary" aria-hidden="true" /> Despensa CAPE
              </SheetTitle>
              <SheetClose asChild>
                <Botao tamanho="icone" variant="ghost" aria-label="Fechar menu">
                  <XIcon className="size-6" aria-hidden="true" />
                </Botao>
              </SheetClose>
            </SheetHeader>
            {usuario && (
              <p className="mb-3 rounded-lg bg-card p-3 text-sm leading-tight">
                <span className="block font-medium">{usuario.nome}</span>
                <span className="text-muted-foreground">{usuario.perfil}</span>
              </p>
            )}
            <nav aria-label="Menu principal">
              <Lista itens={itens} aoNavegar={() => setAberto(false)} />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
