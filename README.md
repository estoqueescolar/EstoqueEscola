# Despensa CAPE — controle de estoque e validade da cozinha

Sistema web que substitui o **caderno** e as **placas de prateleira** da cozinha do
**CAPE — Centro de Apoio Pedagógico Especializado**. A cozinha serve cerca de **158 alunos por dia**
em 4 refeições (café da manhã, lanche da manhã, almoço e lanche da tarde) e precisa saber, sem
contar prateleira por prateleira:

- o que tem em estoque e onde está guardado (despensa, geladeira, freezer);
- o que está **vencendo** ou já **venceu**;
- o que está **abaixo do mínimo** e precisa ser comprado;
- quem tirou o quê, quando e por quê.

> Roteiro para a apresentação: [docs/roteiro-apresentacao.md](docs/roteiro-apresentacao.md)

## Situação do projeto

| Etapa | Conteúdo | Situação |
|---|---|---|
| 0 | Planejamento, banco de dados e regras de negócio | ✅ pronta |
| 1 | Login, cadastro, recuperação de senha e perfis | ✅ pronta |
| 2 | Cadastros auxiliares (categorias, unidades, locais, fornecedores) e usuários | ✅ pronta |
| 3 | Produtos e lotes (entrada com validade) | ✅ pronta |
| 4 | Movimentações: saída FEFO, perda e ajuste | ✅ pronta |
| 5 | Painel com alertas, lista de compras e configurações | ✅ pronta |
| 6 | Cardápio planejado e contagem de restrições alimentares | ✅ pronta |
| 7 | Relatórios em PDF e XLSX | ✅ pronta |
| 8 | Consolidação dos testes ([docs/testes.md](docs/testes.md)) | ✅ pronta |
| 9 | Documentação final e publicação (Vercel + Supabase) | ✅ pronta |

Publicado em https://despensa-cape.vercel.app. Documentação: [manual de uso](docs/manual-de-uso.md), [manual de instalação](docs/manual-de-instalacao.md), [diagramas](docs/diagramas/README.md), [testes](docs/testes.md), [regras de negócio](docs/regras-de-negocio.md), [como foi feito com o Claude Code](docs/claude-code.md).

## Quem usa

| Perfil | Quem é | O que pode |
|---|---|---|
| `administrador` | Diretora | Tudo, inclusive usuários e o prazo do alerta de validade |
| `operador` | Funcionárias da cozinha | Produtos, lotes, entradas, saídas, perdas, ajustes, cardápio e restrições (pelo celular ou tablet) |
| `consulta` | Quem só acompanha | Ver estoque, alertas, cardápio e baixar relatórios |

As permissões valem em três camadas: **banco** (RLS do Postgres), **servidor** (cada ação confere o perfil)
e **interface**, que só esconde o que a pessoa não pode usar.

## Regras de negócio principais

Detalhes em [docs/regras-de-negocio.md](docs/regras-de-negocio.md).

- **Estoque** do produto = soma das quantidades dos **lotes ativos**.
- **Saída FEFO** (*first expired, first out*): sai primeiro o lote que **vence antes**; uma saída pode usar vários lotes.
- Saída maior que o estoque é **bloqueada** com mensagem clara. Lote vencido não sai para consumo: é baixado como **perda**.
- **Perda** e **ajuste** exigem motivo. Movimentações **nunca são editadas nem apagadas**: corrige-se com um novo ajuste.
- **Alerta de validade**: lotes que vencem em até **7 dias** (a direção pode mudar o prazo) e vencidos com quantidade.
- **Estoque baixo**: estoque ≤ mínimo. **Lista de compras** = mínimo − estoque atual.
- Lote que chega a 0 fica **inativo**, mas continua no histórico.

## Tecnologias

| Item | Uso |
|---|---|
| Next.js 16 (App Router) + React 19 + TypeScript | Telas e ações no servidor |
| Tailwind CSS 4 + shadcn/ui | Visual (componentes acessíveis, alvos de toque de 44px) |
| Supabase (Postgres, Auth, RLS) | Banco, login e permissões por perfil |
| Zod + react-hook-form | Validação no formulário **e** no servidor |
| three.js + React Three Fiber + drei | Demonstração 3D da despensa na tela de login |
| Vitest | Testes das regras de negócio e das permissões (RLS) |
| Playwright + axe | Testes no navegador e de acessibilidade em 375, 768 e 1280 px |
| jsPDF + ExcelJS | Relatórios em PDF e Excel |

Tudo em planos gratuitos (Vercel e Supabase).

## Como rodar localmente

Pré-requisitos: **Node.js 20+**, **Docker Desktop** aberto e Git.

```bash
git clone https://github.com/estoqueescolar/EstoqueEscola.git
cd EstoqueEscola
npm install

# 1. Banco local (Docker). Na primeira vez baixa as imagens e demora alguns minutos.
npx supabase start -x studio,imgproxy,edge-runtime,logflare,vector,supavisor,realtime,storage-api

# 2. Variáveis de ambiente
cp .env.example .env.local
npx supabase status          # copie "anon key" e "service_role key" para o .env.local

# 3. Dados de exemplo do colégio + usuários de demonstração
npx supabase db reset

# 4. Sistema
npm run dev                  # http://localhost:3000
```

### Usuários de demonstração (só no ambiente local)

| E-mail | Perfil | Senha |
|---|---|---|
| diretora@colegio.local | Administrador (direção) | `Senha@Local123` |
| cozinha@colegio.local | Operador (cozinha) | `Senha@Local123` |
| consulta@colegio.local | Consulta | `Senha@Local123` |

