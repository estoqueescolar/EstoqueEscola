-- Nível da restrição de cada aluno: leve, média ou grave (antes era só "grave" sim/não).
-- A cozinha usa o nível para decidir o cuidado no preparo e no serviço.
-- Também impede que dois alunos apontem para o mesmo arquivo de foto (revisão de segurança, etapa 3).

alter table public.alunos_restricoes
  add column nivel text not null default 'leve' check (nivel in ('leve', 'media', 'grave'));

update public.alunos_restricoes set nivel = 'grave' where grave;

alter table public.alunos_restricoes drop column grave;

create unique index alunos_foto_caminho_unico on public.alunos (foto_caminho) where foto_caminho is not null;
