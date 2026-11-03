// Opções de perfil para os formulários (sem "server-only": usado no cliente).
export const OPCOES_PERFIL = [
  { valor: "operador", texto: "Operador(a) da cozinha — registra estoque" },
  { valor: "consulta", texto: "Consulta — só visualiza" },
  { valor: "administrador", texto: "Administrador(a) — acesso total" },
] as const;
