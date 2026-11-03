// Quantidades têm até 3 casas decimais (numeric(12,3) no banco).
export function arredondar(quantidade: number, casas = 3): number {
  const fator = 10 ** casas;
  return Math.round(quantidade * fator) / fator;
}

// "2,5 kg" — vírgula decimal, sem zeros à direita.
export function formatarQuantidade(quantidade: number, sigla?: string): string {
  const texto = arredondar(quantidade).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
  return sigla ? `${texto} ${sigla}` : texto;
}
