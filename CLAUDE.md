# Estoque Escolar — controle de estoque e validade da cozinha

## Visão geral
Sistema web que substitui o caderno e as placas de prateleira da cozinha de um colégio
(~158 alunos/dia, 4 refeições: café da manhã, lanche da manhã, almoço, lanche da tarde).
Controla produtos, lotes, validade (FEFO), movimentações, alertas, cardápio planejado,
contagem de restrições alimentares e relatórios PDF/XLSX.

Público:
- **Diretora** (perfil `administrador`): administra tudo, inclusive usuários.
- **Funcionárias da cozinha** (perfil `operador`): usam em celular/tablet, às vezes com as mãos molhadas.
- **Consulta**: apenas visualiza estoque, alertas e relatórios.

## Stack
| Item | Versão alvo |
|---|---|
| Next.js (App Router) + React | 16.4 / 19.3 — leia `AGENTS.md`: APIs mudaram (ex.: `middleware` virou `proxy.ts`) |
| TypeScript | 5.x, `strict: true` |
| Tailwind CSS | 4.x |
| shadcn/ui (CLI `npx shadcn@latest`) | componentes em `components/ui` |
| Supabase (Postgres, Auth e-mail/senha, RLS) | `@supabase/ssr` + `@supabase/supabase-js` 2.x |
| Zod + react-hook-form + @hookform/resolvers | 4.x / 7.x / 7.x |
| jsPDF + jspdf-autotable | 4.x / 5.x |
| ExcelJS | 4.x |
| Vitest | 5.x (`vitest.config.mts` e `vitest.rls.config.mts`) |
| Publicação | Vercel (plano gratuito) + Supabase (plano gratuito) |

Versões exatas ficam no `package.json`; atualize esta tabela se mudar a versão major.

## Comandos
```bash
npm install                 # instalar dependências
npm run dev                 # desenvolvimento em http://localhost:3000
npm run build               # build de produção
npm test                    # Vitest (regras de negócio + relatórios)
npm run test:rls            # RLS + RPCs contra o Supabase local (rode db reset antes)
npm run test:e2e            # Playwright + axe em 375/768/1280 (Supabase local + db reset)
npm run typecheck && npm run lint
npm run db:tipos            # regenera lib/supabase/tipos-banco.ts após migração
npx supabase start -x studio,imgproxy,edge-runtime,logflare,vector,supavisor,realtime,storage-api
                            # Supabase local (Docker). Portas 547xx: API 54721, banco 54722
npx supabase db reset       # recria o banco: roda migrações + supabase/seed.sql
npx supabase migration new <descricao>   # nova migração (ver skill criar-migracao)
npx supabase db push        # aplica migrações no projeto remoto
```

## Estrutura de pastas
```
app/
  (auth)/            login, cadastro, recuperar-senha, redefinir-senha
  (app)/             telas protegidas: painel, produtos, lotes, movimentacoes, compras,
                     cardapio, restricoes, relatorios, cadastros, usuarios, configuracoes
  api/relatorios/    rotas que geram PDF/XLSX
components/
  ui/                componentes shadcn/ui (não editar; única exceção: "Close" → "Fechar")
  comum/             wrappers acessíveis (Botao, CampoTexto, CampoSelecao, AvisoFormulario, MenuPrincipal)
                     CampoSenha (mostrar senha + Caps Lock), RequisitosSenha
                     e use-envio-formulario (react-hook-form → server action)
  estoque/           EtiquetaValidade, IndicadorEstoque, CartaoLote, ListaMovimentacoes, SeloMovimentacao
                     (alerta sempre com cor + ícone + texto)
lib/
  regras/            funções puras de negócio (FEFO, estoque, validade, compras)
  relatorios/        montagem de PDF e XLSX (puras: recebem dados, devolvem bytes)
  validacoes/        esquemas Zod compartilhados entre formulário e servidor
  supabase/          clientes: navegador (anon), servidor (sessão), admin (service role, só servidor)
  dados/             consultas de leitura reutilizadas pelas telas (server-only), ex.: listarProdutos(),
                     carregarSituacaoEstoque() (alertas + lista de compras do painel)
  cadastros-config.ts  textos/campos das 4 telas de cadastros auxiliares (uma tela genérica atende todas)
  permissoes.ts      PERMISSOES por perfil, obterUsuarioAtual(), exigirPermissao()
  erros.ts           ResultadoAcao e traduzirErro() (só repassa P0001 e códigos mapeados)
proxy.ts             (Next 16) renova a sessão e redireciona para /login sem sessão
supabase/
  migrations/        SQL versionado (tabelas, RLS, políticas, funções RPC)
  seed.sql           dados de exemplo do colégio (datas relativas a hoje())
  seed-usuarios-dev.sql  3 usuários demo (senha Senha@Local123) — SÓ LOCAL
tests/
  regras/  relatorios/  rls/  e2e/
docs/                documentação da entrega (ver lista abaixo)
.claude/             skills e agents do projeto
```

