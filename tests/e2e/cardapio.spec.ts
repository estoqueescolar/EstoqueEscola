import { expect, test, type Page } from "@playwright/test";
import { entrar, verificarTela } from "./apoio";

async function entrarComo(page: Page, email: string) {
  await entrar(page, email);
  await expect(page).toHaveURL(/\/painel/);
  await page.waitForLoadState("networkidle");
}

// Cada largura usa um dia diferente em 2030, para os projetos não disputarem o mesmo registro.
const DIAS = { "celular-375": "2030-03-11", "tablet-768": "2030-03-12", "desktop-1280": "2030-03-13" } as Record<string, string>;

test("cozinha planeja o almoço de um dia e vê na semana", async ({ page }, info) => {
  const dia = DIAS[info.project.name] ?? "2030-03-14";
  const prato = `Arroz, feijão e frango ${Date.now()}`;
  await entrarComo(page, "cozinha@colegio.local");

  await page.goto(`/cardapio?semana=${dia}`);
  await expect(page.getByRole("heading", { name: "Cardápio", level: 1 })).toBeVisible();
  await verificarTela(page);

  await page.goto(`/cardapio/${dia}`);
  await page.getByLabel("Almoço").fill(prato);
  await page.getByRole("button", { name: "Salvar cardápio do dia" }).click();
  await expect(page).toHaveURL(/\/cardapio\?semana=2030-03-11/);
  await expect(page.getByText(prato)).toBeVisible();
});

test("contagem de restrições é salva pela cozinha e só lida pela consulta", async ({ page }, info) => {
  const dia = DIAS[info.project.name] ?? "2030-03-14";
  await entrarComo(page, "cozinha@colegio.local");
  await page.goto(`/restricoes?data=${dia}`);
  await expect(page.getByText(/nunca nomes/)).toBeVisible();

  const campos = page.getByRole("main").getByRole("textbox");
  await campos.first().fill("3");
  await expect(page.getByText(/Total: 3 alunos/)).toBeVisible();
  await page.getByRole("button", { name: "Salvar contagem" }).click();
  await expect(page.getByText(/salva: 3 alunos com restrição/)).toBeVisible();
  await verificarTela(page);

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login/);
  await entrarComo(page, "consulta@colegio.local");
  await page.goto(`/restricoes?data=${dia}`);
  await expect(page.getByRole("button", { name: "Salvar contagem" })).toHaveCount(0);
  await expect(page.getByRole("main").getByText("3", { exact: true }).first()).toBeVisible();
  await page.goto(`/cardapio/${dia}`);
  await expect(page).toHaveURL(/\/cardapio$/);
});
