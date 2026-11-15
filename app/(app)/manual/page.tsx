import type { Metadata } from "next";
import { BotaoImprimir } from "./botao-imprimir";

export const metadata: Metadata = { title: "Manual de uso · Despensa CAPE" };

export default function PaginaManual() {
  return (
    <div className="mx-auto max-w-3xl pb-16 print:max-w-none print:pb-0">
      {/* Botão imprimir — oculto na impressão */}
      <div className="mb-6 flex justify-end print:hidden">
        <BotaoImprimir />
      </div>

      <article className="prose prose-sm max-w-none
        prose-headings:font-semibold prose-headings:text-foreground
        prose-h1:text-2xl prose-h1:mb-1
        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-h2:border-b prose-h2:pb-1
        prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
        prose-p:text-sm prose-p:leading-relaxed prose-p:text-foreground
        prose-li:text-sm prose-li:text-foreground
        prose-strong:font-semibold prose-strong:text-foreground
        prose-table:text-sm prose-th:font-semibold
        prose-td:align-top prose-td:py-1.5
        print:prose-p:text-xs print:prose-li:text-xs print:prose-td:text-xs
      ">

        {/* Capa */}
        <div className="mb-10 rounded-xl border bg-card p-8 not-prose print:border-0 print:p-0">
          <p className="text-sm font-medium text-primary">Centro de Apoio Pedagógico Especializado</p>
          <h1 className="mt-1 text-3xl font-semibold text-foreground">Despensa CAPE</h1>
          <p className="mt-1 text-lg text-muted-foreground">Manual de uso do sistema de estoque</p>
          <p className="mt-4 text-xs text-muted-foreground">Para a direção e as funcionárias da cozinha · Versão novembro 2026</p>
        </div>

        {/* Sumário */}
        <nav aria-label="Sumário" className="not-prose mb-10 rounded-xl border bg-card p-5 print:break-after-page">
          <p className="mb-3 text-sm font-semibold">Sumário</p>
          <ol className="space-y-1 text-sm">
            {[
              ["1", "O que é o sistema e quem usa"],
              ["2", "Primeiro acesso e senha"],
              ["3", "Tour guiado — aprenda enquanto usa"],
              ["4", "Navegação e tela inicial"],
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
              <li key={n} className="flex gap-2 text-sm text-muted-foreground">
                <span className="w-6 shrink-0 font-medium text-primary">{n}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </nav>

        {/* ─── 1. O QUE É ─── */}
        <h2>1. O que é o sistema e quem usa</h2>
        <p>
          O <strong>Despensa CAPE</strong> é o sistema de controle de estoque e validade da cozinha do CAPE.
          Ele substitui o caderno de entrada e saída e as planilhas avulsas, centralizando tudo em um lugar
          acessível pelo computador, tablet ou celular — inclusive com as mãos molhadas, pois os botões são
          grandes e o sistema funciona bem em telas pequenas.
        </p>

        <h3>Perfis de acesso</h3>
        <table>
          <thead>
            <tr><th>Perfil</th><th>O que pode fazer</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Administrador</strong> (direção)</td>
              <td>Tudo: produtos, lotes, movimentações, cardápio, receitas, restrições, relatórios, cadastros auxiliares, usuários e configurações.</td>
            </tr>
            <tr>
              <td><strong>Operador</strong> (cozinha)</td>
              <td>Entradas, saídas, perdas, ajustes, cadastro de produtos e cadastros auxiliares, cardápio, receitas e restrições. Não acessa Usuários nem Configurações.</td>
            </tr>
            <tr>
              <td><strong>Consulta</strong></td>
              <td>Visualiza tudo e baixa relatórios. Não altera nenhum dado.</td>
            </tr>
          </tbody>
        </table>

        {/* ─── 2. PRIMEIRO ACESSO ─── */}
        <h2>2. Primeiro acesso e senha</h2>

        <h3>Entrar no sistema</h3>
        <ol>
          <li>Abra <strong>https://despensa-cape.vercel.app</strong> no navegador.</li>
          <li>Digite seu <strong>e-mail</strong> e <strong>senha</strong> e toque em <strong>Entrar</strong>.</li>
          <li>Se errar a senha 5 vezes seguidas, aguarde alguns minutos antes de tentar novamente.</li>
        </ol>

        <h3>Criar nova conta</h3>
        <ol>
          <li>Na tela de login, toque em <strong>Criar uma conta nova</strong>.</li>
          <li>Informe nome, e-mail e uma senha com pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um número.</li>
          <li>A conta criada começa com perfil <strong>Consulta</strong> (só visualiza). A direção precisa alterar para Operador em <strong>Usuários</strong>.</li>
        </ol>

        <h3>Esqueci minha senha</h3>
        <ol>
          <li>Na tela de login, toque em <strong>Esqueci minha senha</strong>.</li>
          <li>Digite o e-mail cadastrado e toque em <strong>Enviar link</strong>.</li>
          <li>Abra o e-mail recebido e clique no link <em>Redefinir senha</em>. O link expira em 24 horas.</li>
          <li>Digite e confirme a nova senha e toque em <strong>Salvar nova senha</strong>.</li>
        </ol>

        <h3>Requisitos de senha</h3>
        <ul>
          <li>Mínimo de 8 caracteres.</li>
          <li>Pelo menos uma letra maiúscula, uma minúscula e um número.</li>
          <li>O sistema avisa em tempo real se a senha está fraca enquanto você digita.</li>
          <li>O ícone do olho ao lado do campo mostra ou esconde a senha. Se o Caps Lock estiver ativado, um aviso aparece.</li>
        </ul>

        {/* ─── 3. TOUR ─── */}
        <h2>3. Tour guiado — aprenda enquanto usa</h2>
        <p>
          No primeiro acesso, o sistema exibe automaticamente um <strong>tour de boas-vindas</strong> de 4 passos
          apresentando as partes principais. Depois, ao entrar em cada tela pela primeira vez, um novo tour específico
          daquela tela é exibido.
        </p>
        <p>
          Sempre que quiser rever o tour de uma tela, toque no botão <strong>?</strong> (círculo azul) fixo no
          canto inferior direito da tela. Os passos aparecem com setas e explicações em balões — avance com
          <em>Próximo</em> ou feche com <em>Entendi</em>.
        </p>

        {/* ─── 4. NAVEGAÇÃO ─── */}
        <h2>4. Navegação e tela inicial</h2>
        <p>
          No computador e tablet grande, o menu fica fixo na coluna esquerda. No celular e tablet pequeno, toque
          em <strong>Menu</strong> (canto superior esquerdo) para abrir o menu lateral. Os itens são:
        </p>
        <table>
          <thead><tr><th>Item do menu</th><th>Para que serve</th></tr></thead>
          <tbody>
            <tr><td>Painel</td><td>Visão geral de alertas e situação do estoque.</td></tr>
            <tr><td>Produtos</td><td>Cadastro e edição de todos os produtos.</td></tr>
            <tr><td>Lotes e validade</td><td>Lotes ativos, vencidos e filtros por produto/validade.</td></tr>
            <tr><td>Movimentações</td><td>Histórico de entradas, saídas, perdas e ajustes.</td></tr>
            <tr><td>Lista de compras</td><td>O que comprar (automático + itens extras manuais).</td></tr>
            <tr><td>Cardápio</td><td>Planejamento das refeições da semana.</td></tr>
            <tr><td>Receitas</td><td>Caderno de receitas com saída automática de estoque.</td></tr>
            <tr><td>Restrições alimentares</td><td>Contagem de alunos com restrição por refeição.</td></tr>
            <tr><td>Relatórios</td><td>PDF e Excel de consumo, perdas e lista de compras.</td></tr>
            <tr><td>Cadastros</td><td>Categorias, fornecedores, locais, unidades e tipos de restrição.</td></tr>
            <tr><td>Usuários</td><td>Gerenciar contas e perfis (somente direção).</td></tr>
            <tr><td>Configurações</td><td>Dias de alerta de validade (somente direção).</td></tr>
          </tbody>
        </table>
        <p>
          No canto superior direito ficam o nome do usuário logado e o botão <strong>Sair</strong>.
        </p>

        {/* ─── 5. PAINEL ─── */}
        <h2>5. Painel</h2>
        <p>
          É a primeira tela após o login. Mostra quatro indicadores no topo:
        </p>
        <ul>
          <li><strong>Lotes vencidos</strong> — lotes com data de validade passada e quantidade maior que zero. Clique para ver a lista e registrar perda direto.</li>
          <li><strong>Vencendo em breve</strong> — lotes que vencem dentro do número de dias configurado (padrão: 7 dias).</li>
          <li><strong>Estoque baixo</strong> — produtos cuja quantidade total está igual ou abaixo do estoque mínimo.</li>
          <li><strong>Produtos ativos</strong> — total de produtos cadastrados e ativos no sistema.</li>
        </ul>
        <p>
          Abaixo dos indicadores há dois atalhos rápidos:
        </p>
        <ul>
          <li><strong>Registrar entrada</strong> — vai direto para o formulário de entrada de lote.</li>
          <li><strong>Lista de compras</strong> — vai para a lista do que precisa ser comprado.</li>
        </ul>
        <p>
          Os alertas de lotes vencidos e vencendo aparecem em cartões com cor e ícone, mostrando produto, lote
          e data de validade. Toque em <strong>Registrar perda</strong> para lançar a perda direto do alerta.
        </p>

        {/* ─── 6. PRODUTOS ─── */}
        <h2>6. Produtos</h2>
        <p>
          Aqui ficam todos os itens que a cozinha usa: alimentos, bebidas, materiais de limpeza, etc.
        </p>

        <h3>Cadastrar um produto novo</h3>
        <ol>
          <li>Toque em <strong>Novo produto</strong>.</li>
          <li>Preencha: nome, categoria, unidade de medida (kg, L, unid., etc.), estoque mínimo (quantidade abaixo da qual o sistema avisa que precisa comprar), fornecedor habitual e local de armazenamento padrão.</li>
          <li>Toque em <strong>Salvar produto</strong>.</li>
        </ol>
        <p>
          O produto fica visível na lista. Para adicionar estoque, vá a <strong>Lotes e validade → Registrar entrada</strong>.
        </p>

        <h3>Editar um produto</h3>
        <p>Clique no nome do produto na lista. Na tela de detalhes, role até a seção <strong>Editar produto</strong>. Altere o que precisar e salve.</p>

        <h3>Desativar um produto</h3>
        <p>
          Na tela de detalhes, role até o final e clique em <em>Desativar produto</em>. O produto some da lista
          principal mas permanece no histórico de movimentações. Produtos com lotes ativos não podem ser desativados
          enquanto tiverem estoque.
        </p>

        {/* ─── 7. LOTES ─── */}
        <h2>7. Lotes e validade</h2>
        <p>
          Cada embalagem ou conjunto de embalagens recebidas na mesma data com a mesma validade é um <strong>lote</strong>.
          O controle de lotes permite saber exatamente o que está prestes a vencer e quanto de cada produto existe.
        </p>

        <h3>Registrar entrada de mercadoria</h3>
        <ol>
          <li>Toque em <strong>Registrar entrada</strong>.</li>
          <li>Escolha o <strong>produto</strong>.</li>
          <li>Informe a <strong>quantidade</strong> recebida e a <strong>data de validade</strong> que está na embalagem.</li>
          <li>O sistema preenche automaticamente o código do lote, a data de entrada, o fornecedor e o local padrão do produto — altere se necessário.</li>
          <li>Toque em <strong>Registrar entrada</strong>.</li>
        </ol>

        <h3>Filtrar lotes</h3>
        <p>
          Use os filtros no topo da lista para ver apenas lotes de um produto específico, ou filtrar por situação:
          <strong>Todos</strong>, <strong>Ativos</strong>, <strong>Vencidos</strong> ou <strong>Vazios</strong>.
        </p>

        <h3>O que é FEFO?</h3>
        <p>
          FEFO significa <em>First Expired, First Out</em> — primeiro a vencer, primeiro a sair. Quando você
          registra uma saída, o sistema consome automaticamente o lote com a data de validade mais próxima.
          Se a quantidade pedida for maior do que um lote, ele divide entre lotes na ordem certa.
          Isso evita desperdício e garante que nada vença esquecido na prateleira.
        </p>

        {/* ─── 8. MOVIMENTAÇÕES ─── */}
        <h2>8. Movimentações</h2>
        <p>
          Toda vez que algo entra, sai, é perdido ou corrigido no estoque, o sistema registra uma movimentação.
          <strong>Movimentações são permanentes</strong> — nada é apagado, pois isso mantém o histórico fiel.
          Para corrigir um erro, registre um ajuste.
        </p>

        <h3>Registrar saída</h3>
        <ol>
          <li>Toque em <strong>Registrar saída</strong>.</li>
          <li>Escolha o produto e informe a quantidade usada.</li>
          <li>O sistema aplica o FEFO automaticamente — você não precisa escolher o lote.</li>
          <li>Se a quantidade pedida for maior do que o estoque disponível, o sistema bloqueia e avisa.</li>
        </ol>

        <h3>Registrar perda</h3>
        <ol>
          <li>Toque em <strong>Registrar perda</strong>.</li>
          <li>Escolha o <strong>lote específico</strong> (não o produto) — porque a perda sempre sai de um lote determinado.</li>
          <li>Informe a quantidade e selecione o motivo: Vencido, Estragado, Embalagem danificada, Contaminado ou Descartado.</li>
        </ol>

        <h3>Registrar ajuste</h3>
        <p>
          Use para corrigir a contagem de um lote — para <strong>mais</strong> (encontrou embalagem não registrada)
          ou para <strong>menos</strong> (sobrou menos do que estava no sistema).
        </p>
        <ol>
          <li>Toque em <strong>Registrar ajuste</strong>.</li>
          <li>Escolha o lote, o tipo (acréscimo ou redução), a quantidade e o motivo.</li>
        </ol>

        <h3>Histórico de movimentações</h3>
        <p>
          A lista mostra todas as movimentações em ordem cronológica inversa (mais recente primeiro).
          Use os filtros de data e tipo para localizar um lançamento específico. Cada linha mostra
          produto, tipo, quantidade, lote, responsável e data/hora.
        </p>

        {/* ─── 9. LISTA DE COMPRAS ─── */}
        <h2>9. Lista de compras</h2>
        <p>
          A lista tem duas partes: itens gerados automaticamente e itens extras adicionados manualmente.
        </p>

        <h3>Estoque baixo (automático)</h3>
        <p>
          O sistema verifica quais produtos estão com estoque igual ou abaixo do mínimo e lista o que
          precisa comprar (mínimo − estoque atual), junto com o fornecedor habitual e telefone.
        </p>

        <h3>Itens extras (manual)</h3>
        <p>
          Para adicionar um item que não está no estoque do sistema (uma fruta fora do catálogo, um material
          específico, etc.):
        </p>
        <ol>
          <li>No campo <strong>Adicionar item à lista</strong>, informe nome, quantidade e unidade (opcional).</li>
          <li>Toque em <strong>Adicionar</strong>. O item aparece na lista e fica salvo até ser marcado como comprado.</li>
          <li>Quando comprar, marque o item como <strong>Comprado</strong> (checkbox). Ele fica na lista, mas riscado.</li>
          <li>Use <strong>Limpar comprados</strong> para remover todos os itens já comprados de uma vez.</li>
        </ol>

        <h3>Exportar a lista</h3>
        <p>
          Toque em <strong>PDF</strong> para gerar uma lista de mercado pronta para imprimir, ou em
          <strong>Excel</strong> para abrir no computador e editar. Ambos incluem os itens automáticos e os extras.
        </p>

        {/* ─── 10. CARDÁPIO ─── */}
        <h2>10. Cardápio</h2>
        <p>
          Planejamento das refeições da semana (segunda a sexta). As quatro refeições são:
          Café da manhã, Lanche da manhã, Almoço e Lanche da tarde.
        </p>

        <h3>Navegar entre semanas</h3>
        <p>Use os botões <strong>← Semana anterior</strong> e <strong>Próxima semana →</strong> ou toque em <strong>Esta semana</strong> para voltar ao presente.</p>

        <h3>Editar um dia</h3>
        <ol>
          <li>Clique na data desejada na grade da semana.</li>
          <li>Na tela do dia, preencha o que será servido em cada refeição (campo de texto livre).</li>
          <li>Se uma receita do caderno for usada, você pode vincular em <strong>Receita vinculada</strong> — o sistema avisa se o estoque dos ingredientes for insuficiente.</li>
          <li>Toque em <strong>Salvar cardápio do dia</strong>.</li>
        </ol>
        <p>Refeições deixadas em branco aparecem como <em>Não planejado</em> na grade.</p>

        {/* ─── 11. RECEITAS ─── */}
        <h2>11. Receitas</h2>
        <p>
          O caderno de receitas guarda as preparações da cozinha com ingredientes e modo de preparo.
          Ao <strong>preparar uma receita</strong>, o sistema desconta automaticamente os ingredientes
          do estoque, usando o FEFO para cada produto.
        </p>

        <h3>Cadastrar uma receita</h3>
        <ol>
          <li>Toque em <strong>Nova receita</strong>.</li>
          <li>Informe o nome, uma descrição rápida (opcional), a quantidade de <strong>porções base</strong> para a qual os ingredientes são calculados e o modo de preparo (opcional).</li>
          <li>Toque em <strong>Criar receita</strong>. O sistema abre a tela da receita.</li>
        </ol>

        <h3>Adicionar ingredientes</h3>
        <ol>
          <li>Na seção <strong>Ingredientes</strong>, escolha o produto do estoque, informe a quantidade e uma observação opcional (ex.: "peneirado").</li>
          <li>Toque em <strong>Adicionar</strong>. Repita para cada ingrediente.</li>
          <li>As quantidades são para o número de porções base informado.</li>
        </ol>

        <h3>Preparar uma receita (saída automática)</h3>
        <ol>
          <li>Na tela da receita, toque em <strong>Preparar agora</strong>.</li>
          <li>Informe quantas porções serão preparadas. O sistema recalcula os ingredientes proporcionalmente.</li>
          <li>A lista mostra os ingredientes necessários e destaca em vermelho os que têm estoque insuficiente.</li>
          <li>Toque em <strong>Confirmar e registrar saída</strong>. O sistema desconta cada ingrediente do estoque via FEFO. Se um ingrediente estiver em falta, os demais são descontados normalmente e o sistema informa quais não foram.</li>
        </ol>

        <h3>Desativar uma receita</h3>
        <p>Role até o final da tela da receita e clique em <em>Desativar receita</em>. A receita some da lista principal mas o histórico de movimentações geradas por ela é mantido.</p>

        {/* ─── 12. RESTRIÇÕES ─── */}
        <h2>12. Restrições alimentares</h2>
        <p>
          Registra quantos alunos têm cada tipo de restrição alimentar <strong>por refeição</strong>, para que
          a cozinha prepare os pratos especiais. O sistema nunca armazena nomes ou dados que identifiquem um aluno.
        </p>

        <h3>Registrar contagem do dia</h3>
        <ol>
          <li>Escolha a data usando os botões <strong>← Dia anterior</strong> / <strong>Próximo dia →</strong>.</li>
          <li>Selecione a aba da refeição: <strong>Café da manhã</strong>, <strong>Lanche da manhã</strong>, <strong>Almoço</strong> ou <strong>Lanche da tarde</strong>.</li>
          <li>Informe a quantidade de alunos para cada tipo de restrição (zero se nenhum).</li>
          <li>Toque em <strong>Salvar</strong> para aquela refeição. Repita para cada refeição do dia.</li>
        </ol>
        <p>As abas mostram o total da refeição como um badge. O resumo do dia (soma das 4 refeições) aparece em um cartão acima do formulário.</p>

        <h3>Imprimir o dia</h3>
        <p>
          Toque em <strong>Imprimir dia</strong> para gerar um PDF A4 com as 4 refeições do dia,
          pronto para colar na parede da cozinha. O PDF mostra cada tipo de restrição, a quantidade
          por refeição e o total geral do dia.
        </p>

        <h3>Histórico</h3>
        <p>A seção <strong>Últimos dias</strong> lista os dias com contagem registrada. Clique num dia para ver ou editar.</p>

        {/* ─── 13. RELATÓRIOS ─── */}
        <h2>13. Relatórios</h2>
        <p>
          Gera documentos para acompanhamento e prestação de contas. Escolha o período
          (<strong>De</strong> / <strong>Até</strong>) e clique em <strong>PDF</strong> ou <strong>Excel</strong>.
        </p>

        <table>
          <thead><tr><th>Relatório</th><th>O que mostra</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>Consumo por período</strong></td>
              <td>Quanto saiu de cada produto (entradas, saídas, perdas e ajustes), agrupado por categoria. Útil para prestação de contas e planejamento de compras.</td>
            </tr>
            <tr>
              <td><strong>Vencidos e perdas</strong></td>
              <td>Lotes com data vencida que ainda têm estoque, e todas as movimentações de perda e ajuste negativo do período.</td>
            </tr>
            <tr>
              <td><strong>Lista de compras</strong></td>
              <td>O que precisa comprar hoje (estoque abaixo do mínimo + itens extras). O período aparece apenas no cabeçalho.</td>
            </tr>
          </tbody>
        </table>

        <p>
          O <strong>PDF</strong> tem cabeçalho com logo e data de emissão, formatado para impressão.
          O <strong>Excel</strong> tem abas organizadas, células formatadas e está pronto para filtros.
        </p>

        {/* ─── 14. CADASTROS ─── */}
        <h2>14. Cadastros auxiliares</h2>
        <p>
          Em <strong>Cadastros</strong> ficam as tabelas de referência usadas em todo o sistema.
          Uma única tela genérica gerencia todos:
        </p>

        <table>
          <thead><tr><th>Cadastro</th><th>Para que serve</th><th>Exemplos</th></tr></thead>
          <tbody>
            <tr><td><strong>Categorias</strong></td><td>Agrupa produtos nos relatórios.</td><td>Grãos, Laticínios, Carnes, Hortifrúti</td></tr>
            <tr><td><strong>Fornecedores</strong></td><td>Empresa/pessoa de quem se compra. Aparece na lista de compras.</td><td>Distribuidora Grão Bom, Hortifrúti do Ceasa</td></tr>
            <tr><td><strong>Locais de armazenamento</strong></td><td>Onde o produto fica guardado.</td><td>Dispensa, Geladeira, Freezer</td></tr>
            <tr><td><strong>Unidades de medida</strong></td><td>Sigla usada em quantidades.</td><td>kg, g, L, mL, unid., cx., pct.</td></tr>
            <tr><td><strong>Tipos de restrição</strong></td><td>Categorias de restrição alimentar dos alunos.</td><td>Lactose, Glúten, Amendoim, Vegetariano</td></tr>
          </tbody>
        </table>

        <p>
          Para adicionar: preencha o formulário no topo da lista e toque em <strong>Adicionar</strong>.
          Para editar: clique no lápis ao lado do item. Para excluir: clique na lixeira — itens em uso
          por produtos ou lotes não podem ser excluídos.
        </p>

        {/* ─── 15. USUÁRIOS ─── */}
        <h2>15. Usuários</h2>
        <p>Disponível apenas para a <strong>direção (administrador)</strong>.</p>

        <h3>Convidar uma nova funcionária</h3>
        <ol>
          <li>Toque em <strong>Novo usuário</strong>.</li>
          <li>Informe o nome, o e-mail e o perfil (Operador para cozinha, Consulta para quem só visualiza).</li>
          <li>O sistema envia um e-mail de convite com um link para a pessoa criar a senha.</li>
        </ol>

        <h3>Alterar o perfil de alguém</h3>
        <p>
          Clique no nome da pessoa na lista. Escolha o novo perfil no menu e toque em <strong>Salvar</strong>.
          A mudança tem efeito imediato na próxima ação da pessoa.
        </p>

        <h3>Desativar o acesso</h3>
        <p>
          Na tela do usuário, role até o final e clique em <em>Desativar acesso</em>. A pessoa não consegue
          mais entrar, mas o histórico de movimentações feitas por ela é mantido.
        </p>

        {/* ─── 16. CONFIGURAÇÕES ─── */}
        <h2>16. Configurações</h2>
        <p>Disponível apenas para a <strong>direção (administrador)</strong>.</p>
        <p>
          Atualmente há um único ajuste: <strong>Dias de alerta de validade</strong>. Com o valor padrão
          de <strong>7 dias</strong>, o sistema marca como alerta qualquer lote que vença nos próximos 7 dias.
          Aumente para ter mais antecedência; diminua se os alertas aparecerem cedo demais.
        </p>
        <p>Toque em <strong>Salvar configurações</strong> após alterar.</p>

        {/* ─── 17. FAQ ─── */}
        <h2>17. Perguntas frequentes</h2>

        <h3>O sistema sumiu com um lançamento — onde está?</h3>
        <p>
          O sistema nunca apaga movimentações. Vá em <strong>Movimentações</strong> e use os filtros de
          data para localizar o lançamento. Se a quantidade parecer errada, registre um <strong>ajuste</strong>
          explicando o motivo.
        </p>

        <h3>Errei a quantidade de uma saída. O que faço?</h3>
        <p>
          Registre um <strong>ajuste de acréscimo</strong> no lote afetado com a diferença e escreva o
          motivo no campo de observação (ex.: "Correção: saída registrada a mais"). O histórico fica com
          os dois lançamentos, mas o estoque fica correto.
        </p>

        <h3>Produto aparece com estoque baixo mas tem embalagem na dispensa. O que fazer?</h3>
        <p>
          Significa que a entrada dessa embalagem não foi registrada. Vá em
          <strong>Lotes e validade → Registrar entrada</strong> e lance a embalagem. O alerta some automaticamente.
        </p>

        <h3>O e-mail de redefinição de senha não chegou.</h3>
        <p>
          Verifique a pasta de spam/lixo eletrônico. O remetente é <em>no-reply@supabase.io</em>. Se não
          encontrar, aguarde 2 minutos e tente novamente. Se o problema persistir, peça à direção para
          criar uma nova senha em <strong>Usuários</strong>.
        </p>

        <h3>Posso usar o sistema no celular?</h3>
        <p>
          Sim. O sistema é responsivo e funciona em qualquer celular moderno com acesso à internet.
          Todos os botões têm tamanho mínimo de 44 × 44 px para facilitar o toque.
          Não é necessário instalar nenhum aplicativo — basta abrir o endereço no navegador.
        </p>

        <h3>O que acontece se a internet cair no meio de um lançamento?</h3>
        <p>
          Formulários não enviados ficam na tela. Assim que a conexão voltar, toque novamente em
          <strong>Salvar</strong>. O sistema não salva nada parcialmente — ou salva tudo ou não salva nada.
        </p>

        <h3>Posso cadastrar um produto sem fornecedor?</h3>
        <p>
          O fornecedor é opcional. Você pode cadastrar o produto sem ele e preencher depois ao editar.
          O campo "fornecedor" na entrada do lote também é opcional.
        </p>

        {/* Rodapé */}
        <div className="mt-16 border-t pt-6 text-xs text-muted-foreground print:mt-8 print:pt-4">
          <p>Despensa CAPE · Centro de Apoio Pedagógico Especializado · Versão novembro 2026</p>
          <p className="mt-1">Sistema desenvolvido para uso interno. Dúvidas: contato com a direção.</p>
        </div>

      </article>
    </div>
  );
}
