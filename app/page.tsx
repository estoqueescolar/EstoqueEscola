import { redirect } from "next/navigation";

// A raiz leva ao painel; sem sessão, o proxy.ts manda para o login.
export default function Inicio() {
  redirect("/painel");
}
