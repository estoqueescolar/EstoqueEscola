"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { TOURS, TOUR_BOAS_VINDAS } from "./tours";

// Chaves de localStorage
const CHAVE_BOAS_VINDAS = "cape_tour_boas_vindas_visto";
const chaveTour = (rota: string) => `cape_tour_${rota.replace(/\//g, "_")}_visto`;

function criarDriver(aoFim?: () => void) {
  let d: ReturnType<typeof driver>;
  d = driver({
    showProgress: true,
    nextBtnText: "Próximo →",
    prevBtnText: "← Anterior",
    doneBtnText: "Entendi!",
    progressText: "{{current}} de {{total}}",
    smoothScroll: true,
    overlayColor: "rgb(0,0,0)",
    overlayOpacity: 0.4,
    onDestroyStarted: () => {
      aoFim?.();
      d.destroy();
    },
  });
  return d;
}

// Hook exportado: usado pelo botão ? no layout para iniciar o tour manualmente.
export function useTourManual() {
  const caminho = usePathname();

  return useCallback(() => {
    const passos = TOURS[caminho];
    if (!passos?.length) return;

    const d = criarDriver(() => {
      localStorage.setItem(chaveTour(caminho), "1");
    });
    d.setSteps(passos.map((p) => ({ element: p.element, popover: p.popover })));
    d.drive();
  }, [caminho]);
}

// Componente montado no layout: dispara o tour automático na primeira visita.
export function TourAutomatico() {
  const caminho = usePathname();

  useEffect(() => {
    // Tour de boas-vindas: exibido uma única vez em toda a sessão de primeiro acesso.
    const boasVindasVisto = localStorage.getItem(CHAVE_BOAS_VINDAS);
    if (!boasVindasVisto) {
      const d = criarDriver(() => {
        localStorage.setItem(CHAVE_BOAS_VINDAS, "1");
        // Depois das boas-vindas, mostra o tour da tela atual se houver.
        mostrarTourTela(caminho);
      });
      d.setSteps(TOUR_BOAS_VINDAS.map((p) => ({ element: p.element, popover: p.popover })));
      // Pequeno atraso para a página carregar completamente antes de iniciar.
      const id = setTimeout(() => d.drive(), 800);
      return () => clearTimeout(id);
    }

    // Tour da tela: exibido uma vez por rota.
    const visto = localStorage.getItem(chaveTour(caminho));
    if (!visto) {
      const id = setTimeout(() => mostrarTourTela(caminho), 600);
      return () => clearTimeout(id);
    }
  }, [caminho]);

  return null;
}

function mostrarTourTela(caminho: string) {
  const passos = TOURS[caminho];
  if (!passos?.length) return;

  const d = criarDriver(() => {
    localStorage.setItem(chaveTour(caminho), "1");
  });
  d.setSteps(passos.map((p) => ({ element: p.element, popover: p.popover })));
  d.drive();
}
