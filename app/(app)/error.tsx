"use client";

import { AvisoFormulario } from "@/components/comum/AvisoFormulario";
import { Botao } from "@/components/comum/Botao";

export default function ErroTela({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">Não foi possível abrir esta tela</h1>
      <AvisoFormulario tipo="erro">
        Pode ser a internet ou o servidor. Toque em “Tentar novamente”; se continuar, avise a diretora.
      </AvisoFormulario>
      <div>
        <Botao onClick={reset}>Tentar novamente</Botao>
      </div>
    </div>
  );
}
