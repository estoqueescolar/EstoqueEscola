-- Dados de exemplo de um colégio com ~158 alunos/dia.
-- Datas são relativas a hoje(), para que os alertas sempre apareçam: há lotes vencidos,
-- lotes vencendo em até 7 dias, produtos abaixo do estoque mínimo e um lote zerado (inativo).
-- Pré-requisito: existir ao menos um perfil administrador ou operador (autor das movimentações).

-- Fornecedores
insert into public.fornecedores (nome, telefone, observacao) values
  ('Distribuidora Grão Bom', '(11) 3333-1001', 'Entrega às terças. Pedido mínimo de R$ 300.'),
  ('Laticínios Serra Verde', '(11) 3333-1002', 'Entrega refrigerada às segundas e quintas.'),
  ('Frigorífico Boa Carne', '(11) 3333-1003', 'Carnes congeladas com nota de inspeção (SIF).'),
  ('Hortifrúti do Ceasa', '(11) 98888-1004', 'Entrega diária até as 7h.'),
  ('Atacadão Escolar', '(11) 3333-1005', 'Enlatados, temperos, bebidas e limpeza.'),
  ('Padaria Pão Quente', '(11) 3333-1006', 'Pães e biscoitos.');

-- Produtos
insert into public.produtos (nome, categoria_id, unidade_id, fornecedor_id, local_padrao_id, estoque_minimo)
select p.nome, c.id, u.id, f.id, l.id, p.minimo
from (values
  ('Arroz branco tipo 1',        'Grãos e cereais',         'kg',  'Distribuidora Grão Bom', 'Dispensa',  30),
  ('Feijão carioca',             'Grãos e cereais',         'kg',  'Distribuidora Grão Bom', 'Dispensa',  15),
  ('Feijão preto',               'Grãos e cereais',         'kg',  'Distribuidora Grão Bom', 'Dispensa',   8),
  ('Macarrão espaguete',         'Grãos e cereais',         'kg',  'Distribuidora Grão Bom', 'Dispensa',  10),
  ('Macarrão parafuso',          'Grãos e cereais',         'kg',  'Distribuidora Grão Bom', 'Dispensa',   8),
  ('Farinha de trigo',           'Grãos e cereais',         'kg',  'Distribuidora Grão Bom', 'Dispensa',  10),
  ('Fubá',                       'Grãos e cereais',         'kg',  'Distribuidora Grão Bom', 'Dispensa',   5),
  ('Aveia em flocos',            'Grãos e cereais',         'kg',  'Distribuidora Grão Bom', 'Dispensa',   3),
  ('Flocão de milho (cuscuz)',   'Grãos e cereais',         'kg',  'Distribuidora Grão Bom', 'Dispensa',   4),
  ('Açúcar cristal',             'Grãos e cereais',         'kg',  'Distribuidora Grão Bom', 'Dispensa',  10),
  ('Leite integral UHT',         'Laticínios',              'L',   'Laticínios Serra Verde', 'Dispensa',  40),
  ('Iogurte natural',            'Laticínios',              'L',   'Laticínios Serra Verde', 'Geladeira',  6),
  ('Queijo muçarela',            'Laticínios',              'kg',  'Laticínios Serra Verde', 'Geladeira',  3),
  ('Manteiga com sal',           'Laticínios',              'kg',  'Laticínios Serra Verde', 'Geladeira',  2),
  ('Requeijão cremoso',          'Laticínios',              'pt',  'Laticínios Serra Verde', 'Geladeira',  6),
  ('Peito de frango',            'Carnes e ovos',           'kg',  'Frigorífico Boa Carne',  'Freezer',   15),
  ('Carne moída',                'Carnes e ovos',           'kg',  'Frigorífico Boa Carne',  'Freezer',   12),
  ('Acém em cubos',              'Carnes e ovos',           'kg',  'Frigorífico Boa Carne',  'Freezer',   10),
  ('Filé de tilápia',            'Carnes e ovos',           'kg',  'Frigorífico Boa Carne',  'Freezer',    6),
  ('Ovos brancos',               'Carnes e ovos',           'dz',  'Atacadão Escolar',       'Geladeira', 10),
  ('Banana prata',               'Hortifrúti',              'kg',  'Hortifrúti do Ceasa',    'Dispensa',  10),
  ('Maçã gala',                  'Hortifrúti',              'kg',  'Hortifrúti do Ceasa',    'Geladeira',  8),
  ('Batata inglesa',             'Hortifrúti',              'kg',  'Hortifrúti do Ceasa',    'Dispensa',  10),
  ('Cenoura',                    'Hortifrúti',              'kg',  'Hortifrúti do Ceasa',    'Geladeira',  6),
  ('Tomate',                     'Hortifrúti',              'kg',  'Hortifrúti do Ceasa',    'Geladeira',  6),
  ('Cebola',                     'Hortifrúti',              'kg',  'Hortifrúti do Ceasa',    'Dispensa',   5),
  ('Alface crespa',              'Hortifrúti',              'mc',  'Hortifrúti do Ceasa',    'Geladeira', 10),
  ('Laranja pera',               'Hortifrúti',              'kg',  'Hortifrúti do Ceasa',    'Dispensa',  10),
  ('Extrato de tomate',          'Enlatados e conservas',   'lt',  'Atacadão Escolar',       'Dispensa',  10),
  ('Milho verde em conserva',    'Enlatados e conservas',   'lt',  'Atacadão Escolar',       'Dispensa',  12),
  ('Ervilha em conserva',        'Enlatados e conservas',   'lt',  'Atacadão Escolar',       'Dispensa',   8),
  ('Sardinha em lata',           'Enlatados e conservas',   'lt',  'Atacadão Escolar',       'Dispensa',  10),
  ('Sal refinado',               'Temperos e condimentos',  'kg',  'Atacadão Escolar',       'Dispensa',   3),
  ('Alho descascado',            'Temperos e condimentos',  'kg',  'Hortifrúti do Ceasa',    'Geladeira',  2),
  ('Orégano',                    'Temperos e condimentos',  'g',   'Atacadão Escolar',       'Dispensa', 200),
  ('Colorau',                    'Temperos e condimentos',  'g',   'Atacadão Escolar',       'Dispensa', 300),
  ('Suco de uva integral',       'Bebidas',                 'gf',  'Atacadão Escolar',       'Dispensa',  12),
  ('Achocolatado em pó',         'Bebidas',                 'kg',  'Atacadão Escolar',       'Dispensa',   3),
  ('Pão de forma',               'Panificação e biscoitos', 'pct', 'Padaria Pão Quente',     'Dispensa',  10),
  ('Biscoito de maisena',        'Panificação e biscoitos', 'pct', 'Padaria Pão Quente',     'Dispensa',  15),
  ('Óleo de soja',               'Óleos e gorduras',        'gf',  'Atacadão Escolar',       'Dispensa',   6),
  ('Detergente neutro',          'Limpeza de cozinha',      'gf',  'Atacadão Escolar',       'Dispensa',   6),
  ('Sabão em barra',             'Limpeza de cozinha',      'un',  'Atacadão Escolar',       'Dispensa',   6)
) as p (nome, categoria, sigla, fornecedor, local, minimo)
join public.categorias c on c.nome = p.categoria
join public.unidades u on u.sigla = p.sigla
join public.fornecedores f on f.nome = p.fornecedor
join public.locais_armazenamento l on l.nome = p.local;

