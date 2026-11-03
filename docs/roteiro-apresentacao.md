# Roteiro da apresentação — Despensa CAPE

Guia para mostrar o projeto à professora sem surpresas: o que preparar, a ordem das telas,
onde clicar, o que dizer e o que fazer se algo der errado. Tempo estimado: **15 a 20 minutos**.

---

## 1. Antes da aula (15 min de antecedência)

1. Abra o **Docker Desktop** e espere ele ficar "Running".
2. No terminal, na pasta do projeto:
   ```bash
   npx supabase start -x studio,imgproxy,edge-runtime,logflare,vector,supavisor,realtime,storage-api
   npx supabase db reset      # IMPORTANTE: limpa dados de testes e recria os dados de exemplo
   npm run build && npm start # versão de produção: mais rápida e sem avisos de desenvolvimento
   ```
   > Se não der tempo do build, use `npm run dev`. Funciona igual, só um pouco mais lento na primeira abertura de cada tela.
3. Abra **http://localhost:3000** no navegador (Chrome ou Edge) e passe pelas telas uma vez para "aquecer".
4. Deixe abertas em abas:
   - Aba 1: http://localhost:3000/login
   - Aba 2: http://localhost:54724 (Mailpit, caixa de e-mails local)
5. Tenha à mão as contas (senha de todas: **`Senha@Local123`**):
   - **diretora@colegio.local** — administrador
   - **cozinha@colegio.local** — operador (cozinha)
   - **consulta@colegio.local** — só consulta
6. Se possível, deixe o celular na mesma rede para mostrar a versão móvel (ou use o modo celular do navegador: F12 → ícone de celular → 375 px).

> Por que o `db reset`? Os testes automáticos criam produtos como "Leite E2E 1793…". O reset deixa só os dados do colégio,
> com datas calculadas a partir de **hoje** (os alertas sempre aparecem).

---

## 2. Abertura (1 min) — o problema

Diga: *"A cozinha do CAPE serve ~158 alunos por dia em 4 refeições. Hoje o controle é um caderno e placas
nas prateleiras. Ninguém sabe na hora o que está vencendo, o que acabou ou quem tirou o quê.
O Despensa CAPE resolve isso pelo celular, com as mãos ocupadas, em poucos toques."*

---

## 3. Tela de acesso (2 min)

**Onde:** http://localhost:3000/login

| Faça | Mostre / diga |
|---|---|
| Deixe a animação rodar | A despensa em 3D mostra as 4 situações do sistema: **entrada**, **saída** (sai o que vence antes), **aviso de validade** e **hora de comprar**. |
| Arraste o armário com o mouse | Dá para girar a cena. O botão ⏸ pausa a animação (acessibilidade). |
| Clique em **Criar uma conta nova** | Requisitos da senha marcados enquanto digita; nova conta começa só com consulta. Volte com **Entrar**. |
| Clique em **Esqueci minha senha** | Passo 1 de 2. Digite `cozinha@colegio.local` → **Enviar link**. Mostre na aba do **Mailpit** que o e-mail chegou. (Não precisa abrir o link.) |
| Digite uma senha errada para `diretora@colegio.local` | Mensagem clara, sem dizer se o e-mail existe (segurança). |

---

## 4. Painel como direção (3 min)

**Entre com:** `diretora@colegio.local` / `Senha@Local123`

| Faça | Mostre / diga |
|---|---|
| Olhe os 4 indicadores no topo | Lotes vencidos, vencendo em até 7 dias, estoque baixo, produtos ativos. Cada um é clicável. |
| Seção **Validade** | Etiqueta com **cor + ícone + texto** (não depende só da cor). Lotes vencidos têm o atalho **Registrar perda**. |
| Seção **Estoque baixo** | "Comprar X kg" calculado sozinho (mínimo − estoque). |
| Menu lateral | **Cardápio, Restrições e Relatórios** com cadeado vermelho: *"são as próximas etapas (6 e 7)"*. |

---

## 5. Fluxo principal: entrada e saída FEFO (5 min) — o ponto alto

1. Menu **Lotes e validade** → procure **Leite integral UHT**. Mostre os dois lotes:
   - **LEI-1009** — 12 L, vence em **3 dias**
   - **LEI-1101** — 60 L, vence daqui a ~110 dias
