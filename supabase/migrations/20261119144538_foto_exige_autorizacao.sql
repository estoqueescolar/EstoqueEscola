-- Foto de aluno só com autorização da família registrada (LGPD, art. 14: dado de criança exige
-- consentimento dos responsáveis). Decisão do usuário em 19/11/2026: bloquear, não só avisar.

-- Fotos já gravadas sem autorização deixam de ser referenciadas (o arquivo é apagado pela aplicação).
update public.alunos set foto_caminho = null where foto_caminho is not null and not autorizacao_responsaveis;

alter table public.alunos
  add constraint foto_exige_autorizacao check (foto_caminho is null or autorizacao_responsaveis);
