import { expect, test } from "@playwright/test";
import { entrar, verificarTela } from "./apoio";

test.describe("autenticação e perfis", () => {
  test("sem sessão redireciona para o login", async ({ page }) => {
    await page.goto("/usuarios");
    await expect(page).toHaveURL(/\/login\?voltar=%2Fusuarios/);
    await verificarTela(page);
  });

  test("telas de acesso são acessíveis", async ({ page }) => {
    for (const rota of ["/cadastro", "/recuperar-senha"]) {
      await page.goto(rota);
      await expect(page.locator("h1")).toBeVisible();
      await verificarTela(page);
    }
  });

  test("senha errada mostra mensagem clara", async ({ page }) => {
    await entrar(page, "consulta@colegio.local", "senha-errada");
    await expect(page.getByRole("alert").first()).toContainText("E-mail ou senha incorretos");
  });

  test("validação do formulário aparece ao lado do campo", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Informe o e-mail.")).toBeVisible();
    await expect(page.getByText("Informe a senha.")).toBeVisible();
  });

  test("consulta entra, não vê nem abre Usuários", async ({ page }) => {
    await entrar(page, "consulta@colegio.local");
    await expect(page).toHaveURL(/\/painel/);
    await expect(page.locator("h1")).toContainText("Olá");
    await verificarTela(page);
    await expect(page.getByRole("link", { name: "Usuários" })).toHaveCount(0);
    await page.goto("/usuarios");
    await expect(page.locator("h1")).toHaveText("Página não encontrada");
  });

  test("logado não vê a tela de login e consegue sair", async ({ page }) => {
    await entrar(page, "cozinha@colegio.local");
    await expect(page).toHaveURL(/\/painel/);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/painel/);
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("administrador cria conta, muda perfil e desativa acesso", async ({ page, browser }) => {
    const email = `ana.${Date.now()}@colegio.local`;
    await entrar(page, "diretora@colegio.local");
    await expect(page).toHaveURL(/\/painel/);
    await page.goto("/usuarios");
    await verificarTela(page);

    await page.getByLabel("Nome").fill("Ana Teste");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha inicial").fill("abc");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("A senha precisa ter pelo menos 8 caracteres.")).toBeVisible();

    await page.getByLabel("Senha inicial").fill("Cozinha2026");
    await page.getByRole("button", { name: "Criar conta" }).click();
    const cartao = () => page.getByRole("listitem").filter({ hasText: email });
    await expect(cartao()).toBeVisible();

    await cartao().getByLabel("Perfil de Ana Teste").selectOption("consulta");
    await cartao().getByRole("button", { name: "Salvar perfil" }).click();
    await expect(page.getByText("Perfil alterado.")).toBeVisible();

    // a conta nova consegue entrar
    const outra = await browser.newPage();
    await entrar(outra, email, "Cozinha2026");
    await expect(outra).toHaveURL(/\/painel/);

    await cartao().getByRole("button", { name: "Desativar acesso" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Desativar acesso" }).click();
    await expect(cartao()).toContainText("Acesso desativado");

    // a sessão aberta perde o acesso na próxima navegação
    await outra.goto("/painel");
    // o bloqueio no Supabase Auth invalida a sessão já no proxy.ts
    await expect(outra).toHaveURL(/\/login/);
    await entrar(outra, email, "Cozinha2026");
    await expect(outra.getByRole("alert").first()).toContainText("desativado");
    await outra.close();
  });

  test("administrador não altera o próprio perfil pela tela", async ({ page }) => {
    await entrar(page, "diretora@colegio.local");
    await expect(page).toHaveURL(/\/painel/);
    await page.goto("/usuarios");
    await expect(page.getByRole("listitem").filter({ hasText: "(você)" })).toContainText("outro administrador");
  });
});
