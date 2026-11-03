# Testes

Três camadas, todas automáticas. Resultado da última execução completa: **etapa 8, 03/11/2026**.

| Camada | Comando | O que cobre | Resultado |
|---|---|---|---|
| Regras de negócio e relatórios (Vitest) | `npm test` | FEFO, estoque, validade, lista de compras, painel, cardápio, validações Zod, geração de PDF/XLSX | **79 de 79** |
| Banco: RLS e funções (Vitest + Supabase local) | `npm run test:rls` | Permissões por perfil em cada tabela, RPCs de entrada/saída/perda/ajuste, imutabilidade das movimentações | **26 de 26** |
| Navegador + acessibilidade (Playwright + axe) | `npm run test:e2e` | Fluxos reais em 375, 768 e 1280 px, sem rolagem horizontal e sem violações graves de acessibilidade | **73 passaram, 2 pulados** |

Os 2 pulados são o fluxo de recuperação de senha por e-mail, que roda só na largura de computador (o e-mail é o mesmo nas três).

## Antes de rodar
```bash
npx supabase start -x studio,imgproxy,edge-runtime,logflare,vector,supavisor,realtime,storage-api
npx supabase db reset     # banco limpo com os dados de exemplo
npm run dev               # o Playwright usa o servidor em http://localhost:3000
```

## Arquivos
| Pasta | Testes |
|---|---|
| `tests/regras/` | `estoque-e-fefo`, `validade-compras-movimentacoes`, `painel`, `cardapio`, `validacoes` |
| `tests/relatorios/` | montagem dos 3 relatórios, texto do PDF (colégio, título, período, produto, "Página 1 de"), abas e células do XLSX, caso vazio |
| `tests/rls/` | `permissoes` (o que cada perfil lê/grava), `movimentacoes` (FEFO, bloqueio, motivo obrigatório, imutabilidade) |
| `tests/e2e/` | `autenticacao`, `recuperacao-senha`, `cadastros`, `movimentacoes`, `painel`, `cardapio`, `relatorios` |

## Fluxos de navegador cobertos
- Login, senha errada, conta nova, recuperação de senha pelo e-mail (Mailpit) até a nova senha.
- Perfis: consulta não vê ações de alteração nem telas da direção; operador não acessa Configurações.
- Cadastros auxiliares e produtos, inclusive bloqueio de exclusão de item em uso.
- Entrada, saída FEFO dividida entre lotes, bloqueio de saída maior que o estoque, perda e ajuste.
- Painel, lista de compras ("Copiar lista") e prazo do alerta de validade.
- Cardápio da semana e contagem de restrições (consulta só lê).
- Download de relatórios em PDF e Excel e recusa de pedidos inválidos com aviso na tela.

## Observações
- Os testes de navegador esperam a página carregar antes de digitar (a tela de acesso também carrega a cena 3D).
- Os testes criam dados com nomes únicos (ex.: "Leite E2E …"). Rode `npx supabase db reset` para voltar ao estado inicial.
