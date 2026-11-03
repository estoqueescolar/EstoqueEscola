import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const SENHA_DEMO = "Senha@Local123";

export async function entrar(page: Page, email: string, senha = SENHA_DEMO) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel(/^Senha/).fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
}

// Sem rolagem horizontal da página e sem violações graves de acessibilidade (axe).
export async function verificarTela(page: Page) {
  const larguras = await page.evaluate(() => ({
    conteudo: document.documentElement.scrollWidth,
    janela: window.innerWidth,
  }));
  expect(larguras.conteudo, "a página não pode rolar na horizontal").toBeLessThanOrEqual(larguras.janela);

  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const graves = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}
