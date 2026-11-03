import { loadEnvConfig } from "@next/env";
import { expect, test } from "@playwright/test";
import { entrar } from "./apoio";

// Usa o Mailpit do Supabase local (porta 54724) para abrir o e-mail de recuperação.
// Cria uma conta descartável para NÃO alterar a senha das contas de demonstração.
const MAILPIT = "http://127.0.0.1:54724";
loadEnvConfig(process.cwd());
const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const CHAVE_SERVICO = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const cabecalhos = { apikey: CHAVE_SERVICO, Authorization: `Bearer ${CHAVE_SERVICO}` };

test("recuperação de senha por e-mail até a nova senha", async ({ page, request }) => {
  test.skip(test.info().project.name !== "desktop-1280", "fluxo de e-mail roda só em uma largura");
  const email = `recupera.${Date.now()}@colegio.local`;
  const criado = await request.post(`${SUPABASE}/auth/v1/admin/users`, {
    headers: cabecalhos,
    data: { email, password: "SenhaAntiga2026", email_confirm: true },
  });
  expect(criado.ok()).toBe(true);
  const { id } = await criado.json();

  try {
    await request.delete(`${MAILPIT}/api/v1/messages`);
    await page.goto("/recuperar-senha");
    await page.getByLabel("E-mail").fill(email);
    await page.getByRole("button", { name: "Enviar link" }).click();
    await expect(page.getByRole("status")).toContainText("Se este e-mail tiver uma conta");

    let link = "";
    await expect(async () => {
      const lista = await (await request.get(`${MAILPIT}/api/v1/search?query=to:${email}`)).json();
      const idMensagem = lista.messages?.[0]?.ID;
      expect(idMensagem).toBeTruthy();
      const mensagem = await (await request.get(`${MAILPIT}/api/v1/message/${idMensagem}`)).json();
      link = (mensagem.Text as string).match(/https?:\/\/\S+/)![0];
    }).toPass({ timeout: 15000 });

    await page.goto(link);
    await expect(page).toHaveURL(/\/redefinir-senha/);
    await page.getByLabel(/^Nova senha/).fill("NovaSenha2026");
    await page.getByLabel(/^Repita a nova senha/).fill("NovaSenha2026");
    await page.getByRole("button", { name: "Salvar nova senha" }).click();
    await expect(page).toHaveURL(/\/painel\?aviso=senha-alterada/);
    await expect(page.getByRole("status")).toContainText("Senha alterada");

    await page.getByRole("button", { name: "Sair" }).click();
    await entrar(page, email, "NovaSenha2026");
    await expect(page).toHaveURL(/\/painel/);
  } finally {
    await request.delete(`${SUPABASE}/auth/v1/admin/users/${id}`, { headers: cabecalhos });
  }
});
