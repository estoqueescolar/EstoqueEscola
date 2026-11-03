// Dados do cabeçalho comuns ao PDF e ao XLSX.
export interface MetadadosRelatorio {
  colegio: string;
  inicio: string; // AAAA-MM-DD
  fim: string;
  emitidoEm: Date;
  usuario: string;
}

export const SEM_REGISTROS = "Nenhum registro encontrado no período.";
export const COR_PRIMARIA: [number, number, number] = [47, 107, 79]; // --primary #2F6B4F
export const COR_PRIMARIA_HEX = "FF2F6B4F";

const dataBr = (d: string) => d.split("-").reverse().join("/");

export const textoPeriodo = (m: MetadadosRelatorio) => `${dataBr(m.inicio)} a ${dataBr(m.fim)}`;

export const textoEmissao = (m: MetadadosRelatorio) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(m.emitidoEm);

export const nomeArquivo = (tipo: string, m: MetadadosRelatorio, formato: "pdf" | "xlsx") => `${tipo}_${m.inicio}_${m.fim}.${formato}`;
