"use client";

import { useState, useTransition } from "react";
import { CircleCheckIcon, CircleSlashIcon } from "lucide-react";
import { toast } from "sonner";
import { Botao } from "@/components/comum/Botao";
import { CampoSelecao } from "@/components/comum/CampoSelecao";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ResultadoAcao } from "@/lib/erros";
import type { Perfil } from "@/lib/permissoes";
import { alterarPerfil, definirAcesso } from "./actions";
import { OPCOES_PERFIL } from "./opcoes";

export interface LinhaUsuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo: boolean;
  souEu: boolean;
}

function avisar(resultado: ResultadoAcao) {
  if (resultado.ok) toast.success(resultado.mensagem ?? "Alteração salva.");
  else toast.error(resultado.mensagem, { duration: Infinity, closeButton: true });
}

function CartaoUsuario({ usuario }: { usuario: LinhaUsuario }) {
  const [perfil, setPerfil] = useState<Perfil>(usuario.perfil);
  const [salvando, iniciar] = useTransition();
  const mudou = perfil !== usuario.perfil;
  const nome = usuario.nome || usuario.email;

  const salvarPerfil = () => iniciar(async () => avisar(await alterarPerfil({ id: usuario.id, perfil })));
  const trocarAcesso = () => iniciar(async () => avisar(await definirAcesso({ id: usuario.id, ativo: !usuario.ativo })));

  return (
    <li className="flex flex-col gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold">
          {nome} {usuario.souEu && <span className="font-normal text-muted-foreground">(você)</span>}
        </p>
        <p className="truncate text-muted-foreground">{usuario.email}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
          {usuario.ativo ? (
            <><CircleCheckIcon className="size-4 text-primary" aria-hidden="true" /> Acesso ativo</>
          ) : (
            <><CircleSlashIcon className="size-4 text-destructive" aria-hidden="true" /> Acesso desativado</>
          )}
        </p>
      </div>

      {usuario.souEu ? (
        <p className="text-sm text-muted-foreground md:max-w-56">Seu perfil só pode ser alterado por outro administrador.</p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-72">
            <CampoSelecao
              rotulo="Perfil"
              aria-label={`Perfil de ${nome}`}
              opcoes={OPCOES_PERFIL}
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as Perfil)}
              disabled={salvando}
            />
          </div>
          <Botao onClick={salvarPerfil} disabled={!mudou} carregando={salvando && mudou} textoCarregando="Salvando…">
            Salvar perfil
          </Botao>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Botao variant={usuario.ativo ? "destructive" : "outline"} disabled={salvando}>
                {usuario.ativo ? "Desativar acesso" : "Reativar acesso"}
              </Botao>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{usuario.ativo ? `Desativar o acesso de ${nome}?` : `Reativar o acesso de ${nome}?`}</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  {usuario.ativo
                    ? "A pessoa não vai mais conseguir entrar. O histórico de movimentações dela continua guardado."
                    : "A pessoa volta a entrar com o mesmo e-mail e senha."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="bg-muted">
                <AlertDialogCancel className="min-h-11 text-base">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="min-h-11 text-base"
                  variant={usuario.ativo ? "destructive" : "default"}
                  onClick={trocarAcesso}
                >
                  {usuario.ativo ? "Desativar acesso" : "Reativar acesso"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </li>
  );
}

export function ListaUsuarios({ usuarios }: { usuarios: readonly LinhaUsuario[] }) {
  if (!usuarios.length) return <p className="text-muted-foreground">Nenhuma conta cadastrada ainda.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {usuarios.map((usuario) => (
        <CartaoUsuario key={usuario.id} usuario={usuario} />
      ))}
    </ul>
  );
}
