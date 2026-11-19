-- Corrige "Não foi possível concluir" ao salvar a contagem de restrições por refeição.
-- A tela grava com upsert (on_conflict data,tipo_refeicao,tipo_restricao_id), e o Postgres só usa
-- um índice único para isso se ele NÃO for parcial. O índice anterior tinha "where tipo_refeicao is not null",
-- então o erro era: "there is no unique or exclusion constraint matching the ON CONFLICT specification".
--
-- No índice único comum, NULL é sempre distinto: as linhas antigas, sem refeição, não conflitam entre si
-- aqui (elas continuam protegidas pelo outro índice, contagem_por_data_tipo_sem_refeicao).

drop index if exists public.contagem_por_data_refeicao_tipo;

create unique index contagem_por_data_refeicao_tipo
  on public.contagem_restricoes (data, tipo_refeicao, tipo_restricao_id);