-- Lotes: quantidade inicial, atual, perdas e ajustes; datas relativas a hoje
--   entrada = hoje - dias_entrada | validade = hoje + dias_validade (negativo = vencido)
create temporary table seed_lotes (
  produto text, codigo text, inicial numeric, atual numeric,
  dias_entrada int, dias_validade int,
  perda numeric default 0, motivo_perda text,
  ajuste numeric default 0, motivo_ajuste text,
  saida_hoje boolean default false
);

insert into seed_lotes (produto, codigo, inicial, atual, dias_entrada, dias_validade,
                        perda, motivo_perda, ajuste, motivo_ajuste, saida_hoje) values
  ('Arroz branco tipo 1',      'ARZ-0921', 50, 38, 20, 240, 0, null, 1, 'Contagem de inventário: saco rasgado', false),
  ('Arroz branco tipo 1',      'ARZ-1030', 30, 30,  3, 300, 0, null, 0, null, false),
  ('Feijão carioca',           'FJC-1018', 30, 22, 15, 180, 0, null, 0, null, true),
  ('Feijão preto',             'FJP-1003',  10,  5, 30, 150, 0, null, 0, null, false),
  ('Macarrão espaguete',       'MAC-1023', 20, 14, 10, 200, 0, null, 0, null, false),
  ('Macarrão parafuso',        'MAP-1023', 15, 12, 10, 210, 0, null, 0, null, false),
  ('Farinha de trigo',         'FTR-1021', 20, 16, 12, 120, 0, null, 0, null, false),
  ('Aveia em flocos',          'AVE-0924',  5,  0, 40, 100, 0, null, 0, null, false),
  ('Flocão de milho (cuscuz)', 'CUS-1026', 10,  7,  8, 160, 0, null, 0, null, false),
  ('Açúcar cristal',           'ACU-1014', 25, 18, 20, 365, 0, null, 0, null, false),
  ('Leite integral UHT',       'LEI-1009', 48, 12, 25,   3, 0, null, 0, null, true),
  ('Leite integral UHT',       'LEI-1101', 60, 60,  2, 110, 0, null, 0, null, false),
  ('Iogurte natural',          'IOG-1020', 12,  4, 14,  -1, 0, null, 0, null, false),
  ('Iogurte natural',          'IOG-1102', 10, 10,  1,  12, 0, null, 0, null, false),
  ('Queijo muçarela',          'QMU-1024',  5, 3.5, 10,  5, 0, null, 0, null, false),
  ('Manteiga com sal',         'MAN-1014',  4, 1.5, 20, 40, 0, null, 0, null, false),
  ('Requeijão cremoso',        'REQ-1019', 12,  8, 15,   0, 0, null, 0, null, false),
  ('Peito de frango',          'FRA-1022', 40, 22, 12,  75, 0, null, 0, null, true),
  ('Carne moída',              'CMO-1004', 20,  9, 30,   6, 0, null, 0, null, false),
  ('Acém em cubos',            'ACE-1014', 25, 18, 20,  70, 0, null, 0, null, false),
  ('Filé de tilápia',          'TIL-1016', 12,  7, 18,  90, 0, null, 0, null, false),
  ('Ovos brancos',             'OVO-1028', 30,  6,  6,  15, 1, 'Ovos quebrados no transporte', 0, null, false),
  ('Banana prata',             'BAN-1031', 15,  9,  3,   4, 0, null, 0, null, true),
  ('Maçã gala',                'MAC-1030', 12, 10,  4,  14, 0, null, 0, null, false),
  ('Batata inglesa',           'BAT-1029', 25, 17,  5,  25, 0, null, 0, null, false),
  ('Cenoura',                  'CEN-1028', 10,  4,  6,  10, 0, null, 0, null, false),
  ('Tomate',                   'TOM-1025', 10,  3,  9,  -1, 2, 'Estragado: tomates amassados', 0, null, false),
  ('Tomate',                   'TOM-1102',  8,  8,  1,   7, 0, null, 0, null, false),
  ('Cebola',                   'CEB-1027', 10,  8,  7,  30, 0, null, 0, null, false),
  ('Alface crespa',            'ALF-1029', 15,  4,  5,  -1, 3, 'Folhas murchas', 0, null, false),
  ('Alface crespa',            'ALF-1103', 12, 12,  0,   4, 0, null, 0, null, false),
  ('Laranja pera',             'LAR-1031', 20, 15,  3,  12, 0, null, 0, null, false),
  ('Extrato de tomate',        'EXT-1004', 24, 18, 30, 400, 0, null, 0, null, false),
  ('Milho verde em conserva',  'MIL-1004', 24, 20, 30, 500, 0, null, 0, null, false),
  ('Ervilha em conserva',      'ERV-1004', 20, 14, 30, 480, 0, null, 0, null, false),
  ('Sardinha em lata',         'SAR-0924', 24,  8, 40, 600, 0, null, 0, null, false),
  ('Sal refinado',             'SAL-0904', 10,  7, 60, 700, 0, null, 0, null, false),
  ('Alho descascado',          'ALH-1024',  3, 2.5, 10, 40, 0, null, 0, null, false),
  ('Orégano',                  'ORE-0914', 500, 420, 50, 300, 0, null, 0, null, false),
  ('Colorau',                  'COL-0914', 1000, 700, 50, 250, 0, null, 0, null, false),
  ('Suco de uva integral',     'SUC-1014', 24, 18, 20, 180, 0, null, 0, null, false),
  ('Achocolatado em pó',       'ACH-1009',  6,  2, 25, 200, 0, null, 0, null, false),
  ('Pão de forma',             'PAO-1031', 20, 12,  3,   2, 0, null, 0, null, true),
  ('Biscoito de maisena',      'BIS-1019', 40, 28, 15, 150, 0, null, 0, null, false),
  ('Óleo de soja',             'OLE-1004', 12,  4, 30, 300, 0, null, 0, null, false),
  ('Detergente neutro',        'DET-0924', 12,  3, 40, 720, 0, null, 0, null, false),
  ('Sabão em barra',           'SAB-0924', 10,  8, 40, 900, 0, null, 0, null, false);
