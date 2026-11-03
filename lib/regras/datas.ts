// Datas de domínio são strings "AAAA-MM-DD" (sem hora), como vêm do Postgres.

const DIA_EM_MS = 86_400_000;

function paraDiaUtc(data: string): number {
  const [ano, mes, dia] = data.split("-").map(Number);
  return Date.UTC(ano, mes - 1, dia);
}

// Dias de "de" até "ate" (positivo se "ate" é depois).
export function diferencaEmDias(de: string, ate: string): number {
  return Math.round((paraDiaUtc(ate) - paraDiaUtc(de)) / DIA_EM_MS);
}

// Hoje no fuso do colégio, no formato AAAA-MM-DD.
export function hojeNoColegio(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
