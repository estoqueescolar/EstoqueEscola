import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const SENHA_DEMO = "Senha@Local123";

export async function entrar(page: Page, email: string, senha = SENHA_DEMO) {
  // Os tours guiados (boas-vindas e um por tela) abrem na primeira visita e cobrem a tela,
  // interceptando cliques: nos testes, todos contam como já vistos.
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (chave: string) {
      return chave.startsWith("cape_tour_") ? "1" : original.call(this, chave);
    };
  });
  // O indicador do `next dev` fica fixo no canto e intercepta cliques em botões ali; não existe em produção.
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const estilo = document.createElement("style");
      estilo.textContent = "nextjs-portal { display: none !important; }";
      document.head.append(estilo);
    });
  });
  await page.goto("/login");
  // no desktop a tela de acesso também carrega a cena 3D: espera a hidratação antes de enviar
  await page.waitForLoadState("networkidle");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel(/^Senha/).fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  // no `next dev` o login pode passar de 15 s (cena 3D + primeira compilação): espera o envio terminar
  await expect(page.getByRole("button", { name: /Entrando/ })).toHaveCount(0, { timeout: 60000 });
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