## Regras de negócio (resumo)
Detalhes em [docs/regras-de-negocio.md](docs/regras-de-negocio.md).
- Estoque do produto = soma das quantidades dos **lotes ativos**.
- Lote com quantidade 0 fica **inativo**, mas permanece no histórico.
- **Saída** usa FEFO: consome primeiro o lote ativo com validade mais próxima (pode dividir entre lotes).
- Saída maior que o estoque disponível é **bloqueada** com mensagem clara.
- **Perda** e **ajuste** exigem motivo. Movimentações são **imutáveis** (sem UPDATE/DELETE); correção = novo ajuste.
- Alerta de validade: lotes vencendo em até **7 dias** (valor em `configuracoes.dias_alerta_validade`) e vencidos com quantidade > 0.
- Estoque baixo: estoque ativo **≤** estoque mínimo. Lista de compras = mínimo − estoque atual.
- Constraints: quantidade do lote ≥ 0; validade > data de entrada; quantidade da movimentação > 0.
- Lotes e movimentações só mudam pelas RPCs transacionais: `registrar_entrada`, `registrar_saida` (FEFO),
  `registrar_perda`, `registrar_ajuste`. Datas de negócio usam `hoje()` (fuso America/Sao_Paulo).

Nome exibido ao usuário: **Despensa CAPE** (Centro de Apoio Pedagógico Especializado).

## Convenções
- Tabelas, colunas, funções e variáveis de domínio em **português sem acentos** (`locais_armazenamento`, `estoque_minimo`).
- Visual leve: títulos `font-semibold` (nunca `font-bold`), rótulos 14px; ver docs/design-system.md.
- Código e comentários em português. Textos da interface em português do Brasil, com acentos.
- Componentes React em PascalCase; arquivos de rota em kebab-case.
- Toda regra de negócio nasce como função pura em `lib/regras/` com teste em `tests/regras/`.
- Toda entrada de usuário é validada com Zod **no servidor** (server action/rota) e no formulário.
- Commits no formato `tipo: descrição` (feat, fix, refactor, docs, test, chore).

## Next.js 16 neste projeto
- `cacheComponents: false` (todas as telas dependem do usuário logado). Não use `use cache`.
- `PageProps<"/rota">`/`LayoutProps` são gerados: rode `npm run typecheck` (inclui `next typegen`).
- Server action: `exigirPermissao()` → Zod `safeParse` → Supabase → `revalidatePath` → `ResultadoAcao`.

## Segurança
- A `SUPABASE_SERVICE_ROLE_KEY` **nunca** vai para o navegador: só em `lib/supabase/admin.ts`,
  importado apenas em código de servidor (`import "server-only"`). Nunca usar prefixo `NEXT_PUBLIC_`.
- Nenhum segredo no código. Variáveis documentadas em `.env.example`; valores reais em `.env.local` e no painel da Vercel.
- Toda tabela tem RLS ativo. Permissões aplicadas no banco (RLS) **e** no servidor; a interface só oculta.
- Nome de quem registrou movimentação: coluna calculada `responsavel` (só o nome, nunca o e-mail).
  Não abra a tabela `perfis` para outros perfis.
- Não registrar dados pessoais em logs nem em URLs. Restrições alimentares são só contagens (sem nome de aluno).

## Skills do projeto (`.claude/skills/`)
| Skill | Quando usar |
|---|---|
| `criar-migracao` | Criar/alterar tabelas, políticas RLS, funções SQL ou o seed |
| `regras-de-negocio` | Qualquer cálculo de estoque, validade, saída, perda, ajuste, estoque baixo ou lista de compras |
| `gerar-relatorios` | Criar/alterar relatórios PDF ou XLSX |
| `criar-tela` | Criar uma nova tela ou formulário |

## Agents do projeto (`.claude/agents/`) — somente revisão, não alteram código
| Agent | Quando usar |
|---|---|
| `revisor-seguranca` | Ao fim de cada etapa e sempre que mexer em migrações, RLS, rotas de API ou server actions |
| `revisor-interface` | Ao fim de cada etapa que crie/altere telas ou componentes |

Fluxo de cada etapa: implementar → `npm run build` → `npm test` → rodar os dois agents (contexto separado)
→ corrigir problemas altos/críticos → mostrar resultado ao usuário antes de avançar.

## Documentação
`README.md`, `docs/diagramas/`, `docs/manual-de-instalacao.md`, `docs/manual-de-uso.md`,
`docs/regras-de-negocio.md`, `docs/testes.md`, `docs/design-system.md`, `docs/claude-code.md`.
Decisões não previstas no enunciado: escolher a mais simples e registrar no README (seção "Decisões").
