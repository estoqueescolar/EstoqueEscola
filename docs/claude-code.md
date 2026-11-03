# Como o projeto foi feito com o Claude Code

O sistema foi construído com o **Claude Code** (agente de programação da Anthropic), em etapas, com revisão
humana ao fim de cada uma.

## Configuração do projeto
| Arquivo | Para quê |
|---|---|
| `CLAUDE.md` | Regras do projeto: stack, comandos, convenções (português sem acentos no banco), segurança e fluxo de cada etapa |
| `AGENTS.md` | Avisos sobre o Next.js 16 (APIs que mudaram) |
| `.claude/skills/criar-migracao` | Como criar tabelas, RLS e funções SQL |
| `.claude/skills/regras-de-negocio` | Regras de estoque/FEFO como funções puras com teste |
| `.claude/skills/criar-tela` | Padrão das telas: Zod no formulário e no servidor, 44px, estados vazio/erro |
| `.claude/skills/gerar-relatorios` | Padrão dos relatórios PDF/XLSX e seus testes |
| `.claude/agents/revisor-seguranca` | Agente que só revisa: RLS, server actions, segredos |
| `.claude/agents/revisor-interface` | Agente que só revisa: contraste, toque, foco, responsividade |

## Fluxo de cada etapa
1. Implementar seguindo a skill da área.
2. `npm run build`, `npm test` (e RLS/e2e quando aplicável).
3. Rodar os dois agentes revisores em contexto separado.
4. Corrigir problemas graves, altos e moderados.
5. Mostrar o resultado e só seguir com aprovação.
6. Trabalhar em branch (`etapa-6-...`, `etapa-7-...`) para não afetar a versão publicada.

## Etapas
| Etapa | Entrega |
|---|---|
| 0 | Planejamento, banco, RLS e regras de negócio |
| 1 | Login, cadastro, recuperação de senha, perfis |
| 2 | Cadastros auxiliares e usuários |
| 3 | Produtos e lotes |
| 4 | Saída FEFO, perda e ajuste |
| 5 | Painel, alertas, lista de compras, configurações |
| 6 | Cardápio planejado e restrições alimentares |
| 7 | Relatórios PDF e XLSX |
| 8 | Consolidação dos testes ([testes.md](testes.md)) |
| 9 | Documentação e publicação |

## O que ficou com a pessoa
Decisões de produto (nome Despensa CAPE, visual, cadeados nas funções futuras), contas da Vercel/Supabase/Gmail,
aprovação de cada etapa e de qualquer ação na versão publicada.
