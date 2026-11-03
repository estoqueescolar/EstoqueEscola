---
name: regras-de-negocio
description: Use ao implementar ou alterar qualquer cálculo de estoque, validade, saída (FEFO), perda, ajuste, estoque baixo ou lista de compras. Toda regra deve existir como função pura em lib/regras/ com teste Vitest em tests/regras/.
---

# Regras de negócio

Fonte da verdade: `docs/regras-de-negocio.md`. Se mudar uma regra, atualize esse arquivo, a função e o teste juntos.

## Princípio
- Cada regra é uma **função pura** em `lib/regras/` (sem Supabase, sem `Date.now()` implícito:
  a data de referência `hoje` entra como parâmetro).
- Cada função tem teste em `tests/regras/<arquivo>.test.ts` cobrindo caso normal, limites e erro.
- O banco (RPCs `registrar_entrada/saida/perda/ajuste`) aplica as mesmas regras de forma transacional;
  as funções puras são usadas no servidor para validar antes e na interface para pré-visualizar.
- Quantidades são `number` com até 3 casas decimais; compare com tolerância/arredondamento (`arredondar(q, 3)`).

## Regras e funções esperadas
| Regra | Função | Arquivo |
|---|---|---|
| Estoque do produto = soma dos lotes ativos (quantidade > 0) | `calcularEstoqueProduto(lotes)` | `estoque.ts` |
| Lote com quantidade 0 é inativo (permanece no histórico) | `loteAtivo(lote)` | `estoque.ts` |
| Saída por FEFO: ordenar lotes ativos por `data_validade` asc (empate: `data_entrada` asc) e consumir em sequência, podendo dividir entre lotes | `planejarSaidaFefo(lotes, quantidade)` → `{ lote_id, quantidade }[]` | `fefo.ts` |
| Bloquear saída/perda maior que o disponível | `validarSaida(estoqueDisponivel, quantidade)` → `{ ok } \| { ok:false, mensagem }` | `fefo.ts` |
| Lotes vencidos não entram na saída FEFO por padrão (saída de vencido deve ser registrada como perda) | dentro de `planejarSaidaFefo` | `fefo.ts` |
| Perda e ajuste exigem motivo não vazio | `validarMovimentacao(mov)` | `movimentacoes.ts` |
| Ajuste pode ser positivo ou negativo (campo `sentido`); ajuste negativo não pode deixar lote < 0 | `aplicarAjuste(lote, quantidade, sentido)` | `movimentacoes.ts` |
| Movimentações imutáveis: não há função de editar/excluir | — (garantido por RLS; teste em `tests/rls`) | — |
| Validade próxima: `0 <= dias até vencer <= diasAlerta` (padrão 7, vem de `configuracoes`) | `classificarValidade(lote, hoje, diasAlerta)` → `'vencido' \| 'proximo' \| 'ok'` | `validade.ts` |
| Vencido: `data_validade < hoje` e quantidade > 0 | idem | `validade.ts` |
| Estoque baixo: estoque ativo `<=` estoque mínimo | `estoqueBaixo(estoque, minimo)` | `estoque.ts` |
| Lista de compras: produtos com estoque baixo; `faltam = max(minimo - estoque, 0)`; fornecedor sugerido = fornecedor do produto ou do lote mais recente | `gerarListaCompras(produtos, lotes)` | `compras.ts` |

## Mensagens
Mensagens de erro em português, dizendo o que aconteceu e como resolver. Ex.:
`"Estoque insuficiente: há 3,5 kg de Arroz disponíveis e você tentou retirar 5 kg. Confira a quantidade ou registre uma entrada antes."`
Use o formatador `formatarQuantidade(q, sigla)` (vírgula decimal, pt-BR).

## Checklist ao alterar uma regra
1. Escreva/ajuste o teste primeiro (deve falhar).
2. Implemente a função pura.
3. Garanta que a RPC SQL aplica a mesma regra (ver skill `criar-migracao`).
4. `npm test` verde.
5. Atualize `docs/regras-de-negocio.md` e, se aplicável, `docs/manual-de-uso.md`.
