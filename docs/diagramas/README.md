# Diagramas

Os diagramas estão em [Mermaid](https://mermaid.js.org/) e aparecem desenhados no GitHub e no VS Code.

## Modelo de dados

```mermaid
erDiagram
    perfis ||--o{ movimentacoes : "registra"
    categorias ||--o{ produtos : "agrupa"
    unidades ||--o{ produtos : "mede"
    fornecedores |o--o{ produtos : "fornecedor sugerido"
    locais_armazenamento ||--o{ produtos : "local padrão"
    produtos ||--o{ lotes : "tem"
    fornecedores |o--o{ lotes : "entregou"
    locais_armazenamento ||--o{ lotes : "guarda"
    lotes ||--o{ movimentacoes : "movimenta"
    produtos ||--o{ movimentacoes : "de"
    tipos_restricao ||--o{ contagem_restricoes : "contada em"

    perfis {
        uuid id PK "= auth.users.id"
        text nome
        text email
        text perfil "administrador | operador | consulta"
        boolean ativo
    }
    produtos {
        uuid id PK
        text nome UK
        uuid categoria_id FK
        uuid unidade_id FK
        uuid fornecedor_id FK
        uuid local_padrao_id FK
        numeric estoque_minimo
        boolean ativo
    }
    lotes {
        uuid id PK
        text codigo "único por produto"
        uuid produto_id FK
        numeric quantidade "maior ou igual a 0"
        numeric quantidade_inicial
        date data_entrada
        date data_validade "maior que data_entrada"
        boolean ativo "gerado: quantidade maior que 0"
    }
    movimentacoes {
        uuid id PK
        uuid operacao_id "agrupa uma saída FEFO"
        text tipo "entrada | saida | perda | ajuste"
        smallint sentido "+1 ou -1"
        uuid lote_id FK
        numeric quantidade "maior que 0"
        uuid usuario_id FK
        text motivo "obrigatório em perda e ajuste"
        timestamptz data_hora
    }
    cardapio_planejado {
        uuid id PK
        date data
        text tipo_refeicao "4 refeições"
        text descricao
    }
    tipos_restricao {
        uuid id PK
        text nome UK
    }
    contagem_restricoes {
        uuid id PK
        date data
        uuid tipo_restricao_id FK
        integer quantidade_alunos "só contagem, sem nomes"
    }
    configuracoes {
        uuid id PK
        text chave UK "dias_alerta_validade, nome_colegio"
        jsonb valor
    }
```

Também existem `categorias`, `unidades`, `fornecedores` e `locais_armazenamento` (nome e dados de contato/descrição).

## Saída FEFO

```mermaid
flowchart TD
    A[Cozinha registra saída: produto + quantidade] --> B{Servidor: perfil pode movimentar?}
    B -- não --> X[Mensagem: peça acesso à direção]
    B -- sim --> C[Zod valida a quantidade]
    C --> D["RPC registrar_saida (transação no banco)"]
    D --> E[Trava os lotes do produto]
    E --> F{Quantidade maior que o disponível<br/>em lotes não vencidos?}
    F -- sim --> Y[Bloqueia e explica quanto há e quanto está vencido]
    F -- não --> G[Percorre lotes por validade mais próxima]
    G --> H[Tira do lote o que der; o resto vai para o próximo]
    H --> I[Grava uma movimentação por lote usado]
    I --> J[Lote zerado fica inativo, mas continua no histórico]
```

## Permissões em três camadas

```mermaid
flowchart LR
    U[Usuário] --> I[Interface: esconde o que o perfil não usa]
    I --> S["Servidor: exigirPermissao() + Zod em cada ação"]
    S --> R[Banco: RLS em todas as tabelas + RPCs com checagem de perfil]
```

## Publicação

```mermaid
flowchart LR
    N[Navegador / celular] -->|HTTPS| V[Vercel: Next.js]
    V -->|chave anon + sessão do usuário| SB[(Supabase: Postgres + Auth)]
    V -->|chave de serviço, só no servidor| SB
    SB -->|e-mails de conta e senha| G[Gmail escolarestoque@gmail.com]
```
