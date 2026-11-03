-- Nome de quem registrou a movimentação, para o histórico.
-- O RLS de perfis só deixa cada pessoa ler o próprio perfil (e o administrador ler todos).
-- Em vez de abrir a tabela (e-mails e perfis), expomos SOMENTE o nome, como coluna calculada
-- do PostgREST: select("..., responsavel") em movimentacoes.

create or replace function public.responsavel(m public.movimentacoes)
returns text
language sql
stable
security definer
set search_path = public
as $$
  -- só para usuários ativos (mesma regra das demais leituras)
  -- só responde para movimentações que existem (não dá para "montar" uma linha com outro usuario_id)
  -- e nunca devolve o e-mail: sem nome cadastrado, mostra um texto genérico
  select case
    when public.perfil_atual() is null then null
    else (
      select coalesce(nullif(trim(p.nome), ''), 'Usuário sem nome')
      from public.movimentacoes mv
      join public.perfis p on p.id = mv.usuario_id
      where mv.id = m.id
    )
  end;
$$;

revoke all on function public.responsavel(public.movimentacoes) from public, anon;
grant execute on function public.responsavel(public.movimentacoes) to authenticated;
