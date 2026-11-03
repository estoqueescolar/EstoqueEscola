import { expect, test, type Page } from "@playwright/test";
import { entrar, verificarTela } from "./apoio";

async function entrarComo(page: Page, email: string) {
  await entrar(page, email);
  await expect(page).toHaveURL(/\/painel/);
}

test.describe("cadastros auxiliares", () => {
  test("operador cadastra e edita fornecedor, mas não exclui", async ({ page }) => {
    const nome = `Fornecedor E2E ${Date.now()}`;
    await entrarComo(page, "cozinha@colegio.local");
    await page.goto("/cadastros");
    await verificarTela(page);
    await page.getByRole("link", { name: /Fornecedores/ }).click();
    await verificarTela(page);

    await page.getByLabel(/^Telefone/).fill("abc");
    await page.getByRole("button", { name: "Salvar fornecedor" }).click();
    await expect(page.getByText("Informe o nome do fornecedor.")).toBeVisible();

    await page.getByLabel(/^Nome/).fill(nome);
    await page.getByLabel(/^Telefone/).fill("(11) 97777-0000");
    await page.getByRole("button", { name: "Salvar fornecedor" }).click();
    const item = page.getByRole("listitem").filter({ hasText: nome });
    await expect(item).toBeVisible();
    await expect(item.getByRole("button", { name: /Excluir/ })).toHaveCount(0);

    await item.getByRole("button", { name: `Editar ${nome}` }).click();
    const dialogo = page.getByRole("dialog");
    await dialogo.getByLabel(/^Observação/).fill("Entrega às sextas");
    await dialogo.getByRole("button", { name: "Salvar fornecedor" }).click();
    await expect(dialogo).toBeHidden();
    await expect(page.getByRole("listitem").filter({ hasText: nome })).toContainText("Entrega às sextas");
  });

  test("nome repetido mostra mensagem clara", async ({ page }) => {
    await entrarComo(page, "cozinha@colegio.local");
    await page.goto("/cadastros/categorias");
    await page.getByLabel(/^Nome/).fill("Laticínios");
    await page.getByRole("button", { name: "Salvar categoria" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("Já existe um registro com esse nome");
  });

  test("administrador não exclui cadastro em uso", async ({ page }) => {
    await entrarComo(page, "diretora@colegio.local");
    await page.goto("/cadastros/categorias");
    await page.getByRole("button", { name: "Excluir Laticínios" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();
    await expect(page.getByText("há produtos, lotes ou contagens usando este cadastro")).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: "Laticínios" })).toBeVisible();
  });
});

test.describe("produtos", () => {
  test("lista com filtros e alerta de estoque com texto", async ({ page }) => {
    await entrarComo(page, "consulta@colegio.local");
    await page.goto("/produtos");
    await verificarTela(page);
    await expect(page.getByRole("link", { name: "Cadastrar produto" })).toHaveCount(0);

    await page.getByLabel("Situação do estoque").selectOption("baixo");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(page).toHaveURL(/situacao=baixo/);
    const fuba = page.getByRole("listitem").filter({ hasText: "Fubá" });
    await expect(fuba).toContainText("Sem estoque");
    await expect(page.getByRole("listitem").filter({ hasText: "Feijão preto" })).toContainText("Estoque baixo");
    await expect(page.getByRole("listitem").filter({ hasText: "Arroz branco" })).toHaveCount(0);

    await page.getByLabel("Buscar pelo nome").fill("feijao");
    await page.getByRole("button", { name: "Filtrar" }).click();
    // continua com "situação = baixo": só o feijão preto
    await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(1);
    await page.getByRole("link", { name: "Limpar filtros" }).click();
    await expect(page).toHaveURL(/\/produtos$/);
  });

  test("consulta vê os dados do produto sem formulário", async ({ page }) => {
    await entrarComo(page, "consulta@colegio.local");
    await page.goto("/produtos");
    await page.getByRole("link", { name: /Arroz branco/ }).click();
    await expect(page.locator("h1")).toHaveText("Arroz branco tipo 1");
    await expect(page.getByRole("button", { name: "Salvar produto" })).toHaveCount(0);
    await verificarTela(page);
  });

  test("operador cadastra e edita produto com vírgula no mínimo", async ({ page }) => {
    const nome = `Polvilho E2E ${Date.now()}`;
    await entrarComo(page, "cozinha@colegio.local");
    await page.goto("/produtos/novo");
    await verificarTela(page);

    await page.getByRole("button", { name: "Salvar produto" }).click();
    await expect(page.getByText("Informe o nome do produto.")).toBeVisible();
    await expect(page.getByText("Escolha a categoria.")).toBeVisible();

    await page.getByLabel(/^Nome do produto/).fill(nome);
    await page.getByLabel(/^Categoria/).selectOption({ label: "Grãos e cereais" });
    await page.getByLabel(/^Unidade de medida/).selectOption({ label: "Quilograma (kg)" });
    await page.getByLabel(/^Local de armazenamento/).selectOption({ label: "Dispensa" });
    await page.getByLabel(/^Estoque mínimo/).fill("2,5");
    await page.getByRole("button", { name: "Salvar produto" }).click();

    await expect(page).toHaveURL(/\/produtos\/[0-9a-f-]+\?aviso=criado/);
    await expect(page.locator("h1")).toHaveText(nome);
    await expect(page.getByText("mínimo 2,5 kg")).toBeVisible();
    await expect(page.getByText("Sem estoque")).toBeVisible();
    await expect(page.getByRole("button", { name: /Excluir/ })).toHaveCount(0);

    await page.getByLabel(/^Estoque mínimo/).fill("4");
    await page.getByRole("button", { name: "Salvar produto" }).click();
    await expect(page.getByText("Produto atualizado.")).toBeVisible();
  });

  test("administrador não exclui produto com lotes", async ({ page }) => {
    await entrarComo(page, "diretora@colegio.local");
    await page.goto("/produtos?busca=arroz");
    await page.getByRole("link", { name: /Arroz branco/ }).click();
    await page.getByRole("button", { name: /Excluir Arroz/ }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();
    await expect(page.getByText("Marque-o como inativo")).toBeVisible();
  });
});
