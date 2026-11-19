-- Alunos com restrição alimentar: nome, foto e as restrições de cada um.
-- Objetivo: a cozinha identifica pelo rosto e pelo nome quem tem cada restrição.
-- ATENÇÃO (LGPD): são dados pessoais de crianças e dado de saúde. Leitura só para usuários
-- ativos; escrita só para administrador e operador; fotos em bucket PRIVADO.
-- A contagem diária (contagem_restricoes) continua separada e inalterada.

create table public.alunos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) between 1 and 120),
  turma text check (turma is null or length(trim(turma)) between 1 and 40),
  -- Nome do arquivo no bucket privado "fotos-alunos" (nunca uma URL pública).
  -- Formato fixo "<uuid>.<jpg|png|webp>", sem pastas nem "..".
  foto_caminho text check (foto_caminho is null or foto_caminho ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$'),
  observacao text check (observacao is null or length(observacao) <= 500),
  -- Controle da direção: a autorização dos responsáveis foi registrada fora do sistema.
  autorizacao_responsaveis boolean not null default false,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index alunos_ativo_nome_idx on public.alunos (ativo, nome);

create trigger alunos_atualizado_em
  before update on public.alunos
  for each row execute function public.definir_atualizado_em();

-- Um aluno pode ter várias restrições. A linha não tem sentido sem o aluno: cascade.
create table public.alunos_restricoes (
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  tipo_restricao_id uuid not null references public.tipos_restricao (id) on delete restrict,
  -- Reação grave (ex.: anafilaxia): a interface destaca com cor, ícone e texto.
  grave boolean not null default false,
  criado_em timestamptz not null default now(),
  primary key (aluno_id, tipo_restricao_id)
);

create index alunos_restricoes_tipo_idx on public.alunos_restricoes (tipo_restricao_id);

-- Visitante sem login nunca toca nesses dados; o RLS é a segunda barreira, não a única.
revoke all on public.alunos, public.alunos_restricoes from anon;

-- RLS: tabela de alunos
alter table public.alunos enable row level security;

create policy "leitura para usuarios ativos" on public.alunos
  for select to authenticated using (public.perfil_atual() is not null);

create policy "insercao por administrador e operador" on public.alunos
  for insert to authenticated with check (public.tem_perfil('administrador', 'operador'));

create policy "alteracao por administrador e operador" on public.alunos
  for update to authenticated
  using (public.tem_perfil('administrador', 'operador'))
  with check (public.tem_perfil('administrador', 'operador'));

create policy "exclusao por administrador" on public.alunos
  for delete to authenticated using (public.tem_perfil('administrador'));

-- RLS: restrições do aluno (editar o cadastro troca o conjunto, então operador também remove)
alter table public.alunos_restricoes enable row level security;

create policy "leitura para usuarios ativos" on public.alunos_restricoes
  for select to authenticated using (public.perfil_atual() is not null);

create policy "insercao por administrador e operador" on public.alunos_restricoes
  for insert to authenticated with check (public.tem_perfil('administrador', 'operador'));

create policy "alteracao por administrador e operador" on public.alunos_restricoes
  for update to authenticated
  using (public.tem_perfil('administrador', 'operador'))
  with check (public.tem_perfil('administrador', 'operador'));

create policy "exclusao por administrador e operador" on public.alunos_restricoes
  for delete to authenticated using (public.tem_perfil('administrador', 'operador'));

-- Storage: bucket privado, 2 MB, só imagens. Acesso por URL assinada gerada no servidor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-alunos', 'fotos-alunos', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "fotos de alunos: leitura para usuarios ativos" on storage.objects
  for select to authenticated
  using (bucket_id = 'fotos-alunos' and public.perfil_atual() is not null);

create policy "fotos de alunos: envio por administrador e operador" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'fotos-alunos'
    and name ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$'
    and public.tem_perfil('administrador', 'operador')
  );

create policy "fotos de alunos: troca por administrador e operador" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos-alunos' and public.tem_perfil('administrador', 'operador'))
  with check (
    bucket_id = 'fotos-alunos'
    and name ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$'
    and public.tem_perfil('administrador', 'operador')
  );

create policy "fotos de alunos: exclusao por administrador e operador" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos-alunos' and public.tem_perfil('administrador', 'operador'));
