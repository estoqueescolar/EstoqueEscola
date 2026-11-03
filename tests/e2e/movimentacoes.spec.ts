import { expect, test, type Page } from "@playwright/test";
import { entrar, verificarTela } from "./apoio";

const dia = (deslocamento: number) => {
  const data = new Date(Date.now() + deslocamento * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(data);
};

async function entrarComo(page: Page, email: string) {
  await entrar(page, email);
  await expect(page).toHaveURL(/\/painel/);
}

// Cada teste cria o próprio produto: as três larguras rodam no mesmo banco.
async function criarProduto(page: Page, nome: string) {
  await page.goto("/produtos/novo");
  await page.getByLabel(/^Nome do produto/).fill(nome);
  await page.getByLabel(/^Categoria/).selectOption({ label: "Laticínios" });
  await page.getByLabel(/^Unidade de medida/).selectOption({ label: "Litro (L)" });
  await page.getByLabel(/^Local de armazenamento/).selectOption({ label: "Geladeira" });
  await page.getByLabel(/^Estoque mínimo/).fill("2");
  await page.getByRole("button", { name: "Salvar produto" }).click();
  await expect(page).toHaveURL(/\/produtos\/[0-9a-f-]+\?aviso=criado/);
}

async function registrarEntrada(page: Page, produto: string, quantidade: string, validade: string, codigo: string) {
  await page.goto("/lotes/entrada");
  await page.getByLabel(/^Produto/).selectOption({ label: produto });
  await page.getByLabel(/^Quantidade recebida/).fill(quantidade);
  await page.getByLabel(/^Código do lote/).fill(codigo);
  await page.getByLabel(/^Data de validade/).fill(validade);
  await page.getByRole("button", { name: "Registrar entrada" }).click();
  await expect(page).toHaveURL(/\/lotes\/[0-9a-f-]+\?aviso=entrada/);
}

test("entrada, saída FEFO com prévia, bloqueio de excesso, perda e ajuste", async ({ page }) => {
  // fluxo mais longo da suíte (5 formulários + histórico): o servidor de dev precisa de mais tempo
  test.slow();
  const produto = `Leite E2E ${Date.now()}`;
  await entrarComo(page, "cozinha@colegio.local");
  await criarProduto(page, produto);

  await page.goto("/lotes/entrada");
  await verificarTela(page);
  await page.getByRole("button", { name: "Registrar entrada" }).click();
  await expect(page.getByText("Escolha o produto.")).toBeVisible();

  await registrarEntrada(page, produto, "5", dia(40), "TARDE");
  await expect(page.getByRole("status").first()).toContainText("Entrada registrada");
  await verificarTela(page);
  await registrarEntrada(page, produto, "3", dia(4), "CEDO");
  await expect(page.getByText(/Vence em 4 dias/)).toBeVisible();

  // saída: prévia FEFO e bloqueio de quantidade acima do disponível
  await page.goto("/movimentacoes/saida");
  await verificarTela(page);
  await page.getByLabel(/^Produto/).selectOption({ label: `${produto} (8 L)` });
  await page.getByLabel(/^Quantidade usada/).fill("9");
  await expect(page.getByText("Estoque insuficiente")).toBeVisible();
  // o botão continua habilitado, mas o envio é bloqueado com a mensagem ao lado do campo
  await page.getByRole("button", { name: "Registrar saída" }).click();
  await expect(page.getByLabel(/^Quantidade usada/)).toHaveAttribute("aria-invalid", "true");
  await expect(page).toHaveURL(/\/movimentacoes\/saida/);

  await page.getByLabel(/^Quantidade usada/).fill("4");
  const plano = page.getByRole("region", { name: /Vai sair primeiro/ });
  await expect(plano.getByRole("listitem").nth(0)).toContainText(/3 L\s*do lote CEDO/);
  await expect(plano.getByRole("listitem").nth(1)).toContainText(/1 L\s*do lote TARDE/);
  await page.getByRole("button", { name: "Registrar saída" }).click();
  await expect(page.getByText("Saída registrada: 3 L do lote CEDO e 1 L do lote TARDE.")).toBeVisible();

  // o lote CEDO zerou e saiu da lista de lotes com estoque
  await page.goto(`/lotes?busca=${encodeURIComponent(produto)}`);
  await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(1);
  await page.getByRole("link", { name: /Lote TARDE/ }).click();

  // perda a partir do lote: motivo obrigatório
  await page.getByRole("link", { name: "Registrar perda" }).click();
  await expect(page.getByLabel(/^Lote/)).toHaveValue(/[0-9a-f-]{36}/);
  await verificarTela(page);
  await page.getByLabel(/^Quantidade/).fill("1");
  const confirmarPerda = async () => {
    await page.getByRole("button", { name: "Registrar perda" }).click();
    const dialogo = page.getByRole("alertdialog");
    await expect(dialogo).toContainText("Registrar perda de 1 L do lote TARDE?");
    await dialogo.getByRole("button", { name: "Registrar perda" }).click();
  };
  await confirmarPerda();
  await expect(page.getByText("Informe o motivo da perda.")).toBeVisible();
  await page.getByRole("button", { name: "Estragado" }).click();
  await expect(page.getByLabel(/^Motivo/)).toHaveValue("Estragado");
  await confirmarPerda();
  await expect(page.getByText("Perda registrada.")).toBeVisible();

  // ajuste para mais
  await page.goto("/movimentacoes/ajuste");
  await verificarTela(page);
  await page.getByLabel(/^Produto/).selectOption({ label: `${produto} (3 L)` });
  await page.getByLabel(/^Lote/).selectOption({ index: 1 });
  await page.getByLabel(/^O ajuste vai/).selectOption("1");
  await page.getByLabel(/^Quantidade/).fill("0,5");
  await page.getByLabel(/^Motivo/).fill("Contagem do inventário");
  await page.getByRole("button", { name: "Registrar ajuste" }).click();
  await expect(page.getByText("Ajuste registrado: estoque aumentado.")).toBeVisible();

  // histórico do produto: quatro tipos, com quem registrou
  await page.goto("/produtos");
  await page.getByRole("link", { name: new RegExp(produto) }).click();
  await expect(page.getByRole("main").getByText("3,5", { exact: true }).first()).toBeVisible();
  await page.goto("/movimentacoes?tipo=perda");
  await verificarTela(page);
  const perda = page.getByRole("main").getByRole("listitem").filter({ hasText: produto });
  await expect(perda).toContainText("Motivo: Estragado");
  await expect(perda).toContainText("Funcionária da cozinha (demo)");
});

test("consulta vê lotes e histórico, mas não registra movimentações", async ({ page }) => {
  await entrarComo(page, "consulta@colegio.local");
  await page.goto("/lotes?situacao=vencidos");
  await verificarTela(page);
  await expect(page.getByRole("main").getByRole("listitem").first()).toContainText(/Vencido há/);
  await expect(page.getByRole("link", { name: "Registrar entrada" })).toHaveCount(0);

  await page.goto("/movimentacoes");
  await verificarTela(page);
  await expect(page.getByRole("link", { name: "Registrar saída" })).toHaveCount(0);
  await page.goto("/movimentacoes/saida");
  await expect(page.locator("h1")).toHaveText("Página não encontrada");
});
