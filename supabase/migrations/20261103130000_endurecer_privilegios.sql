-- Endurecimento apontado pelo revisor-seguranca (etapa 1).

-- TRUNCATE/TRIGGER/REFERENCES vêm dos privilégios padrão do Supabase e não passam pelo RLS.
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke truncate, trigger, references on tables from anon, authenticated;

-- perfis: o administrador altera apenas nome, perfil e ativo.
revoke update on public.perfis from authenticated;
grant update (nome, perfil, ativo) on public.perfis to authenticated;

-- Funções auxiliares não precisam ser executadas por visitantes.
revoke execute on all functions in schema public from public, anon;
alter default privileges in schema public revoke execute on functions from public, anon;
grant execute on function public.perfil_atual(), public.tem_perfil(text[]), public.hoje(),
  public.formatar_quantidade(numeric) to authenticated;
grant execute on function
  public.registrar_entrada(uuid, numeric, date, text, date, uuid, uuid, text),
  public.registrar_saida(uuid, numeric, text),
  public.registrar_perda(uuid, numeric, text, text),
  public.registrar_ajuste(uuid, numeric, smallint, text, text)
  to authenticated;

-- Quantidade: no máximo 3 casas decimais e dentro do limite da coluna, com mensagem em português.
create or replace function public.validar_quantidade(q numeric)
returns void
language plpgsql
immutable
set search_path = public
as $$
begin
  if q is null or q <= 0 then
    raise exception using errcode = 'P0001', message = 'Informe uma quantidade maior que zero.';
  end if;
  if q <> round(q, 3) then
    raise exception using errcode = 'P0001', message = 'Use no máximo 3 casas decimais na quantidade.';
  end if;
  if q >= 1000000000 then
    raise exception using errcode = 'P0001', message = 'Quantidade muito grande. Confira o valor digitado.';
  end if;
end;
$$;

revoke execute on function public.validar_quantidade(numeric) from public, anon;
