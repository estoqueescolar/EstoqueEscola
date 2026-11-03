import { expect, test, type Page } from "@playwright/test";
import { entrar, verificarTela } from "./apoio";

async function entrarComo(page: Page, email: string) {
  await entrar(page, email);
  await expect(page).toHaveURL(/\/painel/);
}

test("painel mostra indicadores e alertas do seed, com atalhos para as telas", async ({ page }) => {
  await entrarComo(page, "cozinha@colegio.local");
  const principal = page.getByRole("main");
  await expect(principal.getByRole("heading", { name: "Validade" })).toBeVisible();
  await expect(principal.getByRole("heading", { name: "Estoque baixo" })).toBeVisible();
  // o seed tem lotes vencidos: aparecem com etiqueta em texto e atalho de perda
  await expect(principal.getByText(/Vencido há/).first()).toBeVisible();
  await expect(principal.getByRole("link", { name: /Registrar perda do lote/ }).first()).toBeVisible();
  await verificarTela(page);

  await principal.getByRole("link", { name: /lotes vencidos?/ }).click();
  await expect(page).toHaveURL(/\/lotes\?situacao=vencidos/);
});

test("lista de compras mostra o que falta e permite copiar", async ({ page, context, browserName }) => {
  await entrarComo(page, "consulta@colegio.local");
  await page.goto("/compras");
  await expect(page.getByRole("heading", { name: "Lista de compras" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /para comprar/ })).toBeVisible();
  await expect(page.getByRole("main").getByText(/^Comprar/).first()).toBeVisible();
  await verificarTela(page);

  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("button", { name: "Copiar lista" }).click();
    await expect(page.getByRole("button", { name: "Lista copiada" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^Lista de compras \(/);
  }
});

test("só a direção altera o prazo do alerta de validade", async ({ page }) => {
  await entrarComo(page, "cozinha@colegio.local");
  await expect(page.getByRole("link", { name: "Configurações" })).toHaveCount(0);
  await page.goto("/configuracoes");
  await expect(page).toHaveURL(/\/painel/);
  // após o redirecionamento, espera a hidratação para o formulário "Sair" usar a server action
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login/);

  await entrarComo(page, "diretora@colegio.local");
  await page.goto("/configuracoes");
  const campo = page.getByLabel(/^Avisar quantos dias/);
  // espera a hidratação: o formulário começa com o valor salvo
  await expect(campo).toHaveValue("7");
  await page.waitForLoadState("networkidle");
  try {
    await campo.fill("0");
    await page.getByRole("button", { name: "Salvar prazo" }).click();
    await expect(page.getByText("Use pelo menos 1 dia.")).toBeVisible();

    await campo.fill("10");
    await page.getByRole("button", { name: "Salvar prazo" }).click();
    await expect(page.getByRole("status")).toContainText("10 dias de antecedência");
    await expect(page.getByRole("button", { name: "Salvar prazo" })).toBeEnabled();
    await verificarTela(page);
    await page.goto("/painel");
    await expect(page.getByText("vencem em até 10 dias")).toBeVisible();
  } finally {
    // volta ao padrão para não afetar os outros testes
    await page.goto("/configuracoes");
    await page.waitForLoadState("networkidle");
    await campo.fill("7");
    await page.getByRole("button", { name: "Salvar prazo" }).click();
    await expect(page.getByRole("status")).toContainText("7 dias");
  }
});
