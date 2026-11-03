import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { entrar, verificarTela } from "./apoio";

test("consulta baixa os relatórios em PDF e Excel", async ({ page }) => {
  await entrar(page, "consulta@colegio.local");
  await expect(page).toHaveURL(/\/painel/);
  await page.goto("/relatorios");
  await expect(page.getByRole("heading", { name: "Relatórios", level: 1 })).toBeVisible();
  await verificarTela(page);

  for (const [botao, extensao, inicio] of [
    ["PDF de Consumo por período", "pdf", "%PDF"],
    ["Excel de Lista de compras", "xlsx", "PK"],
    ["PDF de Vencidos e perdas", "pdf", "%PDF"],
  ] as const) {
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: botao }).click()]);
    expect(download.suggestedFilename()).toMatch(new RegExp(`^\\w+_\\d{4}-\\d{2}-\\d{2}_\\d{4}-\\d{2}-\\d{2}\\.${extensao}$`));
    const conteudo = await readFile((await download.path())!);
    expect(conteudo.subarray(0, inicio.length).toString()).toBe(inicio);
  }
});

test("rota de relatórios recusa pedido sem sessão e período inválido com aviso na tela", async ({ page, request }) => {
  // sem sessão, o proxy manda para o login antes de chegar à rota
  const semSessao = await request.get("/api/relatorios/consumo?formato=pdf&inicio=2026-11-01&fim=2026-11-30", { maxRedirects: 0 });
  expect(semSessao.status()).toBe(307);
  expect(semSessao.headers().location).toContain("/login");

  await entrar(page, "consulta@colegio.local");
  await expect(page).toHaveURL(/\/painel/);
  const tipoErrado = await page.request.get("/api/relatorios/senhas?formato=pdf&inicio=2026-11-01&fim=2026-11-30", { maxRedirects: 0 });
  expect(tipoErrado.status()).toBe(303);
  expect(tipoErrado.headers().location).toContain("/relatorios?erro=pedido");

  // período invertido: volta para a tela com aviso em português, nada de JSON cru
  await page.goto("/api/relatorios/consumo?formato=pdf&inicio=2026-11-30&fim=2026-11-01");
  await expect(page).toHaveURL(/\/relatorios\?erro=pedido/);
  await expect(page.getByText(/deve ser igual ou anterior/)).toBeVisible();
});
