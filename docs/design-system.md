# Design system — "a prateleira"

## Como a decisão foi tomada
1. A skill `ui-ux-pro-max` foi instalada (`uipro init --ai claude`) e consultada com o tipo de produto
   "gestão de estoque de cozinha institucional". Ela sugeriu um padrão de *landing page*
   (hero + conversão, estilo vibrante, Playfair Display). **Recusamos** essa sugestão: o sistema é uma
   ferramenta de trabalho usada em celular/tablet com as mãos ocupadas, não uma página de vendas.
   Aproveitamos o checklist de entrega dela (ícones SVG, contraste 4.5:1, foco visível,
   `prefers-reduced-motion`, testes responsivos).
2. A skill `frontend-design` orientou a escolha de uma direção própria: **"a prateleira"**, aprovada pela
   equipe em 30/10/2026. A interface lembra a cozinha física: o estoque aparece **por local**
   (dispensa, geladeira, freezer) e a validade é mostrada numa **etiqueta** com data relativa
   ("vence em 3 dias"), como as placas que já ficam nas prateleiras.

## Paleta
Contraste medido contra o fundo Papel (`#FAF7F0`) e contra branco (WCAG 2.1).

| Nome | Hex | Uso | Contraste (papel / branco) |
|---|---|---|---|
| Papel | `#FAF7F0` | fundo das telas | — |
| Grafite | `#1F2A2E` | texto principal | 13,7 / 14,7 |
| Manjericão | `#2F6B4F` | ação principal, "em dia" | 5,9 / 6,3 (branco sobre ele: 6,3) |
| Açafrão | `#B45309` | "vence em breve" (borda/ícone) | 4,7 / 5,0 |
| Açafrão-texto | `#8A3F06` | texto sobre fundo açafrão `#FDF1DC` | 6,7 |
| Tomate | `#B42318` | "vencido", "estoque baixo", erros | 6,1 / 6,6 (sobre `#FCE8E6`: 5,6) |
| Azul-gelo | `#1D5C8C` | geladeira/freezer e anel de foco | 6,6 / 7,1 |

Apoio: Grafite-suave `#55605F` (texto secundário, 6,1) e Linha `#8A8F86` (borda de campos, 3,1 ≥ 3:1).

Tokens em `app/globals.css` (`--papel`, `--manjericao` etc.) e mapeados para os tokens do shadcn/ui
(`--primary`, `--destructive`, `--ring`...). Classes extras do Tailwind: `bg-alerta-fundo`,
`text-alerta-texto`, `bg-perigo-fundo`, `bg-frio-fundo`, `text-frio`, `bg-ok-fundo`.

**Regra:** alerta nunca só por cor. Sempre cor + ícone + texto ("Vencido há 2 dias", "Estoque baixo").

## Tipografia (Google Fonts via `next/font`)
- **Bricolage Grotesque** 600/700 — títulos (`h1`–`h3`), números de destaque e etiquetas de validade.
- **Public Sans** — todo o resto. Fonte criada para serviços públicos: muito legível em tela pequena.
- Tamanho mínimo de texto: 16px no corpo, 14px (0,875rem) em legendas. Nada abaixo de 0,8rem.

## Espaçamentos, raios e toque
- Base de 4px (escala do Tailwind). Respiro entre seções: 24px no celular, 32px a partir de 768px.
- Gutter lateral de 16px no celular.
- Raio: 10px em cartões (`--radius: 0.625rem`), 8px em campos e botões.
- Alvos de toque com **no mínimo 44×44px** (`min-h-11`). Botão principal de cada tela: 44px com mais padding lateral (revisão da etapa 5).
- Foco: contorno de 2px Azul-gelo com 2px de afastamento em todo elemento interativo.

## Peso visual (revisão da etapa 5)
Pedido do usuário: interface mais leve e fina. Sem perder 44px de toque nem 4,5:1 de contraste:
- títulos em `font-semibold` (nunca `font-bold`); h1 de tela `text-2xl sm:text-3xl`;
- rótulos de campo em 14px `font-medium`; botão principal com 44px;
- ícones lucide com traço 1,75 (`svg.lucide` em `globals.css`); anel de foco de 2px Azul-gelo;
- bordas decorativas em `#E2DCCF`; a borda de campo continua `--linha` (3:1 exigido para componentes).

## Movimento
Só para confirmar ações (toast, etiqueta que muda de estado). Desligado com `prefers-reduced-motion`.

## Componentes próprios previstos
- `EtiquetaValidade`: etiqueta "vence hoje / em N dias / vencido há N dias" com ícone e cor.
- `SeloLocal`: identifica dispensa, geladeira, freezer (ícone + nome).
- `IndicadorEstoque`: quantidade + mínimo + selo "Estoque baixo".

Os demais vêm do shadcn/ui (`components/ui`).
