-- Lotes, movimentações e as funções RPC que são o ÚNICO caminho para alterar quantidades.
-- Decisão: RPC transacional (em vez de trigger) porque concentra FEFO, bloqueio de saída e
-- mensagens em português num só lugar, é chamada diretamente nos testes e roda numa transação.

-- Data de hoje no fuso do colégio (o banco do Supabase roda em UTC).
create or replace function public.hoje()
returns date
language sql
stable
set search_path = public
as $$
  select (now() at time zone 'America/Sao_Paulo')::date;
$$;

-- Quantidade no formato brasileiro, sem zeros à direita (ex.: 2,5).
create or replace function public.formatar_quantidade(q numeric)
returns text
language sql
immutable
set search_path = public
as $$
  select replace(trim_scale(q)::text, '.', ',');
$$;

-- Lotes
create table public.lotes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null check (length(trim(codigo)) between 1 and 40),
  produto_id uuid not null references public.produtos (id) on delete restrict,
  quantidade numeric(12, 3) not null check (quantidade >= 0),
  quantidade_inicial numeric(12, 3) not null check (quantidade_inicial > 0),
  data_entrada date not null default public.hoje(),
  data_validade date not null,
  fornecedor_id uuid references public.fornecedores (id) on delete set null,
  local_id uuid not null references public.locais_armazenamento (id) on delete restrict,
  observacao text check (observacao is null or length(observacao) <= 500),
  -- lote com quantidade zero fica inativo, mas permanece no histórico
  ativo boolean generated always as (quantidade > 0) stored,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint lotes_validade_apos_entrada check (data_validade > data_entrada),
  constraint lotes_codigo_unico_por_produto unique (produto_id, codigo)
);

create index lotes_produto_validade_idx on public.lotes (produto_id, data_validade) where quantidade > 0;
create index lotes_validade_idx on public.lotes (data_validade) where quantidade > 0;
create index lotes_fornecedor_idx on public.lotes (fornecedor_id);
create index lotes_local_idx on public.lotes (local_id);

create trigger lotes_atualizado_em
  before update on public.lotes
  for each row execute function public.definir_atualizado_em();

alter table public.lotes enable row level security;

create policy "leitura para usuarios ativos" on public.lotes
  for select to authenticated using (public.perfil_atual() is not null);

create policy "alteracao de dados do lote por administrador e operador" on public.lotes
  for update to authenticated
  using (public.tem_perfil('administrador', 'operador'))
  with check (public.tem_perfil('administrador', 'operador'));

-- Inserção e quantidade só pelas RPCs; nada de exclusão (histórico).
revoke all on public.lotes from anon;
revoke insert, update, delete on public.lotes from authenticated;
grant update (codigo, data_validade, fornecedor_id, local_id, observacao) on public.lotes to authenticated;

-- Movimentações (imutáveis)
create table public.movimentacoes (
  id uuid primary key default gen_random_uuid(),
  -- agrupa as linhas de uma mesma operação (uma saída FEFO pode usar vários lotes)
  operacao_id uuid not null default gen_random_uuid(),
  tipo text not null check (tipo in ('entrada', 'saida', 'perda', 'ajuste')),
  -- +1 aumenta o estoque, -1 diminui
  sentido smallint not null check (sentido in (1, -1)),
  produto_id uuid not null references public.produtos (id) on delete restrict,
  lote_id uuid not null references public.lotes (id) on delete restrict,
  quantidade numeric(12, 3) not null check (quantidade > 0),
  local_id uuid not null references public.locais_armazenamento (id) on delete restrict,
  usuario_id uuid not null references public.perfis (id) on delete restrict,
  motivo text check (motivo is null or length(motivo) <= 300),
  observacao text check (observacao is null or length(observacao) <= 500),
  data_hora timestamptz not null default now(),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint movimentacoes_sentido_coerente check (
    (tipo = 'entrada' and sentido = 1)
    or (tipo in ('saida', 'perda') and sentido = -1)
    or tipo = 'ajuste'
  ),
  constraint movimentacoes_motivo_obrigatorio check (
    tipo not in ('perda', 'ajuste') or length(trim(coalesce(motivo, ''))) > 0
  )
);

