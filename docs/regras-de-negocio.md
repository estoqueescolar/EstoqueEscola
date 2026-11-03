# Regras de negócio

Cada regra existe em dois lugares que precisam concordar:
- **No banco** (fonte da verdade, transacional): funções RPC em `supabase/migrations/20261103120200_lotes_e_movimentacoes.sql`.
- **Em TypeScript** (validação prévia e telas): funções puras em `lib/regras/`, testadas em `tests/regras/`.

| # | Regra | Banco | TypeScript |
|---|---|---|---|
| 1 | O estoque de um produto é a soma das quantidades dos lotes ativos. | — | `calcularEstoqueProduto` |
| 2 | Lote com quantidade zero fica inativo (coluna gerada `ativo`), mas continua no histórico. Lotes nunca são excluídos. | `lotes.ativo`, sem política de DELETE | `loteAtivo` |
| 3 | Quantidade do lote ≥ 0; validade depois da entrada; quantidade da movimentação > 0. | constraints `check` | `validarMovimentacao` |
| 4 | Entrada cria um lote (código informado ou gerado, ex.: `L261103-3F9A2`) ou acrescenta a um lote existente do mesmo produto e código, desde que a validade seja a mesma. | `registrar_entrada` | — |
| 5 | Saída usa **FEFO**: sai primeiro do lote não vencido com validade mais próxima; empate pela entrada mais antiga. Uma saída pode usar vários lotes. | `registrar_saida` | `planejarSaidaFefo`, `ordenarFefo` |
| 6 | Saída maior que o estoque disponível é bloqueada com mensagem clara. Lotes vencidos não contam como disponíveis: devem ser registrados como perda. | `registrar_saida` | `validarSaida` |
| 7 | Perda (vencido, estragado, descartado) e ajuste exigem motivo. | `validar_motivo` + constraint | `validarMovimentacao` |
| 8 | Perda e ajuste negativo não podem deixar o lote abaixo de zero. Ajuste pode aumentar ou diminuir. | `registrar_perda`, `registrar_ajuste` | `validarBaixaNoLote`, `aplicarAjuste` |
| 9 | Movimentações não podem ser editadas nem excluídas, por ninguém. Correção = novo ajuste. | gatilho `movimentacoes_imutaveis` + RLS | — |
| 10 | Toda movimentação registra data/hora, usuário, tipo, produto, lote, quantidade, local e observação. | colunas `not null` | — |
| 11 | Alerta de validade: lotes com quantidade > 0 vencidos ou vencendo em até **7 dias** (incluindo hoje). O número de dias fica em `configuracoes.dias_alerta_validade`. | `configuracoes` | `classificarValidade`, `lotesEmAlerta` |
| 12 | Estoque baixo: estoque ativo **igual ou abaixo** do estoque mínimo do produto. | — | `estoqueBaixo` |
| 13 | Lista de compras: produtos com estoque baixo, quantidade a comprar = mínimo − estoque atual (nunca negativa), fornecedor sugerido = fornecedor do produto. Ordenada pela maior falta proporcional. | — | `gerarListaCompras` |
| 14 | "Hoje" é sempre a data no fuso do colégio (America/Sao_Paulo). | `hoje()` | `hojeNoColegio` |
| 15 | Restrições alimentares guardam apenas contagens por dia e tipo, nunca nome de aluno. | sem colunas de identificação | — |
| 16 | Quem pode fazer o quê: consulta só lê; operador cadastra, edita e movimenta, mas não exclui nem gerencia usuários; administrador faz tudo. Ninguém altera o próprio perfil; sempre deve haver um administrador ativo. | RLS + `proteger_perfis` | `lib/permissoes.ts` (etapa 2) |
