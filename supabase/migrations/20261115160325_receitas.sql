-- Caderno de receitas da cozinha: cada receita tem ingredientes vinculados a produtos do estoque.
-- Integração A: "Preparar" sugere saída FEFO dos ingredientes.
-- Integração B: cardapio_planejado pode referenciar uma receita para alerta de estoque.

-- Receitas
create table public.receitas (
  id            uuid        primary key default gen_random_uuid(),
  nome          text        not null check (length(trim(nome)) > 0),
  descricao     text,
  modo_preparo  text,
  porcoes_base  integer     not null default 1 check (porcoes_base > 0),
  ativo         boolean     not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (nome)
);

create trigger receitas_atualizado_em
  before update on public.receitas
  for each row execute function public.definir_atualizado_em();

alter table public.receitas enable row level security;

create policy "leitura para usuarios ativos" on public.receitas
  for select to authenticated using (public.perfil_atual() is not null);

create policy "insercao por administrador e operador" on public.receitas
  for insert to authenticated with check (public.tem_perfil('administrador', 'operador'));

create policy "alteracao por administrador e operador" on public.receitas
  for update to authenticated
  using  (public.tem_perfil('administrador', 'operador'))
  with check (public.tem_perfil('administrador', 'operador'));

create policy "exclusao por administrador" on public.receitas
  for delete to authenticated using (public.tem_perfil('administrador'));

-- Ingredientes da receita (quantidade relativa a porcoes_base)
create table public.ingredientes_receita (
  id          uuid        primary key default gen_random_uuid(),
  receita_id  uuid        not null references public.receitas(id) on delete cascade,
  produto_id  uuid        not null references public.produtos(id) on delete restrict,
  quantidade  numeric     not null check (quantidade > 0),
  observacao  text,
  criado_em   timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (receita_id, produto_id)
);

create index ingredientes_receita_receita_id_idx on public.ingredientes_receita(receita_id);
create index ingredientes_receita_produto_id_idx on public.ingredientes_receita(produto_id);

create trigger ingredientes_receita_atualizado_em
  before update on public.ingredientes_receita
  for each row execute function public.definir_atualizado_em();

alter table public.ingredientes_receita enable row level security;

create policy "leitura para usuarios ativos" on public.ingredientes_receita
  for select to authenticated using (public.perfil_atual() is not null);

create policy "insercao por administrador e operador" on public.ingredientes_receita
  for insert to authenticated with check (public.tem_perfil('administrador', 'operador'));

create policy "alteracao por administrador e operador" on public.ingredientes_receita
  for update to authenticated
  using  (public.tem_perfil('administrador', 'operador'))
  with check (public.tem_perfil('administrador', 'operador'));

create policy "exclusao por administrador e operador" on public.ingredientes_receita
  for delete to authenticated using (public.tem_perfil('administrador', 'operador'));

-- Vincula cardápio a uma receita (nullable: nem todo item de cardápio tem receita)
alter table public.cardapio_planejado
  add column receita_id uuid references public.receitas(id) on delete set null;

create index cardapio_planejado_receita_id_idx on public.cardapio_planejado(receita_id);
