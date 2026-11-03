// Marca de "sessão aberta pelo link de recuperação". Sem ela, /redefinir-senha não troca a senha:
// evita que alguém com uma sessão já aberta (ex.: tablet da cozinha) troque a senha de outra pessoa.
export const COOKIE_RECUPERACAO = "recuperacao_senha";
export const VALIDADE_RECUPERACAO_SEGUNDOS = 15 * 60;