-- "Fubá" fica sem lote de propósito: estoque zero, aparece na lista de compras.

insert into public.lotes (codigo, produto_id, quantidade, quantidade_inicial, data_entrada,
                          data_validade, fornecedor_id, local_id)
select s.codigo, p.id, s.atual, s.inicial,
       public.hoje() - s.dias_entrada, public.hoje() + s.dias_validade,
       p.fornecedor_id, p.local_padrao_id
from seed_lotes s join public.produtos p on p.nome = s.produto;

-- Movimentações coerentes com os lotes: entrada, perda, ajuste e saída da diferença.
do $$
declare
  v_usuario uuid;
begin
  select id into v_usuario from public.perfis
    where perfil in ('operador', 'administrador') and ativo
    order by (perfil = 'operador') desc, criado_em
    limit 1;

  if v_usuario is null then
    raise notice 'Nenhum administrador/operador encontrado: movimentações de exemplo não foram criadas.';
    return;
  end if;

  -- hora "local" do colégio convertida para timestamptz
  create temporary table seed_mov as
  select s.*, l.id as lote_id, l.produto_id, l.local_id,
         ((public.hoje() - s.dias_entrada)::timestamp + time '07:30') at time zone 'America/Sao_Paulo' as hora_entrada
  from seed_lotes s
  join public.produtos p on p.nome = s.produto
  join public.lotes l on l.produto_id = p.id and l.codigo = s.codigo;

  insert into public.movimentacoes (tipo, sentido, produto_id, lote_id, quantidade, local_id, usuario_id, observacao, data_hora)
  select 'entrada', 1, produto_id, lote_id, inicial, local_id, v_usuario, 'Recebimento de mercadoria', hora_entrada
  from seed_mov;

  insert into public.movimentacoes (tipo, sentido, produto_id, lote_id, quantidade, local_id, usuario_id, motivo, data_hora)
  select 'perda', -1, produto_id, lote_id, perda, local_id, v_usuario, motivo_perda, hora_entrada + interval '2 days'
  from seed_mov where perda > 0;

  insert into public.movimentacoes (tipo, sentido, produto_id, lote_id, quantidade, local_id, usuario_id, motivo, data_hora)
  select 'ajuste', -1, produto_id, lote_id, ajuste, local_id, v_usuario, motivo_ajuste, hora_entrada + interval '3 days'
  from seed_mov where ajuste > 0;

  insert into public.movimentacoes (tipo, sentido, produto_id, lote_id, quantidade, local_id, usuario_id, observacao, data_hora)
  select 'saida', -1, produto_id, lote_id, inicial - atual - perda - ajuste, local_id, v_usuario,
         'Consumo no preparo das refeições',
         case when saida_hoje
              then least(now(), (public.hoje()::timestamp + time '09:15') at time zone 'America/Sao_Paulo')
              else least(now() - interval '1 hour', hora_entrada + interval '1 day') end
  from seed_mov where inicial - atual - perda - ajuste > 0;
