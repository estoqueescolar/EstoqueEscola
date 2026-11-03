---
name: criar-tela
description: Use ao criar uma nova tela, página, formulário ou listagem na interface. Define uso de shadcn/ui, validação Zod no formulário e no servidor, estados de carregamento/vazio/erro, toasts, textos dos botões, alvos de toque de 44px, foco visível e testes em 375/768/1280px.
---

# Criar tela

Leia antes `docs/design-system.md` (tokens, tipografia, componentes próprios aprovados).

## 1. Componentes
1. Procure primeiro em `components/ui` (shadcn/ui). Falta algum? `npx shadcn@latest add <componente>`.
2. Componente próprio só quando shadcn não resolver; coloque em `components/<dominio>/` e use os tokens do design system.
3. Não altere componentes de `components/ui` para casos específicos — envolva-os.

### Regras obrigatórias sobre o shadcn/ui (revisor-interface, etapa 1)
Os padrões do shadcn têm alturas de 28–32px e texto de 12–14px. Por isso:
1. Nas telas, use os wrappers de `components/comum/` (`Botao`, `CampoTexto`, `CampoSelecao`, `CaixaMarcacao`,
   `Abas`, `Dialogo`), que garantem 44px (48px no botão principal) e texto ≥ 16px. Não importe direto de `components/ui`.
2. Proibidos `size="xs" | "sm" | "icon-xs" | "icon-sm"` e as classes `text-xs` / `text-[0.8rem]`.
3. Nunca aplique opacidade (`/50`, `/60`, `/80`) em token de texto, fundo com texto ou anel. Use tokens sólidos.
4. `--border` só para divisórias; contorno de controle usa `--input` (3,09:1 — não clarear).
5. `SelectTrigger` sempre `w-full`; `SelectItem` e `DropdownMenuItem` sempre `min-h-11`.
6. Dialog/Sheet: fechar com `size-11` e `aria-label="Fechar"`. Nenhum texto em inglês herdado ("Close", "Previous", "Next").
7. Alertas com `EtiquetaValidade` / `IndicadorEstoque`, nunca `Badge`.
8. Toasts usam os tokens (já configurado em `app/layout.tsx`); não use `richColors`.

## 2. Estrutura da rota
- Página é Server Component: busca dados com o cliente Supabase de servidor (respeita RLS).
- Checa permissão com `lib/permissoes.ts`; oculta ações que o perfil não pode usar (a segurança real é RLS + servidor).
- Mutações por **server action** em `actions.ts` ao lado da página:
  1. `exigirPerfil(['administrador','operador'])`
  2. `esquema.safeParse(dados)` com o **mesmo** esquema Zod de `lib/validacoes/`
  3. operação no Supabase; traduza erros do banco para mensagem em português
  4. `revalidatePath(...)` e retorno `{ ok: true } | { ok: false, mensagem, erros? }`
- Formulário (Client Component): `react-hook-form` + `zodResolver(esquema)` + componentes `Form` do shadcn.

## 3. Estados obrigatórios em toda listagem
- **Carregando**: `loading.tsx` com `Skeleton`.
- **Vazio**: mensagem explicando e botão de ação (ex.: "Nenhum produto cadastrado. Cadastrar produto").
- **Erro**: `error.tsx` com mensagem em português e botão "Tentar novamente".

## 4. Feedback
- Sucesso: toast (`sonner`) curto, ex.: "Produto salvo.". Erro: toast destrutivo com a mensagem do servidor.
- Ações irreversíveis ou relevantes (registrar perda, desativar usuário): `AlertDialog` de confirmação.
- Botão de envio mostra estado pendente ("Salvando…") e fica desabilitado enquanto envia.

## 5. Textos
- Botões com verbo + objeto: "Salvar produto", "Registrar saída", "Gerar relatório". Nunca "OK"/"Enviar".
- Erros dizem o que aconteceu e como resolver: "Informe a data de validade. Ela deve ser depois da data de entrada."
- Português do Brasil, frases curtas, sem jargão técnico. Datas `dd/mm/aaaa`, números com vírgula.

## 6. Acessibilidade e toque
- Alvos interativos com no mínimo **44×44 px** (`min-h-11 min-w-11`).
- Todo campo com `<Label>` associado (o `FormLabel` do shadcn já faz) e mensagem de erro ligada via `aria-describedby`.
- Quantidades: `<Input type="text" inputMode="decimal">` aceitando vírgula; inteiros com `inputMode="numeric"`.
- Foco visível em todo elemento interativo (`focus-visible:ring-2` com cor de alto contraste); não remover outline.
- Contraste mínimo 4.5:1 no texto. Alertas usam **cor + texto/ícone** ("Vence em 3 dias", "Vencido", "Estoque baixo").
- Animações só para confirmar ações e desligadas com `motion-reduce:`.
- Um `<h1>` por tela; landmarks (`header`, `nav`, `main`).

## 7. Responsividade (mobile first)
- Comece pelo layout de 375px. Em telas pequenas, tabelas viram lista de cartões ou têm rolagem horizontal **dentro** do contêiner — a página nunca rola na horizontal.
- Verifique em **375px, 768px e 1280px** (Playwright/DevTools) e rode axe na tela.

## 8. Checklist de conclusão
- [ ] Zod no formulário e na server action
- [ ] Carregando, vazio e erro implementados
- [ ] Toasts e confirmações
- [ ] 44px, foco visível, rótulos, contraste, alertas com texto
- [ ] Sem overflow horizontal em 375/768/1280
- [ ] axe sem violações graves
- [ ] Manual de uso atualizado
- [ ] Agent `revisor-interface` executado
