-- O sistema é entregue ao CAPE: nome exibido no cabeçalho dos relatórios.
-- Só troca o valor de exemplo, para não sobrescrever um nome já ajustado pela direção.
update public.configuracoes
   set valor = to_jsonb('CAPE - Centro de Apoio Pedagógico Especializado'::text)
 where chave = 'nome_colegio' and valor = to_jsonb('Colégio Exemplo'::text);