Os e-mails do ambiente local (confirmação de conta e redefinição de senha) **não saem para a internet**:
ficam no Mailpit, em http://localhost:54724. Em produção, o envio usa o Gmail da despensa;
ver [docs/email-gmail.md](docs/email-gmail.md).

## Comandos

```bash
npm run dev          # desenvolvimento
npm run build        # build de produção
npm test             # regras de negócio (Vitest)
npm run test:rls     # permissões e funções do banco (rode `npx supabase db reset` antes)
npm run test:e2e     # navegador + acessibilidade em 3 larguras (Supabase local rodando)
npm run typecheck && npm run lint
```

## Estrutura

```
app/(auth)/        login, criar conta, esqueci a senha, nova senha
app/(app)/         painel, produtos, lotes, movimentações, compras, cardápio, restrições, relatórios, cadastros, usuários, configurações
components/comum/  componentes acessíveis (botões, campos, menu)
components/estoque/ etiquetas de validade, indicador de estoque, histórico
lib/regras/        regras de negócio puras (FEFO, validade, estoque, compras) — testadas
lib/validacoes/    esquemas Zod usados no formulário e no servidor
lib/dados/         consultas de leitura usadas pelas telas
supabase/migrations/ tabelas, RLS, funções (registrar_entrada, registrar_saida, ...)
supabase/seed.sql  dados de exemplo (datas relativas a hoje)
tests/             regras/, rls/, e2e/
docs/              documentação
```

## Segurança

- A chave de serviço do Supabase (`SUPABASE_SERVICE_ROLE_KEY`) **só existe no servidor**; nunca vai para o navegador.
- Nenhum segredo no repositório: `.env.local` é ignorado pelo Git; os nomes das variáveis estão em `.env.example`.
- Toda tabela tem RLS. Lotes e movimentações só mudam por funções transacionais no banco.
- Restrições alimentares são só **contagens** (nenhum nome de aluno).

## Decisões
Decisões não descritas no enunciado; em todas escolhemos a opção mais simples que atende ao requisito.

| Decisão | Motivo |
|---|---|
| Movimentações por **funções RPC** transacionais (`registrar_entrada/saida/perda/ajuste`) em vez de trigger | FEFO, bloqueio de saída e mensagens em português num só lugar; testável chamando a função direto (`tests/rls/movimentacoes.test.ts`). |
| Lote **vencido não entra na saída FEFO**; é baixado como **perda** | Evita servir alimento vencido; a mensagem de estoque insuficiente avisa quanto há em lotes vencidos. |
| Ajuste com campo `sentido` (+1/-1) | Um só tipo "ajuste" cobre correções para mais e para menos. |
| `hoje()` no fuso America/Sao_Paulo | O banco do Supabase roda em UTC; sem isso, à noite os alertas mudariam de dia antes da hora. |
| Usuários de demonstração em `seed-usuarios-dev.sql`, ignorado se já existir qualquer conta | Senha conhecida nunca chega à produção. |
| Portas do Supabase local na faixa 547xx | Não conflitar com outros projetos Supabase na mesma máquina. |
| `cacheComponents` do Next 16 desligado | Toda tela depende do usuário logado; o cache exigiria `<Suspense>` em cada leitura de sessão sem ganho real. |
| `<select>` nativo em vez do Select do shadcn | Abre o seletor do próprio celular/tablet, mais fácil de tocar. |
| Wrappers em `components/comum` sobre o shadcn/ui | Os padrões do shadcn têm 28–32px e texto de 14px; os wrappers garantem 44px e 16px sem editar `components/ui`. Única edição em `components/ui`: tradução de "Close" para "Fechar" (dialog/sheet). |
| Desativar usuário = `perfis.ativo = false` **e** bloqueio no Supabase Auth | O RLS corta os dados na hora; o bloqueio impede novo login e a renovação da sessão. |
| Troca de senha só com cookie de recuperação (15 min) criado pelo link do e-mail | Quem pegar um aparelho com sessão aberta não troca a senha de outra pessoa. |
| Cadastro e recuperação respondem de forma neutra | Não revelam quais e-mails têm conta. |
| Testes de navegador com `@playwright/test` + `@axe-core/playwright` | Cobrem o fluxo real e a acessibilidade (axe) nas três larguras exigidas. |
| Nome exibido **Despensa CAPE** (Centro de Apoio Pedagógico Especializado) | O sistema é entregue ao CAPE; o nome técnico do repositório continua `EstoqueEscolar`. |
| Prazo do alerta de validade editável só pela direção, de 1 a 60 dias (tela Configurações) | O enunciado pede "7 dias (configurável)"; 60 dias evita que o alerta perca o sentido. |
| Lista de compras com botão **Copiar lista** (texto simples) | A compra costuma ser pedida por WhatsApp; o PDF/XLSX entra na etapa de relatórios. |
| Produtos inativos ficam fora da lista de compras | Produto desativado não é mais comprado. |
| Demonstração 3D no login carregada sob demanda e só em telas grandes | Mostra o funcionamento da despensa sem atrasar o formulário nem gastar dados no celular; pausa automática para quem pede menos movimento. |
| Funções ainda não prontas aparecem no menu com cadeado (usado até a etapa 7) | Mostra o escopo completo sem levar a telas vazias. |
| Contagem de restrição zerada é gravada como 0, não apagada | No banco só a direção apaga; assim a cozinha também corrige uma contagem. |
| Relatórios por formulário GET simples, com erro voltando para a tela | Funciona sem JavaScript e baixa direto; período limitado a 1 ano e a 1000 movimentações por arquivo. |
| Cardápio de segunda a sexta | Dias letivos; sábado e domingo abrem a semana seguinte. |
| E-mails de produção pelo Gmail (escolarestoque@gmail.com) com senha de app | Gratuito; a senha de app fica só no painel do Supabase. |
