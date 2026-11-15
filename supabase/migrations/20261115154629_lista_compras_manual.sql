-- Itens adicionados manualmente à lista de compras (além dos automáticos por estoque baixo).
-- Persistem até o usuário marcar como comprado ou excluir explicitamente.

create table public.lista_compras_manual (
  id            uuid        primary key default gen_random_uuid(),
  nome          text        not null check (length(trim(nome)) > 0),
  quantidade    text        not null check (length(trim(quantidade)) > 0),
  unidade       text        not null default '',
  comprado      boolean     not null default false,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger lista_compras_manual_atualizado_em
  before update on public.lista_compras_manual
  for each row execute function public.definir_atualizado_em();

alter table public.lista_compras_manual enable row level security;

create policy "leitura para usuarios ativos" on public.lista_compras_manual
  for select to authenticated using (public.perfil_atual() is not null);

create policy "insercao por administrador e operador" on public.lista_compras_manual
  for insert to authenticated with check (public.tem_perfil('administrador', 'operador'));

create policy "alteracao por administrador e operador" on public.lista_compras_manual
  for update to authenticated
  using  (public.tem_perfil('administrador', 'operador'))
  with check (public.tem_perfil('administrador', 'operador'));

create policy "exclusao por administrador e operador" on public.lista_compras_manual
  for delete to authenticated using (public.tem_perfil('administrador', 'operador'));
