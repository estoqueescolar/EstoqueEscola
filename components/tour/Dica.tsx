"use client";

import { CircleHelpIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  texto: string;
  lado?: "top" | "bottom" | "left" | "right";
}

// Ícone ? com tooltip para explicar campos e ações em formulários e menus.
export function Dica({ texto, lado = "top" }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Ajuda: ${texto}`}
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          >
            <CircleHelpIcon className="size-4" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={lado} className="max-w-64 text-sm">
          {texto}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
