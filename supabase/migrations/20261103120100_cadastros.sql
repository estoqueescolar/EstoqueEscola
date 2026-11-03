-- Cadastros: unidades, categorias, fornecedores, locais de armazenamento e produtos.
-- Inclui dados iniciais essenciais (unidades usuais, locais e categorias), necessários também em produção.

-- Aplica o padrão de políticas dos cadastros:
--   leitura: qualquer usuário ativo | inserção e alteração: administrador e operador | exclusão: administrador
create or replace function public.aplicar_politicas_padrao(tabela regclass)
returns void
language plpgsql
set search_path = public
as $$
begin
  execute format('alter table %s enable row level security', tabela);
  execute format(
    'create policy "leitura para usuarios ativos" on %s for select to authenticated
       using (public.perfil_atual() is not null)', tabela);
  execute format(
    'create policy "insercao por administrador e operador" on %s for insert to authenticated
       with check (public.tem_perfil(''administrador'', ''operador''))', tabela);
  execute format(
    'create policy "alteracao por administrador e operador" on %s for update to authenticated
       using (public.tem_perfil(''administrador'', ''operador''))
       with check (public.tem_perfil(''administrador'', ''operador''))', tabela);
  execute format(
    'create policy "exclusao por administrador" on %s for delete to authenticated
       using (public.tem_perfil(''administrador''))', tabela);
  execute format('revoke all on %s from anon', tabela);
end;
$$;

revoke all on function public.aplicar_politicas_padrao(regclass) from public, anon, authenticated;

-- Unidades de medida
create table public.unidades (
  id uuid primary key default gen_random_uuid(),
  sigla text not null unique check (length(trim(sigla)) between 1 and 15),
  nome text not null check (length(trim(nome)) between 1 and 60),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Categorias de alimentos
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique check (length(trim(nome)) between 1 and 60),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Fornecedores
create table public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique check (length(trim(nome)) between 1 and 120),
  telefone text check (telefone is null or length(telefone) <= 30),
  observacao text check (observacao is null or length(observacao) <= 500),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Locais de armazenamento (dispensa, freezer, geladeira e outros)
create table public.locais_armazenamento (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique check (length(trim(nome)) between 1 and 60),
  descricao text check (descricao is null or length(descricao) <= 200),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Produtos
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique check (length(trim(nome)) between 1 and 120),
  categoria_id uuid not null references public.categorias (id) on delete restrict,
  unidade_id uuid not null references public.unidades (id) on delete restrict,
  fornecedor_id uuid references public.fornecedores (id) on delete set null,
  local_padrao_id uuid not null references public.locais_armazenamento (id) on delete restrict,
  estoque_minimo numeric(12, 3) not null default 0 check (estoque_minimo >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index produtos_categoria_idx on public.produtos (categoria_id);
create index produtos_unidade_idx on public.produtos (unidade_id);
create index produtos_fornecedor_idx on public.produtos (fornecedor_id);
create index produtos_local_idx on public.produtos (local_padrao_id);

-- Gatilhos de atualizado_em e políticas
do $$
declare
  t text;
begin
  foreach t in array array['unidades', 'categorias', 'fornecedores', 'locais_armazenamento', 'produtos'] loop
    execute format(
      'create trigger %1$s_atualizado_em before update on public.%1$s
         for each row execute function public.definir_atualizado_em()', t);
    perform public.aplicar_politicas_padrao(format('public.%s', t)::regclass);
  end loop;
end;
$$;

-- Dados iniciais
insert into public.unidades (sigla, nome) values
  ('kg', 'Quilograma'), ('g', 'Grama'), ('mg', 'Miligrama'),
  ('L', 'Litro'), ('ml', 'Mililitro'), ('un', 'Unidade'),
  ('pct', 'Pacote'), ('cx', 'Caixa'), ('lt', 'Lata'), ('sc', 'Saco'),
  ('dz', 'Dúzia'), ('gf', 'Garrafa'), ('bdj', 'Bandeja'), ('fd', 'Fardo'),
  ('pt', 'Pote'), ('mc', 'Maço'), ('sch', 'Sachê'), ('gl', 'Galão');

insert into public.locais_armazenamento (nome, descricao) values
  ('Dispensa', 'Alimentos secos e enlatados, em temperatura ambiente'),
  ('Geladeira', 'Refrigerados entre 0 °C e 5 °C'),
  ('Freezer', 'Congelados a -18 °C ou menos');

insert into public.categorias (nome) values
  ('Grãos e cereais'), ('Laticínios'), ('Carnes e ovos'), ('Hortifrúti'),
  ('Enlatados e conservas'), ('Temperos e condimentos'), ('Bebidas'),
  ('Panificação e biscoitos'), ('Óleos e gorduras'), ('Limpeza de cozinha');
