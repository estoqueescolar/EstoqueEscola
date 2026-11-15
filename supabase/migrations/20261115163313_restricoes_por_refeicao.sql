-- Adiciona tipo_refeicao em contagem_restricoes para permitir registros
-- separados por refeição (café da manhã, lanche da manhã, almoço, lanche da tarde).

alter table public.contagem_restricoes
  drop constraint contagem_uma_por_tipo_e_dia;

alter table public.contagem_restricoes
  add column tipo_refeicao text check (
    tipo_refeicao is null or
    tipo_refeicao in ('cafe_manha', 'lanche_manha', 'almoco', 'lanche_tarde')
  );

-- Registros novos (com refeição): unique por data + refeição + tipo.
create unique index contagem_por_data_refeicao_tipo
  on public.contagem_restricoes (data, tipo_refeicao, tipo_restricao_id)
  where tipo_refeicao is not null;

-- Registros legados (sem refeição): mantém a constraint original.
create unique index contagem_por_data_tipo_sem_refeicao
  on public.contagem_restricoes (data, tipo_restricao_id)
  where tipo_refeicao is null;
