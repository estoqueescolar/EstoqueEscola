---
name: gerar-relatorios
description: Use ao criar ou alterar qualquer relatório em PDF (jsPDF + jspdf-autotable) ou XLSX (ExcelJS): consumo por período, vencidos/perdidos e lista de compras. Define cabeçalho padrão do PDF, aba de resumo do XLSX e os testes obrigatórios.
---

# Gerar relatórios

## Arquitetura
- `lib/relatorios/dados/<relatorio>.ts`: busca no Supabase (servidor, sessão do usuário — respeita RLS)
  e devolve um objeto tipado `DadosRelatorio<T>` com `titulo`, `periodo`, `linhas`, `resumo`.
- `lib/relatorios/pdf.ts` e `lib/relatorios/xlsx.ts`: funções **puras** que recebem os dados + metadados
  e devolvem `Uint8Array`/`Buffer`. Não acessam banco — isso permite testar.
- `app/api/relatorios/[tipo]/route.ts`: valida `tipo`, `formato`, `inicio`, `fim` com Zod, checa sessão,
  monta dados, chama o gerador e responde com `Content-Disposition: attachment`.
- Nome do arquivo: `<relatorio>_<inicio>_<fim>.<pdf|xlsx>` (ex.: `consumo_2026-11-01_2026-11-30.pdf`).

## Os três relatórios
| Relatório | Conteúdo | Colunas principais | Resumo |
|---|---|---|---|
| `consumo` | Saídas no período, agrupadas por categoria → produto | Categoria, Produto, Unidade, Quantidade consumida, Nº de saídas | Total por categoria e total geral de saídas |
| `perdas` | Lotes vencidos com quantidade > 0, perdas e ajustes negativos no período | Data, Produto, Lote, Tipo (vencido/perda/ajuste), Quantidade, Unidade, Motivo, Usuário | Total de itens e quantidade por tipo |
| `compras` | Produtos com estoque ≤ mínimo (posição atual; período só aparece no cabeçalho) | Produto, Categoria, Estoque atual, Mínimo, Quantidade a comprar, Unidade, Fornecedor sugerido, Telefone | Nº de produtos a comprar |

A lógica de agrupamento e da lista de compras vem de `lib/regras/` (ver skill `regras-de-negocio`).

## PDF (jsPDF + jspdf-autotable)
- A4 retrato (paisagem se > 6 colunas), margens de 15 mm, fonte Helvetica (embutida).
- **Cabeçalho em toda página**: nome do colégio (de `configuracoes.nome_colegio`), título do relatório,
  período `dd/mm/aaaa a dd/mm/aaaa`, data/hora de emissão, nome/e-mail do usuário que gerou.
- **Rodapé**: `Página X de Y` (use `doc.putTotalPages`) e "Gerado pelo Estoque Escolar".
- Tabela com cabeçalho em cor primária do design system, linhas zebradas leves, números alinhados à direita
  com vírgula decimal. Bloco de resumo ao final.
- Sem dados: gerar o arquivo mesmo assim com a frase "Nenhum registro encontrado no período."

## XLSX (ExcelJS)
- Aba **"Resumo"** primeiro: colégio, relatório, período, emissão, usuário, totais.
- Aba de dados (ex.: "Consumo"): linha de cabeçalho em negrito, fundo na cor primária, texto branco,
  `views: [{ state: 'frozen', ySplit: 1 }]`, `autoFilter` no intervalo do cabeçalho,
  larguras de coluna adequadas (calculadas pelo maior conteúdo, entre 10 e 50),
  datas como `Date` com formato `dd/mm/yyyy`, quantidades como número com `numFmt '#,##0.###'`.

## Testes obrigatórios (`tests/relatorios/`)
Para cada relatório e formato, com dados fixos de exemplo:
- PDF: o buffer começa com `%PDF`; o texto extraído contém o nome do colégio, o título, o período,
  um produto conhecido e `Página 1 de`.
  (Para extrair texto, use `doc.output('arraybuffer')` e procure as strings, com compressão desativada no teste.)
- XLSX: reabrir com `ExcelJS.Workbook().xlsx.load(buffer)`; existe aba "Resumo"; a aba de dados tem o
  cabeçalho esperado, `autoFilter` definido e a linha do produto conhecido com a quantidade correta.
- Caso vazio: arquivo gerado com a mensagem de nenhum registro.

## Checklist
1. Gerador puro + teste verde (`npm test`).
2. Rota valida entrada com Zod e exige sessão (consulta pode gerar).
3. Abrir manualmente o PDF e o XLSX gerados uma vez antes de concluir.
4. Atualizar `docs/manual-de-uso.md` (seção Relatórios) se algo mudou.