end;
$$;

-- Cardápio da semana atual (segunda a sexta)
insert into public.cardapio_planejado (data, tipo_refeicao, descricao)
select (date_trunc('week', public.hoje())::date + d.dia), r.tipo, r.descricoes[d.dia + 1]
from generate_series(0, 4) as d (dia)
cross join (values
  ('cafe_da_manha', array[
    'Leite com achocolatado, pão de forma com manteiga e banana',
    'Leite, cuscuz com ovo mexido e laranja',
    'Iogurte natural com aveia e maçã',
    'Leite com achocolatado, pão com requeijão e banana',
    'Leite, bolo de fubá e laranja']),
  ('lanche_da_manha', array[
    'Maçã picada', 'Biscoito de maisena e suco de uva', 'Banana', 'Laranja em gomos', 'Biscoito de maisena e suco de uva']),
  ('almoco', array[
    'Arroz, feijão carioca, frango assado, cenoura refogada e salada de alface',
    'Arroz, feijão preto, carne moída com batata e salada de tomate',
    'Macarrão parafuso à bolonhesa, salada de alface e laranja',
    'Arroz, feijão carioca, filé de tilápia, purê de batata e salada',
    'Arroz, feijão, acém em cubos com legumes e salada de tomate']),
  ('lanche_da_tarde', array[
    'Pão de forma com queijo e suco de uva', 'Iogurte com banana', 'Sanduíche de sardinha e suco de uva',
    'Biscoito de maisena com leite', 'Pão com requeijão e maçã'])
) as r (tipo, descricoes);

-- Restrições alimentares (somente contagens)
insert into public.tipos_restricao (nome, descricao) values
  ('Intolerância à lactose', 'Substituir leite e derivados por versões sem lactose'),
  ('Sem glúten (doença celíaca)', 'Evitar trigo, aveia comum, cevada e centeio'),
  ('Alergia a amendoim', 'Conferir rótulos de biscoitos e achocolatados'),
  ('Vegetariano', 'Sem carnes; ovos e laticínios liberados'),
  ('Diabetes', 'Evitar açúcar adicionado; preferir frutas inteiras');

insert into public.contagem_restricoes (data, tipo_restricao_id, quantidade_alunos)
select public.hoje() - d.dias_atras, t.id, t.base + (d.dias_atras % 2)
from (values (0), (1), (2), (3), (4)) as d (dias_atras)
cross join (
  select id, case nome
    when 'Intolerância à lactose' then 9
    when 'Sem glúten (doença celíaca)' then 3
    when 'Alergia a amendoim' then 2
    when 'Vegetariano' then 6
    else 4 end as base
  from public.tipos_restricao
) t;

drop table if exists seed_mov;
drop table if exists seed_lotes;
