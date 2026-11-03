---
name: criar-migracao
description: Use ao criar ou alterar tabelas, colunas, constraints, políticas RLS, funções/RPC SQL ou o seed do Supabase neste projeto. Define nomenclatura das migrações, colunas padrão, RLS obrigatório e políticas por perfil (administrador, operador, consulta).
---

# Criar migração no Supabase

## 1. Arquivo
- Gere com `npx supabase migration new <descricao_em_snake_case>`.
- Nome resultante: `supabase/migrations/AAAAMMDDHHMMSS_<descricao>.sql`
  (ex.: `20261104120000_criar_lotes.sql`). Uma intenção por migração.
- Nunca edite uma migração já aplicada no remoto: crie outra.
- Comentários em português no topo explicando o objetivo.

## 2. Estrutura padrão de tabela
```sql
create table public.<nome_plural> (
  id uuid primary key default gen_random_uuid(),
  -- colunas de domínio em português sem acentos
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger <nome>_atualizado_em
  before update on public.<nome>
  for each row execute function public.definir_atualizado_em();
```
- `definir_atualizado_em()` é criada uma única vez na primeira migração.
- Chaves estrangeiras sempre com `references ... on delete restrict` (histórico não some).
  Use `on delete cascade` apenas onde a filha não tem sentido sozinha e não é histórico.
- Crie índice para toda FK e para colunas filtradas com frequência (ex.: `lotes(produto_id, data_validade)`).

## 3. Constraints obrigatórias
- `not null` em tudo que é obrigatório no domínio; `check` para nomes não vazios (`length(trim(nome)) > 0`).
- `unique` em nomes de cadastros auxiliares (categoria, unidade.sigla, local).
- Domínio do projeto:
  - `lotes.quantidade >= 0`
  - `lotes.data_validade > lotes.data_entrada`
  - `movimentacoes.quantidade > 0`
  - `movimentacoes.tipo in ('entrada','saida','perda','ajuste')`
  - `motivo` obrigatório quando `tipo in ('perda','ajuste')`
- Enumerações pequenas: `check (... in (...))` ou tabela de referência — nunca texto livre.

## 4. RLS (obrigatório em TODA tabela nova)
```sql
alter table public.<nome> enable row level security;
```
Use as funções auxiliares (criadas na migração de perfis, `security definer`, `stable`):
- `public.perfil_atual()` → texto do perfil do usuário logado (`null` se desativado).
- `public.tem_perfil(variadic perfis text[])` → boolean.

Para cadastros comuns use `select public.aplicar_politicas_padrao('public.<tabela>');` — ela ativa o RLS
e cria as quatro políticas abaixo. Escreva políticas à mão só quando a regra for diferente.

Políticas separadas por operação e perfil, com nome descritivo em português:
```sql
create policy "leitura para usuarios ativos" on public.<nome>
  for select to authenticated using (public.perfil_atual() is not null);

create policy "insercao por administrador e operador" on public.<nome>
  for insert to authenticated with check (public.tem_perfil('administrador','operador'));

create policy "alteracao por administrador e operador" on public.<nome>
  for update to authenticated
  using (public.tem_perfil('administrador','operador'))
  with check (public.tem_perfil('administrador','operador'));

create policy "exclusao por administrador" on public.<nome>
  for delete to authenticated using (public.tem_perfil('administrador'));
```
Regras específicas:
- `movimentacoes`: **sem** política de update/delete, `revoke insert` e gatilho que bloqueia UPDATE/DELETE.
- `lotes`: `revoke insert/update` + `grant update (colunas de dados)`; quantidade só muda pelas RPCs
  `registrar_entrada/saida/perda/ajuste` (`security definer`, chamam `exigir_operador()` no início).
- `perfis`: usuário lê o próprio; administrador lê e altera todos. Ninguém altera o próprio perfil.
- `consulta` nunca recebe insert/update/delete.
- Nunca use `to anon` em tabelas de domínio.
- Novos perfis: adicionar o valor no check de `perfis.perfil` e incluí-lo nas chamadas de `tem_perfil` — sem reescrever tabelas.

## 5. Funções SQL
- `security definer` apenas quando necessário, sempre com `set search_path = public` e checagem de perfil no início.
- Erros de negócio com `raise exception using errcode = 'P0001', message = '<mensagem em português para o usuário>'`.

## 6. Depois de migrar
1. Atualize `supabase/seed.sql` se a estrutura mudou (o seed deve rodar após todas as migrações).
2. Rode `npx supabase db reset` e confirme que migrações + seed passam do zero.
3. Atualize/adicione testes em `tests/rls/` e rode `npm run test:rls` (consulta não insere nem altera).
   Datas de negócio: use `public.hoje()`, nunca `current_date` (o banco roda em UTC).
4. Atualize `docs/diagramas/` (ER) se tabela ou relacionamento mudou.
5. Chame o agent `revisor-seguranca`.
