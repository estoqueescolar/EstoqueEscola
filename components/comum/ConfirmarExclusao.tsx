"use client";

import { Trash2Icon } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Botao } from "./Botao";

interface Props {
  nome: string;
  aoConfirmar: () => void;
  desabilitado?: boolean;
}

// Botão "Excluir" com confirmação. Só aparece para quem pode excluir (o servidor confere de novo).
export function ConfirmarExclusao({ nome, aoConfirmar, desabilitado }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Botao variant="destructive" disabled={desabilitado} aria-label={`Excluir ${nome}`}>
          <Trash2Icon className="size-5" aria-hidden="true" />
          Excluir
        </Botao>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir “{nome}”?</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Esta ação não pode ser desfeita. Se o cadastro estiver em uso, o sistema não deixa excluir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-muted">
          <AlertDialogCancel className="min-h-11 text-base">Cancelar</AlertDialogCancel>
          <AlertDialogAction className="min-h-11 text-base" variant="destructive" onClick={aoConfirmar}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
