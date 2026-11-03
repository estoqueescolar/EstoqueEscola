-- Base do sistema: função de atualizado_em, tabela de perfis vinculada a auth.users
-- e funções auxiliares de permissão usadas por todas as políticas de RLS.

-- Atualiza a coluna atualizado_em em todo UPDATE.
create or replace function public.definir_atualizado_em()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- Perfis de acesso. Para criar um novo perfil no futuro, basta incluir o valor
-- no check abaixo e nas chamadas de tem_perfil() das políticas desejadas.
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '' check (length(nome) <= 120),
  email text not null check (length(email) <= 254),
  perfil text not null default 'consulta'
    check (perfil in ('administrador', 'operador', 'consulta')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index perfis_perfil_idx on public.perfis (perfil) where ativo;

create trigger perfis_atualizado_em
  before update on public.perfis
  for each row execute function public.definir_atualizado_em();

-- Perfil do usuário logado; null se não houver perfil ou se estiver desativado.
create or replace function public.perfil_atual()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.perfil from public.perfis p where p.id = auth.uid() and p.ativo;
$$;

-- Verdadeiro se o usuário logado possui algum dos perfis informados.
create or replace function public.tem_perfil(variadic perfis_aceitos text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.perfil_atual() = any (perfis_aceitos), false);
$$;

revoke all on function public.perfil_atual() from public, anon;
revoke all on function public.tem_perfil(text[]) from public, anon;
grant execute on function public.perfil_atual() to authenticated;
grant execute on function public.tem_perfil(text[]) to authenticated;

-- Todo usuário novo (cadastro público ou criado pelo administrador) nasce como "consulta".
-- O perfil NUNCA é lido dos metadados enviados pelo navegador, para evitar escalada de privilégio.
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome, email, perfil)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'nome', ''), 120),
    coalesce(new.email, ''),
    'consulta'
  );
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

-- Proteções: ninguém altera o próprio perfil/ativo, e o sistema nunca fica sem administrador ativo.
create or replace function public.proteger_perfis()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and new.id = auth.uid()
     and (new.perfil is distinct from old.perfil or new.ativo is distinct from old.ativo) then
    raise exception using errcode = 'P0001',
      message = 'Você não pode alterar o seu próprio perfil ou desativar a sua própria conta.';
  end if;

  if old.perfil = 'administrador' and old.ativo
     and (new.perfil <> 'administrador' or not new.ativo)
     and (select count(*) from public.perfis where perfil = 'administrador' and ativo) <= 1 then
    raise exception using errcode = 'P0001',
      message = 'Este é o único administrador ativo. Defina outro administrador antes de alterar este.';
  end if;

  new.email := old.email; -- e-mail é mantido em sincronia com auth.users, não editável aqui
  return new;
end;
$$;

create trigger perfis_proteger
  before update on public.perfis
  for each row execute function public.proteger_perfis();

-- RLS
alter table public.perfis enable row level security;

create policy "usuario le o proprio perfil" on public.perfis
  for select to authenticated using (id = auth.uid());

create policy "administrador le todos os perfis" on public.perfis
  for select to authenticated using (public.tem_perfil('administrador'));

create policy "administrador altera perfis" on public.perfis
  for update to authenticated
  using (public.tem_perfil('administrador'))
  with check (public.tem_perfil('administrador'));

-- Sem políticas de insert/delete: perfis nascem pelo gatilho e somem com o usuário.
revoke insert, delete on public.perfis from anon, authenticated;
revoke all on public.perfis from anon;
