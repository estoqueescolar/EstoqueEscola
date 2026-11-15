// Definição dos passos de cada tour por rota.
// Cada passo usa seletores CSS que existem nas páginas correspondentes.

export interface PassoTour {
  element?: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "bottom" | "left" | "right";
  };
}

export const TOURS: Record<string, PassoTour[]> = {
  "/painel": [
    {
      popover: {
        title: "Bem-vindo à Despensa CAPE 👋",
        description:
          "Este é o <strong>Painel</strong> — sua visão geral da cozinha. Aqui você vê alertas, lotes vencendo e o resumo do estoque. Vamos conhecer cada parte?",
      },
    },
    {
      element: "[data-tour='indicadores']",
      popover: {
        title: "Indicadores rápidos",
        description:
          "Esses quatro cartões mostram o estado atual: lotes vencidos, lotes vencendo em breve, produtos com estoque baixo e total de produtos ativos. Clique em qualquer cartão para ver os detalhes.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='alerta-validade']",
      popover: {
        title: "Alertas de validade",
        description:
          "Lista os lotes vencidos ou prestes a vencer. Use FEFO: sempre consuma primeiro o lote com validade mais próxima. Clique no nome do produto para ver o lote completo.",
        side: "top",
      },
    },
    {
      element: "[data-tour='lista-compras']",
      popover: {
        title: "Lista de compras",
        description:
          "Produtos cujo estoque ficou abaixo do mínimo aparecem aqui automaticamente. A quantidade sugerida é a diferença entre o mínimo e o estoque atual.",
        side: "top",
      },
    },
    {
      element: "[data-tour='btn-entrada']",
      popover: {
        title: "Registrar entrada",
        description:
          "Use este botão quando receber mercadorias: informe o produto, quantidade, validade e local. Cada entrega cria um novo lote rastreável.",
        side: "bottom",
      },
    },
  ],

  "/produtos": [
    {
      popover: {
        title: "Produtos cadastrados",
        description:
          "Aqui ficam todos os produtos que podem entrar no estoque. Um produto é o <em>modelo</em> (ex.: Arroz 5 kg); os lotes são as <em>embalagens físicas</em> com validade e quantidade.",
      },
    },
    {
      element: "[data-tour='btn-novo-produto']",
      popover: {
        title: "Adicionar produto",
        description:
          "Clique para cadastrar um novo produto. Defina o nome, unidade (kg, L, un…), categoria e o estoque mínimo — abaixo desse valor o sistema gera alerta de compra.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='lista-produtos']",
      popover: {
        title: "Lista de produtos",
        description:
          "Cada linha mostra o estoque atual (soma dos lotes ativos), o mínimo e a situação. Clique no produto para ver os lotes, editar ou registrar uma movimentação.",
        side: "top",
      },
    },
  ],

  "/lotes": [
    {
      popover: {
        title: "Lotes e validade",
        description:
          "Um lote é uma entrada de mercadoria com validade e quantidade próprias. O sistema usa <strong>FEFO</strong>: nas saídas, o lote com vencimento mais próximo é consumido primeiro.",
      },
    },
    {
      element: "[data-tour='btn-entrada']",
      popover: {
        title: "Nova entrada",
        description:
          "Registre aqui cada recebimento de mercadoria. Informe o produto, a quantidade, a data de validade e onde será guardado. Um lote é criado automaticamente.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='filtros-lotes']",
      popover: {
        title: "Filtros",
        description:
          "Filtre por produto, situação (ativo, vencido, vencendo) ou local de armazenamento para encontrar rapidamente o que precisa.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='lista-lotes']",
      popover: {
        title: "Lista de lotes",
        description:
          "Cada lote mostra produto, quantidade, validade e local. A etiqueta colorida indica a situação: verde = ok, amarela = vencendo em breve, vermelha = vencido.",
        side: "top",
      },
    },
  ],

  "/movimentacoes": [
    {
      popover: {
        title: "Movimentações",
        description:
          "Registro completo de tudo que entrou e saiu do estoque. Movimentações são <strong>imutáveis</strong>: se errou, registre um ajuste — nunca apague.",
      },
    },
    {
      element: "[data-tour='btn-saida']",
      popover: {
        title: "Registrar saída",
        description:
          "Use para consumo do dia a dia (refeições servidas). O sistema desconta automaticamente do lote mais próximo do vencimento (FEFO).",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='btn-perda']",
      popover: {
        title: "Registrar perda",
        description:
          "Para alimentos vencidos, estragados ou descartados. Informe o motivo — esse dado aparece nos relatórios mensais.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='btn-ajuste']",
      popover: {
        title: "Registrar ajuste",
        description:
          "Correção de quantidade após conferência física do estoque. Use quando o sistema divergir do estoque real. Sempre informe o motivo.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='lista-movimentacoes']",
      popover: {
        title: "Histórico",
        description:
          "Cada movimentação mostra tipo, produto, quantidade, responsável e data. Use os filtros para encontrar por período ou tipo.",
        side: "top",
      },
    },
  ],

  "/compras": [
    {
      popover: {
        title: "Lista de compras",
        description:
          "Gerada automaticamente: todo produto cujo estoque atual ficou abaixo do mínimo aparece aqui, com a quantidade sugerida para repor.",
      },
    },
    {
      element: "[data-tour='lista-compras']",
      popover: {
        title: "O que comprar",
        description:
          "A coluna <em>Sugerido</em> é a diferença entre o estoque mínimo e o atual. Leve esta lista para o mercado ou use para fazer o pedido.",
        side: "top",
      },
    },
  ],

  "/cardapio": [
    {
      popover: {
        title: "Cardápio planejado",
        description:
          "Registre o cardápio de cada refeição do dia. Isso ajuda a planejar as saídas do estoque e a comunicar o menu às famílias.",
      },
    },
    {
      element: "[data-tour='nav-semana']",
      popover: {
        title: "Navegação por semana",
        description:
          "Use as setas para avançar ou voltar semanas. Clique em um dia para editar o cardápio daquele dia.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='grade-semana']",
      popover: {
        title: "Grade semanal",
        description:
          "Cada coluna é um dia da semana. As linhas são as refeições: café da manhã, lanche da manhã, almoço e lanche da tarde. Clique em qualquer célula para editar.",
        side: "top",
      },
    },
  ],

  "/restricoes": [
    {
      popover: {
        title: "Restrições alimentares",
        description:
          "Contagem de alunos com restrições por tipo de refeição. As informações são <strong>apenas quantidades</strong> — nenhum nome de aluno é armazenado.",
      },
    },
    {
      element: "[data-tour='tabela-restricoes']",
      popover: {
        title: "Tabela de contagens",
        description:
          "Cada linha é um tipo de restrição (alergia, intolerância, preferência). As colunas mostram quantos alunos têm aquela restrição em cada refeição.",
        side: "top",
      },
    },
  ],

  "/relatorios": [
    {
      popover: {
        title: "Relatórios",
        description:
          "Gere documentos em PDF ou planilha XLSX para prestação de contas, controle de perdas e histórico de movimentações.",
      },
    },
    {
      element: "[data-tour='opcoes-relatorio']",
      popover: {
        title: "Tipos de relatório",
        description:
          "Escolha entre: Movimentações (tudo que entrou/saiu), Estoque atual, Perdas do período ou Cardápio da semana.",
        side: "right",
      },
    },
    {
      element: "[data-tour='periodo-relatorio']",
      popover: {
        title: "Período",
        description:
          "Defina o intervalo de datas. Para períodos muito longos o sistema pode dividir em partes menores — siga a orientação na tela.",
        side: "top",
      },
    },
  ],

  "/usuarios": [
    {
      popover: {
        title: "Gerenciar usuários",
        description:
          "Visível só para a Diretora (Administrador). Aqui você aprova novas contas, altera perfis e desativa acessos.",
      },
    },
    {
      element: "[data-tour='lista-usuarios']",
      popover: {
        title: "Lista de usuários",
        description:
          "Cada usuário tem um perfil: <strong>Administrador</strong> (acesso total), <strong>Operador</strong> (registra movimentações) ou <strong>Consulta</strong> (só visualiza). Novas contas chegam como Consulta — a Diretora promove.",
        side: "top",
      },
    },
  ],

  "/cadastros": [
    {
      popover: {
        title: "Cadastros auxiliares",
        description:
          "Configure as listas que aparecem nos formulários: categorias de produto, unidades de medida, locais de armazenamento e tipos de restrição alimentar.",
      },
    },
  ],

  "/receitas": [
    {
      popover: {
        title: "Caderno de receitas",
        description:
          "Aqui você cadastra as receitas da cozinha com ingredientes e modo de preparo. Cada receita mostra quanto estoque será consumido.",
      },
    },
    {
      element: "[data-tour='btn-nova-receita']",
      popover: {
        title: "Nova receita",
        description: "Clique aqui para cadastrar uma nova receita com nome, descrição, porções e modo de preparo.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='lista-receitas']",
      popover: {
        title: "Lista de receitas",
        description:
          "Todas as receitas ativas aparecem aqui. Clique em uma receita para ver os ingredientes e ter a opção de preparar, o que vai registrar automaticamente a saída dos ingredientes do estoque.",
        side: "top",
      },
    },
  ],

  "/configuracoes": [
    {
      popover: {
        title: "Configurações",
        description:
          "Ajuste os parâmetros do sistema, como quantos dias de antecedência o alerta de validade deve aparecer antes do vencimento.",
      },
    },
  ],
};

// Tour de boas-vindas exibido uma única vez após o primeiro login.
export const TOUR_BOAS_VINDAS: PassoTour[] = [
  {
    popover: {
      title: "Bem-vinda à Despensa CAPE! 🎉",
      description:
        "Este é o sistema de controle de estoque e validade da cozinha. Vou mostrar como tudo funciona em poucos passos.",
    },
  },
  {
    element: "nav[aria-label='Menu principal']",
    popover: {
      title: "Menu principal",
      description:
        "Aqui você acessa todas as telas do sistema: Painel, Produtos, Lotes, Movimentações, Cardápio e muito mais.",
      side: "right",
    },
  },
  {
    element: "[data-tour='btn-ajuda']",
    popover: {
      title: "Botão de ajuda",
      description:
        "Sempre que tiver dúvida, clique neste botão <strong>?</strong> para ver um guia da tela atual.",
      side: "left",
    },
  },
  {
    popover: {
      title: "Pronto para começar!",
      description:
        "Comece pelo <strong>Painel</strong> para ver o resumo do estoque, ou vá em <strong>Produtos</strong> para cadastrar os itens da despensa. Em cada tela o botão <strong>?</strong> explica o que fazer.",
    },
  },
];