create index movimentacoes_data_idx on public.movimentacoes (data_hora desc);
create index movimentacoes_produto_idx on public.movimentacoes (produto_id, data_hora desc);
create index movimentacoes_lote_idx on public.movimentacoes (lote_id);
create index movimentacoes_local_idx on public.movimentacoes (local_id);
create index movimentacoes_usuario_idx on public.movimentacoes (usuario_id);
create index movimentacoes_tipo_data_idx on public.movimentacoes (tipo, data_hora);

-- Bloqueia edição e exclusão para qualquer papel, inclusive o dono do banco.
create or replace function public.impedir_alteracao_movimentacao()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception using errcode = 'P0001',
    message = 'Movimentações não podem ser editadas nem excluídas. Para corrigir, registre um ajuste.';
end;
$$;

create trigger movimentacoes_imutaveis
  before update or delete on public.movimentacoes
  for each row execute function public.impedir_alteracao_movimentacao();

alter table public.movimentacoes enable row level security;

create policy "leitura para usuarios ativos" on public.movimentacoes
  for select to authenticated using (public.perfil_atual() is not null);

revoke all on public.movimentacoes from anon;
revoke insert, update, delete, truncate on public.movimentacoes from authenticated;

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

create or replace function public.exigir_operador()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.tem_perfil('administrador', 'operador') then
    raise exception using errcode = 'P0001',
      message = 'Seu perfil não permite registrar movimentações. Peça acesso à diretora.';
  end if;
end;
$$;

create or replace function public.validar_quantidade(q numeric)
returns void
language plpgsql
immutable
set search_path = public
as $$
begin
  if q is null or q <= 0 then
    raise exception using errcode = 'P0001',
      message = 'Informe uma quantidade maior que zero.';
  end if;
end;
$$;

create or replace function public.validar_motivo(m text)
returns void
language plpgsql
immutable
set search_path = public
as $$
begin
  if length(trim(coalesce(m, ''))) = 0 then
    raise exception using errcode = 'P0001',
      message = 'Informe o motivo. Ele é obrigatório para perdas e ajustes.';
  end if;
end;
$$;

