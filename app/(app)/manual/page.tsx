import type { Metadata } from "next";
import { BotaoImprimir } from "./botao-imprimir";

export const metadata: Metadata = { title: "Manual de uso · Despensa CAPE" };

function Secao({ id, numero, titulo, children }: { id: string; numero: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3 border-b pb-2">
        <span className="text-2xl font-semibold text-primary">{numero}</span>
        <h2 className="text-xl font-semibold text-foreground">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

function SubSecao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-base font-semibold text-foreground">{titulo}</h3>
      {children}
    </div>
  );
}

function Passos({ itens }: { itens: string[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {itens.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {i + 1}
          </span>
          <span className="pt-0.5 text-sm leading-relaxed text-foreground" dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ol>
  );
}

function Topicos({ itens }: { itens: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5 pl-1">
      {itens.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  );
}

function Destaque({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 border-primary bg-ok-fundo px-4 py-3 text-sm leading-relaxed text-foreground">
      {children}
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 border-alerta bg-alerta-fundo px-4 py-3 text-sm leading-relaxed text-foreground">
      {children}
    </div>
  );
}

function Definicoes({ itens }: { itens: { termo: string; descricao: string }[] }) {
  return (
    <div className="flex flex-col divide-y rounded-xl border">
      {itens.map(({ termo, descricao }) => (
        <div key={termo} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:gap-4">
          <span className="w-full shrink-0 text-sm font-semibold sm:w-44">{termo}</span>
          <span className="text-sm leading-relaxed text-muted-foreground">{descricao}</span>
        </div>
      ))}
    </div>
  );
}

export default function PaginaManual() {
  return (
    <div className="mx-auto max-w-2xl pb-16 print:max-w-none print:pb-0">

      <div className="mb-6 flex justify-end print:hidden">
        <BotaoImprimir />
      </div>

      {/* Capa */}
      <div className="mb-10 rounded-2xl border bg-card p-8 print:rounded-none print:border-0 print:p-0">
        <p className="text-sm font-medium text-primary">Centro de Apoio Pedagógico Especializado</p>
        <h1 className="mt-1 text-3xl font-semibold text-foreground">Despensa CAPE</h1>
        <p className="mt-1 text-lg text-muted-foreground">Manual de uso do sistema de estoque da cozinha</p>
        <p className="mt-5 text-xs text-muted-foreground">Versão novembro 2026 · Para a direção e as funcionárias da cozinha</p>
      </div>

      {/* Sumário */}
      <div className="mb-10 rounded-xl border bg-card p-5 print:break-after-page">
        <p className="mb-3 text-sm font-semibold">Conteúdo do manual</p>
        <div className="grid gap-1 sm:grid-cols-2">
          {[
            ["1", "O que é o sistema e quem usa"],
            ["2", "Primeiro acesso e senha"],
            ["3", "Tour guiado"],
            ["4", "Navegação"],
            ["5", "Painel"],
            ["6", "Produtos"],
            ["7", "Lotes e validade"],
            ["8", "Movimentações"],
            ["9", "Lista de compras"],
            ["10", "Cardápio"],
            ["11", "Receitas"],
            ["12", "Restrições alimentares"],
            ["13", "Relatórios"],
            ["14", "Cadastros auxiliares"],
            ["15", "Usuários"],
            ["16", "Configurações"],
            ["17", "Perguntas frequentes"],
          ].map(([n, t]) => (
            <div key={n} className="flex gap-2 text-sm">
              <span className="w-7 shrink-0 font-semibold text-primary">{n}.</span>
              <span className="text-muted-foreground">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-10">

        {/* 1 */}
        <Secao id="o-que-e" numero="1" titulo="O que é o sistema e quem usa">
          <p className="text-sm leading-relaxed text-foreground">
            O <strong>Despensa CAPE</strong> substitui o caderno de entrada e saída e as planilhas avulsas da cozinha.
            Tudo fica em um lugar só, acessível pelo computador, tablet ou celular — os botões são grandes para
            funcionar bem mesmo com as mãos molhadas.
          </p>
          <SubSecao titulo="Perfis de acesso">
            <Definicoes itens={[
              { termo: "Administrador (direção)", descricao: "Acesso completo: produtos, estoque, movimentações, cardápio, receitas, restrições, relatórios, cadastros, usuários e configurações." },
              { termo: "Operador (cozinha)", descricao: "Registra entradas, saídas, perdas e ajustes. Gerencia produtos, cardápio, receitas e restrições. Não acessa Usuários nem Configurações." },
              { termo: "Consulta", descricao: "Visualiza tudo e baixa relatórios. Não altera nenhum dado." },
            ]} />
          </SubSecao>
        </Secao>

        {/* 2 */}
        <Secao id="acesso" numero="2" titulo="Primeiro acesso e senha">
          <SubSecao titulo="Entrar no sistema">
            <Passos itens={[
              "Abra <strong>https://despensa-cape.vercel.app</strong> no navegador.",
              "Digite seu <strong>e-mail</strong> e <strong>senha</strong> e toque em <strong>Entrar</strong>.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Criar conta nova">
            <Passos itens={[
              "Na tela de login, toque em <strong>Criar uma conta nova</strong>.",
              "Informe nome, e-mail e uma senha (veja os requisitos abaixo).",
              "A conta começa com perfil <strong>Consulta</strong>. A direção precisa alterar para Operador em <strong>Usuários</strong>.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Esqueci minha senha">
            <Passos itens={[
              "Toque em <strong>Esqueci minha senha</strong> na tela de login.",
              "Digite o e-mail cadastrado e toque em <strong>Enviar link</strong>.",
              "Abra o e-mail recebido (verifique o spam) e clique em <em>Redefinir senha</em>. O link expira em 24h.",
              "Digite e confirme a nova senha e toque em <strong>Salvar nova senha</strong>.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Requisitos de senha">
            <Topicos itens={[
              "Mínimo de 8 caracteres.",
              "Pelo menos uma letra maiúscula, uma minúscula e um número.",
              "O sistema avisa em tempo real se a senha está fraca enquanto você digita.",
              "O ícone do olho ao lado do campo mostra ou esconde a senha. Se o Caps Lock estiver ligado, um aviso aparece.",
            ]} />
          </SubSecao>
        </Secao>

        {/* 3 */}
        <Secao id="tour" numero="3" titulo="Tour guiado — aprenda enquanto usa">
          <p className="text-sm leading-relaxed text-foreground">
            No primeiro acesso, o sistema exibe automaticamente um <strong>tour de boas-vindas</strong> de 4 passos
            apresentando as partes principais. Depois, ao entrar em cada tela pela primeira vez, um novo tour
            específico daquela tela é exibido automaticamente.
          </p>
          <Destaque>
            Sempre que quiser rever o tour de uma tela, toque no botão <strong>?</strong> (círculo fixo no canto
            inferior direito). Os passos aparecem com setas e explicações em balões — avance com <em>Próximo</em>
            ou feche com <em>Entendi</em>.
          </Destaque>
        </Secao>

        {/* 4 */}
        <Secao id="navegacao" numero="4" titulo="Navegação">
          <p className="text-sm leading-relaxed text-foreground">
            No computador e tablet grande, o menu fica fixo na coluna esquerda.
            No celular, toque em <strong>Menu</strong> (canto superior esquerdo) para abrir o menu lateral.
          </p>
          <SubSecao titulo="Itens do menu">
            <Definicoes itens={[
              { termo: "Painel", descricao: "Visão geral de alertas e situação do estoque." },
              { termo: "Produtos", descricao: "Cadastro e edição de todos os produtos da cozinha." },
              { termo: "Lotes e validade", descricao: "Lotes ativos, vencidos e filtros por produto/validade." },
              { termo: "Movimentações", descricao: "Histórico completo de entradas, saídas, perdas e ajustes." },
              { termo: "Lista de compras", descricao: "O que comprar (automático) + itens extras adicionados manualmente." },
              { termo: "Cardápio", descricao: "Planejamento das refeições da semana." },
              { termo: "Receitas", descricao: "Caderno de receitas com saída automática de estoque." },
              { termo: "Restrições alimentares", descricao: "Contagem de alunos com restrição por refeição." },
              { termo: "Relatórios", descricao: "Gera PDF e Excel de consumo, perdas e lista de compras." },
              { termo: "Cadastros", descricao: "Categorias, fornecedores, locais, unidades e tipos de restrição." },
              { termo: "Usuários", descricao: "Gerenciar contas e perfis — somente direção." },
              { termo: "Configurações", descricao: "Ajustes do sistema — somente direção." },
              { termo: "Manual", descricao: "Este documento." },
            ]} />
          </SubSecao>
        </Secao>

        {/* 5 */}
        <Secao id="painel" numero="5" titulo="Painel">
          <p className="text-sm leading-relaxed text-foreground">
            É a primeira tela após o login. Mostra quatro indicadores no topo:
          </p>
          <Definicoes itens={[
            { termo: "Lotes vencidos", descricao: "Lotes com data de validade passada e quantidade maior que zero. Clique para ver a lista e registrar perda direto." },
            { termo: "Vencendo em breve", descricao: "Lotes que vencem dentro do número de dias configurado (padrão: 7 dias)." },
            { termo: "Estoque baixo", descricao: "Produtos com quantidade igual ou abaixo do mínimo cadastrado." },
            { termo: "Produtos ativos", descricao: "Total de produtos cadastrados e ativos no sistema." },
          ]} />
          <p className="text-sm leading-relaxed text-foreground">
            Abaixo dos indicadores há dois atalhos: <strong>Registrar entrada</strong> e <strong>Lista de compras</strong>.
            Os alertas de lotes vencidos e vencendo aparecem em cartões com cor e ícone — toque em
            <strong> Registrar perda</strong> para lançar a perda direto do alerta.
          </p>
        </Secao>

        {/* 6 */}
        <Secao id="produtos" numero="6" titulo="Produtos">
          <SubSecao titulo="Cadastrar um produto novo">
            <Passos itens={[
              "Toque em <strong>Novo produto</strong>.",
              "Preencha: nome, categoria, unidade de medida (kg, L, unid., etc.), estoque mínimo (quantidade abaixo da qual o sistema avisa que precisa comprar), fornecedor habitual e local de armazenamento padrão.",
              "Toque em <strong>Salvar produto</strong>.",
              "Para adicionar estoque, vá a <strong>Lotes e validade → Registrar entrada</strong>.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Editar um produto">
            <p className="text-sm leading-relaxed text-foreground">
              Clique no nome do produto na lista → role até <strong>Editar produto</strong> → altere e salve.
            </p>
          </SubSecao>
          <SubSecao titulo="Desativar um produto">
            <p className="text-sm leading-relaxed text-foreground">
              Na tela de detalhes, role até o final e clique em <em>Desativar produto</em>. O produto some da lista
              principal mas permanece no histórico. Produtos com estoque ativo não podem ser desativados.
            </p>
          </SubSecao>
        </Secao>

        {/* 7 */}
        <Secao id="lotes" numero="7" titulo="Lotes e validade">
          <p className="text-sm leading-relaxed text-foreground">
            Cada embalagem (ou conjunto de embalagens com a mesma validade) recebida na mesma data é um <strong>lote</strong>.
            O controle de lotes mostra exatamente o que está prestes a vencer e quanto tem de cada produto.
          </p>
          <SubSecao titulo="Registrar entrada de mercadoria">
            <Passos itens={[
              "Toque em <strong>Registrar entrada</strong>.",
              "Escolha o <strong>produto</strong>.",
              "Informe a <strong>quantidade</strong> recebida e a <strong>data de validade</strong> que está na embalagem.",
              "O sistema preenche automaticamente código do lote, data de entrada, fornecedor e local padrão — altere se necessário.",
              "Toque em <strong>Registrar entrada</strong>.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Filtrar lotes">
            <p className="text-sm leading-relaxed text-foreground">
              Use os filtros no topo para ver lotes de um produto específico ou filtrar por situação:
              <strong> Todos</strong>, <strong>Ativos</strong>, <strong>Vencidos</strong> ou <strong>Vazios</strong>.
            </p>
          </SubSecao>
          <Destaque>
            <strong>O que é FEFO?</strong> — <em>First Expired, First Out</em> (primeiro a vencer, primeiro a sair).
            Quando você registra uma saída, o sistema consome automaticamente o lote com a validade mais próxima,
            evitando desperdício e garantindo que nada vença esquecido na prateleira.
          </Destaque>
        </Secao>

        {/* 8 */}
        <Secao id="movimentacoes" numero="8" titulo="Movimentações">
          <Aviso>
            <strong>Movimentações são permanentes</strong> — nada é apagado, pois isso mantém o histórico fiel.
            Para corrigir um erro, registre um <strong>ajuste</strong>.
          </Aviso>
          <SubSecao titulo="Registrar saída">
            <Passos itens={[
              "Toque em <strong>Registrar saída</strong>.",
              "Escolha o produto e informe a quantidade usada.",
              "O sistema aplica o FEFO automaticamente — você não precisa escolher o lote.",
              "Se a quantidade for maior do que o estoque disponível, o sistema bloqueia e avisa.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Registrar perda">
            <Passos itens={[
              "Toque em <strong>Registrar perda</strong>.",
              "Escolha o <strong>lote específico</strong> (a perda sai de um lote determinado).",
              "Informe a quantidade e selecione o motivo: Vencido, Estragado, Embalagem danificada, Contaminado ou Descartado.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Registrar ajuste">
            <p className="text-sm leading-relaxed text-foreground">
              Use para corrigir a contagem de um lote — para <strong>mais</strong> (encontrou embalagem não registrada)
              ou para <strong>menos</strong> (sobrou menos do que estava no sistema).
            </p>
            <Passos itens={[
              "Toque em <strong>Registrar ajuste</strong>.",
              "Escolha o lote, o tipo (acréscimo ou redução), a quantidade e o motivo.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Histórico">
            <p className="text-sm leading-relaxed text-foreground">
              A lista mostra todas as movimentações do mais recente para o mais antigo.
              Use os filtros de data e tipo para localizar um lançamento específico.
            </p>
          </SubSecao>
        </Secao>

        {/* 9 */}
        <Secao id="compras" numero="9" titulo="Lista de compras">
          <p className="text-sm leading-relaxed text-foreground">
            A lista tem duas partes: itens gerados <strong>automaticamente</strong> pelo sistema e
            <strong> itens extras</strong> adicionados manualmente.
          </p>
          <SubSecao titulo="Estoque baixo (automático)">
            <p className="text-sm leading-relaxed text-foreground">
              O sistema verifica quais produtos estão com estoque igual ou abaixo do mínimo e lista o que
              precisa ser comprado (mínimo − estoque atual), com fornecedor habitual e telefone.
            </p>
          </SubSecao>
          <SubSecao titulo="Adicionar item extra (manual)">
            <Passos itens={[
              "No campo <strong>Adicionar item à lista</strong>, informe nome, quantidade e unidade (opcional).",
              "Toque em <strong>Adicionar</strong>. O item aparece na lista e fica salvo até ser marcado como comprado.",
              "Quando comprar, marque o checkbox <strong>Comprado</strong>. O item fica na lista, mas riscado.",
              "Use <strong>Limpar comprados</strong> para remover todos os itens já comprados de uma vez.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Exportar">
            <p className="text-sm leading-relaxed text-foreground">
              Toque em <strong>PDF</strong> para gerar uma lista de mercado pronta para imprimir, ou em
              <strong> Excel</strong> para abrir no computador. Ambos incluem os itens automáticos e os extras.
            </p>
          </SubSecao>
        </Secao>

        {/* 10 */}
        <Secao id="cardapio" numero="10" titulo="Cardápio">
          <p className="text-sm leading-relaxed text-foreground">
            Planejamento das refeições da semana (segunda a sexta). As quatro refeições são:
            Café da manhã, Lanche da manhã, Almoço e Lanche da tarde.
          </p>
          <SubSecao titulo="Navegar entre semanas">
            <p className="text-sm leading-relaxed text-foreground">
              Use <strong>← Semana anterior</strong> e <strong>Próxima semana →</strong>, ou toque em
              <strong> Esta semana</strong> para voltar ao presente.
            </p>
          </SubSecao>
          <SubSecao titulo="Editar um dia">
            <Passos itens={[
              "Clique na data desejada na grade da semana.",
              "Preencha o que será servido em cada refeição (campo de texto livre).",
              "Opcionalmente, vincule uma receita do caderno em <strong>Receita vinculada</strong> — o sistema avisa se o estoque for insuficiente.",
              "Toque em <strong>Salvar cardápio do dia</strong>.",
            ]} />
            <p className="text-sm text-muted-foreground">Refeições em branco aparecem como <em>Não planejado</em> na grade.</p>
          </SubSecao>
        </Secao>

        {/* 11 */}
        <Secao id="receitas" numero="11" titulo="Receitas">
          <p className="text-sm leading-relaxed text-foreground">
            O caderno de receitas guarda as preparações da cozinha com ingredientes e modo de preparo.
            Ao <strong>preparar uma receita</strong>, o sistema desconta os ingredientes do estoque
            automaticamente, usando o FEFO para cada produto.
          </p>
          <SubSecao titulo="Cadastrar uma receita">
            <Passos itens={[
              "Toque em <strong>Nova receita</strong>.",
              "Informe: nome, descrição rápida (opcional), <strong>porções base</strong> (quantidade de porções para a qual os ingredientes são calculados) e modo de preparo (opcional).",
              "Toque em <strong>Criar receita</strong>. O sistema abre a tela da receita.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Adicionar ingredientes">
            <Passos itens={[
              "Na seção <strong>Ingredientes</strong>, escolha o produto do estoque.",
              "Informe a quantidade e uma observação opcional (ex.: &quot;peneirado&quot;).",
              "Toque em <strong>Adicionar</strong>. Repita para cada ingrediente.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Preparar uma receita — saída automática">
            <Passos itens={[
              "Na tela da receita, toque em <strong>Preparar agora</strong>.",
              "Informe quantas porções serão preparadas. O sistema recalcula os ingredientes proporcionalmente.",
              "A lista mostra os ingredientes necessários e destaca em vermelho os que têm estoque insuficiente.",
              "Toque em <strong>Confirmar e registrar saída</strong>. O sistema desconta cada ingrediente do estoque via FEFO. Se um ingrediente estiver em falta, os demais são descontados normalmente.",
            ]} />
          </SubSecao>
        </Secao>

        {/* 12 */}
        <Secao id="restricoes" numero="12" titulo="Restrições alimentares">
          <Destaque>
            O sistema registra apenas a <strong>quantidade de alunos</strong> com cada restrição.
            Nenhum nome ou dado pessoal é armazenado.
          </Destaque>
          <SubSecao titulo="Registrar contagem do dia">
            <Passos itens={[
              "Escolha a data usando os botões <strong>← Dia anterior</strong> / <strong>Próximo dia →</strong>.",
              "Selecione a aba da refeição: <strong>Café da manhã</strong>, <strong>Lanche da manhã</strong>, <strong>Almoço</strong> ou <strong>Lanche da tarde</strong>.",
              "Informe a quantidade de alunos para cada tipo de restrição (zero se nenhum).",
              "Toque em <strong>Salvar</strong>. Repita para cada refeição do dia.",
            ]} />
            <p className="text-sm text-muted-foreground">
              As abas mostram o total da refeição como um badge. O resumo do dia (soma das 4 refeições) aparece acima do formulário.
            </p>
          </SubSecao>
          <SubSecao titulo="Imprimir o dia">
            <p className="text-sm leading-relaxed text-foreground">
              Toque em <strong>Imprimir dia</strong> para gerar um PDF A4 com as 4 refeições prontas para
              colar na parede da cozinha. O PDF mostra cada tipo de restrição, a quantidade por refeição
              e o total geral do dia.
            </p>
          </SubSecao>
        </Secao>

        {/* 13 */}
        <Secao id="relatorios" numero="13" titulo="Relatórios">
          <p className="text-sm leading-relaxed text-foreground">
            Escolha o período (<strong>De</strong> / <strong>Até</strong>) e clique em
            <strong> PDF</strong> para imprimir ou <strong>Excel</strong> para editar no computador.
          </p>
          <Definicoes itens={[
            { termo: "Consumo por período", descricao: "Quanto saiu de cada produto (entradas, saídas, perdas e ajustes), agrupado por categoria. Útil para prestação de contas e planejamento de compras." },
            { termo: "Vencidos e perdas", descricao: "Lotes com data vencida que ainda têm estoque, e todas as movimentações de perda e ajuste negativo do período." },
            { termo: "Lista de compras", descricao: "O que precisa comprar hoje (estoque abaixo do mínimo + itens extras). O período aparece apenas no cabeçalho." },
          ]} />
        </Secao>

        {/* 14 */}
        <Secao id="cadastros" numero="14" titulo="Cadastros auxiliares">
          <p className="text-sm leading-relaxed text-foreground">
            Em <strong>Cadastros</strong> ficam as tabelas de referência usadas em todo o sistema.
          </p>
          <Definicoes itens={[
            { termo: "Categorias", descricao: "Agrupa produtos nos relatórios. Ex.: Grãos, Laticínios, Carnes, Hortifrúti." },
            { termo: "Fornecedores", descricao: "Empresa ou pessoa de quem se compra. Aparece na lista de compras com telefone." },
            { termo: "Locais de armazenamento", descricao: "Onde o produto fica guardado. Ex.: Dispensa, Geladeira, Freezer." },
            { termo: "Unidades de medida", descricao: "Sigla usada nas quantidades. Ex.: kg, g, L, mL, unid., cx., pct." },
            { termo: "Tipos de restrição", descricao: "Categorias de restrição alimentar dos alunos. Ex.: Lactose, Glúten, Amendoim, Vegetariano." },
          ]} />
          <p className="text-sm leading-relaxed text-foreground">
            Para adicionar: preencha o formulário no topo e toque em <strong>Adicionar</strong>.
            Para editar: clique no lápis. Para excluir: clique na lixeira — itens em uso não podem ser excluídos.
          </p>
        </Secao>

        {/* 15 */}
        <Secao id="usuarios" numero="15" titulo="Usuários">
          <p className="text-sm text-muted-foreground">Disponível apenas para a direção (administrador).</p>
          <SubSecao titulo="Convidar uma nova funcionária">
            <Passos itens={[
              "Toque em <strong>Novo usuário</strong>.",
              "Informe o nome, o e-mail e o perfil (Operador para cozinha, Consulta para quem só visualiza).",
              "O sistema envia um e-mail de convite com link para a pessoa criar a senha.",
            ]} />
          </SubSecao>
          <SubSecao titulo="Alterar o perfil de alguém">
            <p className="text-sm leading-relaxed text-foreground">
              Clique no nome da pessoa na lista → escolha o novo perfil → toque em <strong>Salvar</strong>.
              A mudança tem efeito imediato na próxima ação da pessoa.
            </p>
          </SubSecao>
          <SubSecao titulo="Desativar o acesso">
            <p className="text-sm leading-relaxed text-foreground">
              Na tela do usuário, role até o final e clique em <em>Desativar acesso</em>. A pessoa não consegue
              mais entrar, mas o histórico de movimentações feitas por ela é mantido.
            </p>
          </SubSecao>
        </Secao>

        {/* 16 */}
        <Secao id="configuracoes" numero="16" titulo="Configurações">
          <p className="text-sm text-muted-foreground">Disponível apenas para a direção (administrador).</p>
          <p className="text-sm leading-relaxed text-foreground">
            O único ajuste disponível é <strong>Dias de alerta de validade</strong>. Com o valor padrão de
            <strong> 7 dias</strong>, o sistema marca como alerta qualquer lote que vença nos próximos 7 dias.
            Aumente para ter mais antecedência; diminua se os alertas aparecerem cedo demais.
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            Toque em <strong>Salvar configurações</strong> após alterar.
          </p>
        </Secao>

        {/* 17 */}
        <Secao id="faq" numero="17" titulo="Perguntas frequentes">
          <div className="flex flex-col gap-5">
            {[
              {
                p: "O sistema sumiu com um lançamento — onde está?",
                r: "O sistema nunca apaga movimentações. Vá em <strong>Movimentações</strong> e use os filtros de data para localizar o lançamento. Se a quantidade parecer errada, registre um <strong>ajuste</strong> explicando o motivo.",
              },
              {
                p: "Errei a quantidade de uma saída. O que faço?",
                r: "Registre um <strong>ajuste de acréscimo</strong> no lote afetado com a diferença e escreva o motivo (ex.: &quot;Correção: saída registrada a mais&quot;). O estoque fica correto e o histórico preservado.",
              },
              {
                p: "Produto aparece com estoque baixo mas tem embalagem na dispensa.",
                r: "A entrada dessa embalagem não foi registrada. Vá em <strong>Lotes e validade → Registrar entrada</strong> e lance a embalagem. O alerta some automaticamente.",
              },
              {
                p: "O e-mail de redefinição de senha não chegou.",
                r: "Verifique a pasta de spam. O remetente é <em>no-reply@supabase.io</em>. Se não encontrar, aguarde 2 minutos e tente novamente. Se persistir, peça à direção para criar nova senha em <strong>Usuários</strong>.",
              },
              {
                p: "Posso usar o sistema no celular?",
                r: "Sim. O sistema funciona em qualquer celular moderno com internet. Não é necessário instalar nenhum aplicativo — basta abrir o endereço no navegador.",
              },
              {
                p: "O que acontece se a internet cair no meio de um lançamento?",
                r: "O formulário fica na tela. Assim que a conexão voltar, toque novamente em <strong>Salvar</strong>. O sistema não salva parcialmente — ou salva tudo ou não salva nada.",
              },
            ].map(({ p, r }) => (
              <div key={p} className="rounded-xl border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">{p}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: r }} />
              </div>
            ))}
          </div>
        </Secao>

      </div>

      {/* Rodapé */}
      <div className="mt-14 border-t pt-6 text-xs text-muted-foreground">
        <p>Despensa CAPE · Centro de Apoio Pedagógico Especializado · Versão novembro 2026</p>
        <p className="mt-1">Dúvidas ou problemas: contate a direção.</p>
      </div>

    </div>
  );
}
