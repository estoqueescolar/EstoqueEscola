"use client";

import { CircleHelpIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTourManual } from "./TourTela";
import { TOURS } from "./tours";

// Botão flutuante ? que aparece em toda tela com tour disponível.
export function BotaoAjuda() {
  const caminho = usePathname();
  const iniciarTour = useTourManual();

  // Não exibe se a tela não tiver tour.
  if (!TOURS[caminho]?.length) return null;

  return (
    <button
      data-tour="btn-ajuda"
      onClick={iniciarTour}
      aria-label="Ver guia desta tela"
      title="Ver guia desta tela"
      className="fixed right-4 bottom-4 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:right-6 md:bottom-6"
    >
      <CircleHelpIcon className="size-6" aria-hidden="true" />
    </button>
  );
}