-- Entrada: cria um lote novo ou acrescenta a um lote existente do mesmo produto e código.
create or replace function public.registrar_entrada(
  p_produto_id uuid,
  p_quantidade numeric,
  p_data_validade date,
  p_codigo text default null,
  p_data_entrada date default null,
  p_fornecedor_id uuid default null,
  p_local_id uuid default null,
  p_observacao text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_produto public.produtos;
  v_lote public.lotes;
  v_entrada date := coalesce(p_data_entrada, public.hoje());
  v_codigo text := nullif(trim(coalesce(p_codigo, '')), '');
begin
  perform public.exigir_operador();
  perform public.validar_quantidade(p_quantidade);

  select * into v_produto from public.produtos where id = p_produto_id and ativo;
  if not found then
    raise exception using errcode = 'P0001', message = 'Produto não encontrado ou inativo.';
  end if;

  if p_data_validade is null or p_data_validade <= v_entrada then
    raise exception using errcode = 'P0001',
      message = 'A data de validade deve ser depois da data de entrada.';
  end if;

  if v_codigo is not null then
    select * into v_lote from public.lotes
      where produto_id = p_produto_id and codigo = v_codigo
      for update;
  end if;

  if v_lote.id is not null then
    if v_lote.data_validade <> p_data_validade then
      raise exception using errcode = 'P0001',
        message = format('O lote %s já existe com validade %s. Confira a validade ou use outro código de lote.',
                         v_codigo, to_char(v_lote.data_validade, 'DD/MM/YYYY'));
    end if;
    update public.lotes set quantidade = quantidade + p_quantidade where id = v_lote.id;
  else
    v_codigo := coalesce(v_codigo,
      'L' || to_char(v_entrada, 'YYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 5)));
    insert into public.lotes (codigo, produto_id, quantidade, quantidade_inicial, data_entrada,
                              data_validade, fornecedor_id, local_id, observacao)
    values (v_codigo, p_produto_id, p_quantidade, p_quantidade, v_entrada, p_data_validade,
            coalesce(p_fornecedor_id, v_produto.fornecedor_id),
            coalesce(p_local_id, v_produto.local_padrao_id),
            nullif(trim(coalesce(p_observacao, '')), ''))
    returning * into v_lote;
  end if;

  insert into public.movimentacoes (tipo, sentido, produto_id, lote_id, quantidade, local_id, usuario_id, observacao)
  values ('entrada', 1, p_produto_id, v_lote.id, p_quantidade, v_lote.local_id, auth.uid(),
          nullif(trim(coalesce(p_observacao, '')), ''));

  return v_lote.id;
end;
$$;

-- Saída para consumo pelo método FEFO: retira dos lotes não vencidos com validade mais próxima.
-- Bloqueia quando a quantidade pedida é maior que o estoque disponível.
create or replace function public.registrar_saida(
  p_produto_id uuid,
  p_quantidade numeric,
  p_observacao text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_produto record;
  v_lote record;
  v_disponivel numeric := 0;
  v_vencido numeric := 0;
  v_restante numeric := p_quantidade;
  v_retirar numeric;
  v_operacao uuid := gen_random_uuid();
  v_resultado jsonb := '[]'::jsonb;
  v_mensagem text;
begin
  perform public.exigir_operador();
  perform public.validar_quantidade(p_quantidade);

  select p.id, p.nome, u.sigla into v_produto
    from public.produtos p join public.unidades u on u.id = p.unidade_id
    where p.id = p_produto_id;
  if not found then
    raise exception using errcode = 'P0001', message = 'Produto não encontrado.';
  end if;

  -- trava os lotes do produto para evitar duas saídas simultâneas do mesmo estoque
  perform 1 from public.lotes where produto_id = p_produto_id and quantidade > 0 for update;

  select coalesce(sum(quantidade) filter (where data_validade >= public.hoje()), 0),
         coalesce(sum(quantidade) filter (where data_validade < public.hoje()), 0)
    into v_disponivel, v_vencido
    from public.lotes where produto_id = p_produto_id and quantidade > 0;

  if p_quantidade > v_disponivel then
    v_mensagem := format('Estoque insuficiente de %s: há %s %s disponíveis e você tentou retirar %s %s.',
      v_produto.nome, public.formatar_quantidade(v_disponivel), v_produto.sigla,
      public.formatar_quantidade(p_quantidade), v_produto.sigla);
    if v_vencido > 0 then
      v_mensagem := v_mensagem || format(' Há também %s %s em lotes vencidos, que devem ser registrados como perda.',
        public.formatar_quantidade(v_vencido), v_produto.sigla);
    end if;
    raise exception using errcode = 'P0001',
      message = v_mensagem || ' Confira a quantidade ou registre uma entrada antes.';
  end if;

  for v_lote in
    select id, codigo, quantidade, local_id from public.lotes
      where produto_id = p_produto_id and quantidade > 0 and data_validade >= public.hoje()
      order by data_validade, data_entrada, criado_em
  loop
    exit when v_restante <= 0;
    v_retirar := least(v_lote.quantidade, v_restante);

    update public.lotes set quantidade = quantidade - v_retirar where id = v_lote.id;
    insert into public.movimentacoes (operacao_id, tipo, sentido, produto_id, lote_id, quantidade,
                                      local_id, usuario_id, observacao)
    values (v_operacao, 'saida', -1, p_produto_id, v_lote.id, v_retirar, v_lote.local_id, auth.uid(),
            nullif(trim(coalesce(p_observacao, '')), ''));

    v_resultado := v_resultado || jsonb_build_object('lote_id', v_lote.id, 'codigo', v_lote.codigo,
                                                     'quantidade', v_retirar);
    v_restante := v_restante - v_retirar;
  end loop;

  return v_resultado;
end;
$$;

-- Perda (vencido, estragado, descartado) de um lote específico.
create or replace function public.registrar_perda(
  p_lote_id uuid,
  p_quantidade numeric,
  p_motivo text,
  p_observacao text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lote record;
  v_id uuid;
begin
  perform public.exigir_operador();
  perform public.validar_quantidade(p_quantidade);
  perform public.validar_motivo(p_motivo);

  select l.*, u.sigla into v_lote
    from public.lotes l
    join public.produtos p on p.id = l.produto_id
    join public.unidades u on u.id = p.unidade_id
    where l.id = p_lote_id
    for update of l;
  if not found then
    raise exception using errcode = 'P0001', message = 'Lote não encontrado.';
  end if;

  if p_quantidade > v_lote.quantidade then
    raise exception using errcode = 'P0001',
      message = format('O lote %s tem apenas %s %s. Informe uma quantidade de perda igual ou menor.',
        v_lote.codigo, public.formatar_quantidade(v_lote.quantidade), v_lote.sigla);
  end if;

  update public.lotes set quantidade = quantidade - p_quantidade where id = p_lote_id;
  insert into public.movimentacoes (tipo, sentido, produto_id, lote_id, quantidade, local_id, usuario_id, motivo, observacao)
  values ('perda', -1, v_lote.produto_id, p_lote_id, p_quantidade, v_lote.local_id, auth.uid(),
          trim(p_motivo), nullif(trim(coalesce(p_observacao, '')), ''))
  returning id into v_id;

  return v_id;
end;
$$;

-- Ajuste de inventário (positivo ou negativo) em um lote específico.
create or replace function public.registrar_ajuste(
  p_lote_id uuid,
  p_quantidade numeric,
  p_sentido smallint,
  p_motivo text,
  p_observacao text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lote record;
  v_id uuid;
begin
  perform public.exigir_operador();
  perform public.validar_quantidade(p_quantidade);
  perform public.validar_motivo(p_motivo);

  if p_sentido is null or p_sentido not in (1, -1) then
    raise exception using errcode = 'P0001',
      message = 'Escolha se o ajuste aumenta ou diminui o estoque.';
  end if;

  select l.*, u.sigla into v_lote
    from public.lotes l
    join public.produtos p on p.id = l.produto_id
    join public.unidades u on u.id = p.unidade_id
    where l.id = p_lote_id
    for update of l;
  if not found then
    raise exception using errcode = 'P0001', message = 'Lote não encontrado.';
  end if;

  if p_sentido = -1 and p_quantidade > v_lote.quantidade then
    raise exception using errcode = 'P0001',
      message = format('O lote %s tem apenas %s %s. Um ajuste negativo não pode deixar o lote abaixo de zero.',
        v_lote.codigo, public.formatar_quantidade(v_lote.quantidade), v_lote.sigla);
  end if;

  update public.lotes set quantidade = quantidade + (p_sentido * p_quantidade) where id = p_lote_id;
  insert into public.movimentacoes (tipo, sentido, produto_id, lote_id, quantidade, local_id, usuario_id, motivo, observacao)
  values ('ajuste', p_sentido, v_lote.produto_id, p_lote_id, p_quantidade, v_lote.local_id, auth.uid(),
          trim(p_motivo), nullif(trim(coalesce(p_observacao, '')), ''))
  returning id into v_id;

  return v_id;
end;
$$;

-- Permissões de execução: apenas usuários autenticados (o perfil é checado dentro de cada função).
revoke all on function public.exigir_operador() from public, anon;
revoke all on function public.registrar_entrada(uuid, numeric, date, text, date, uuid, uuid, text) from public, anon;
revoke all on function public.registrar_saida(uuid, numeric, text) from public, anon;
revoke all on function public.registrar_perda(uuid, numeric, text, text) from public, anon;
revoke all on function public.registrar_ajuste(uuid, numeric, smallint, text, text) from public, anon;

grant execute on function public.registrar_entrada(uuid, numeric, date, text, date, uuid, uuid, text) to authenticated;
grant execute on function public.registrar_saida(uuid, numeric, text) to authenticated;
grant execute on function public.registrar_perda(uuid, numeric, text, text) to authenticated;
grant execute on function public.registrar_ajuste(uuid, numeric, smallint, text, text) to authenticated;
