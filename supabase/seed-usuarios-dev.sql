-- SOMENTE PARA DESENVOLVIMENTO LOCAL (supabase db reset).
-- Cria três usuários de demonstração, um por perfil. NÃO rode este arquivo em produção:
-- lá o primeiro administrador é criado conforme docs/manual-de-instalacao.md.
-- Senha de todos: Senha@Local123

do $$
declare
  u record;
begin
  -- Proteção: só cria os usuários demo num banco sem nenhum usuário (banco local recém-recriado).
  -- Se o banco já tem contas (ex.: produção com o administrador real), não faz nada.
  if exists (select 1 from auth.users) then
    raise notice 'Banco já possui usuários: usuários de demonstração NÃO foram criados.';
    return;
  end if;

  for u in
    select * from (values
      ('00000000-0000-4000-a000-000000000001'::uuid, 'diretora@colegio.local', 'Diretora (demo)', 'administrador'),
      ('00000000-0000-4000-a000-000000000002'::uuid, 'cozinha@colegio.local', 'Funcionária da cozinha (demo)', 'operador'),
      ('00000000-0000-4000-a000-000000000003'::uuid, 'consulta@colegio.local', 'Consulta (demo)', 'consulta')
    ) as t (id, email, nome, perfil)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
      extensions.crypt('Senha@Local123', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('nome', u.nome), now(), now(),
      '', '', '', ''
    );

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), u.id, u.id::text,
            jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
            'email', now(), now(), now());

    -- o gatilho criou o perfil como "consulta"; aqui definimos o perfil de demonstração
    update public.perfis set perfil = u.perfil where id = u.id;
  end loop;
end;
$$;
