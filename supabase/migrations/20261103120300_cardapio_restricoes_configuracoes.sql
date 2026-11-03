-- Cardápio planejado, restrições alimentares (apenas contagens, sem identificar alunos) e configurações.

create table public.cardapio_planejado (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  tipo_refeicao text not null
    check (tipo_refeicao in ('cafe_da_manha', 'lanche_da_manha', 'almoco', 'lanche_da_tarde')),
  descricao text not null check (length(trim(descricao)) between 1 and 1000),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint cardapio_uma_refeicao_por_tipo unique (data, tipo_refeicao)
);

create table public.tipos_restricao (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique check (length(trim(nome)) between 1 and 80),
  descricao text check (descricao is null or length(descricao) <= 300),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Contagem diária de alunos por restrição. Não há coluna para nome ou identificação de aluno.
create table public.contagem_restricoes (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  tipo_restricao_id uuid not null references public.tipos_restricao (id) on delete restrict,
  quantidade_alunos integer not null check (quantidade_alunos between 0 and 2000),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint contagem_uma_por_tipo_e_dia unique (data, tipo_restricao_id)
);

create index contagem_restricoes_tipo_idx on public.contagem_restricoes (tipo_restricao_id);

do $$
declare
  t text;
begin
  foreach t in array array['cardapio_planejado', 'tipos_restricao', 'contagem_restricoes'] loop
    execute format(
      'create trigger %1$s_atualizado_em before update on public.%1$s
         for each row execute function public.definir_atualizado_em()', t);
    perform public.aplicar_politicas_padrao(format('public.%s', t)::regclass);
  end loop;
end;
$$;

-- Configurações do sistema (chave/valor). Só o administrador altera.
create table public.configuracoes (
  id uuid primary key default gen_random_uuid(),
  chave text not null unique check (chave ~ '^[a-z_]{1,60}$'),
  valor jsonb not null,
  descricao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger configuracoes_atualizado_em
  before update on public.configuracoes
  for each row execute function public.definir_atualizado_em();

alter table public.configuracoes enable row level security;

create policy "leitura para usuarios ativos" on public.configuracoes
  for select to authenticated using (public.perfil_atual() is not null);

create policy "alteracao por administrador" on public.configuracoes
  for update to authenticated
  using (public.tem_perfil('administrador'))
  with check (public.tem_perfil('administrador'));

revoke all on public.configuracoes from anon;
revoke insert, delete on public.configuracoes from authenticated;

insert into public.configuracoes (chave, valor, descricao) values
  ('dias_alerta_validade', '7', 'Quantos dias antes do vencimento o lote aparece no alerta de validade'),
  ('nome_colegio', '"Colégio Exemplo"', 'Nome do colégio exibido no cabeçalho dos relatórios');