2. Clique **Registrar saída** (botão no painel ou em Movimentações):
   - Produto: **Leite integral UHT** · Quantidade usada: **10** · Observação: "café da manhã" → confirme a saída.
   - Diga: *"Eu não escolhi o lote. O sistema tirou do LEI-1009, que vence antes. Isso é o FEFO."*
3. Volte em **Lotes**: LEI-1009 agora tem **2 L**; LEI-1101 continua com 60 L.
4. Tente uma **saída de 500 L** de leite → aparece a mensagem bloqueando, dizendo quanto há disponível.
5. **Registrar entrada** (painel → *Registrar entrada*): Produto **Feijão preto**, quantidade **10**, validade daqui a
   alguns meses, local Dispensa → salvar. Mostre que o Feijão preto **saiu da lista de compras** (ou a quantidade diminuiu).
6. **Movimentações**: histórico com quem registrou (só o nome), data, tipo e lotes usados.
   Diga: *"Movimentação não se edita nem se apaga; correção é um novo ajuste. Fica tudo rastreável."*

---

## 6. Lista de compras e configurações (2 min)

| Onde | Faça / diga |
|---|---|
| Menu **Lista de compras** | Produtos abaixo do mínimo, quanto comprar, fornecedor e telefone. **Copiar lista** → cole no bloco de notas: texto pronto para WhatsApp. |
| Menu **Configurações** (só direção) | Prazo do alerta de validade (padrão 7 dias, de 1 a 60). **Não precisa salvar** na apresentação. |
| Menu **Usuários** (só direção) | Lista de contas; a direção muda o perfil e desativa acesso. |

---

## 7. Permissões por perfil (2 min)

1. Clique **Sair**.
2. Entre como **consulta@colegio.local** → o menu não tem Usuários nem Configurações e não há botões de entrada/saída.
3. Tente abrir http://localhost:3000/usuarios na barra de endereço → volta para o painel.
   Diga: *"A permissão não é só esconder botão: o banco (RLS) recusa os dados e o servidor confere o perfil."*

---

## 8. Celular (1 min)

F12 → modo celular (375 px) ou celular real. Mostre o botão **Menu**, os botões grandes (44 px, pensados para mãos
molhadas) e uma saída rápida.

---

## 9. Qualidade e próximos passos (1 min)

- **Testes automáticos**: 62 de regras de negócio, 26 de permissões no banco, e testes de navegador com verificação de
  acessibilidade em 3 tamanhos de tela. Se quiser mostrar: `npm test` (roda em ~2 s).
- **Próximas etapas**: 6 — cardápio e restrições alimentares (só contagens, sem nome de aluno); 7 — relatórios PDF/XLSX;
  9 — publicação na Vercel com o Supabase na nuvem, e-mails pelo escolarestoque@gmail.com.

---

## Se algo der errado

| Problema | Solução |
|---|---|
| "E-mail ou senha incorretos" com as contas de demonstração | Rode `npx supabase db reset` (recria os usuários). |
| Página não abre / erro de conexão | Docker aberto? `npx supabase status` deve listar os serviços. Senão, `npx supabase start ...` de novo. |
| Aparecem produtos "Leite E2E …" | São de testes automáticos: `npx supabase db reset`. |
| Animação 3D não aparece | Ela só aparece em telas largas (≥ 1024 px) e precisa de WebGL. O login funciona normalmente sem ela. |
| Primeira abertura de tela demora (modo `npm run dev`) | Normal no modo desenvolvimento; por isso "aqueça" as telas antes ou use `npm run build && npm start`. |
| Porta 3000 ocupada | Feche o outro terminal com `npm run dev` ou use `npx next start -p 3001`. |
| Mostrou a saída de leite e quer refazer | `npx supabase db reset` volta tudo ao estado inicial (≈ 30 s). |

## Checklist rápido

- [ ] Docker aberto · Supabase rodando · `db reset` feito
- [ ] Sistema aberto em http://localhost:3000 e telas aquecidas
- [ ] Mailpit aberto em outra aba
- [ ] Senha `Senha@Local123` anotada
- [ ] Ordem: login → painel → saída FEFO → entrada → compras → perfis → celular
