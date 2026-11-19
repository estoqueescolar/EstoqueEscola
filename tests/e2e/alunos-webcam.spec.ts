import { expect, test } from "@playwright/test";
import { entrar } from "./apoio";

// Chromium com câmera falsa (imagem de teste) e permissão concedida.
test.use({
  permissions: ["camera"],
  launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] },
});

test("diretora tira a foto pela webcam e ela aparece no cartão", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1280", "webcam é para computador");
  test.setTimeout(180000);
  const nomeAluno = `Aluno Webcam ${Date.now().toString(36)}`;

  await entrar(page, "diretora@colegio.local");
  await expect(page).toHaveURL(/\/painel/);
  await page.goto("/restricoes/alunos/novo");
  await page.waitForLoadState("networkidle");

  // sem autorização, a webcam fica desativada
  await expect(page.getByRole("button", { name: "Usar webcam" })).toBeDisabled();
  await page.getByLabel(/A família autorizou/).check();
  await page.getByLabel(/Nome completo/).fill(nomeAluno);

  await page.getByRole("button", { name: "Usar webcam" }).click();
  await expect(page.getByLabel("Imagem ao vivo da webcam")).toBeVisible();
  await expect(page.getByRole("button", { name: "Capturar foto" })).toBeEnabled();
  await page.getByRole("button", { name: "Capturar foto" }).click();
  await expect(page.getByRole("img", { name: `Foto de ${nomeAluno}` })).toBeVisible();

  await page.getByRole("checkbox", { name: "Diabetes" }).check();
  await page.getByRole("button", { name: "Cadastrar aluno" }).click();
  await expect(page).toHaveURL(/\/restricoes\/alunos$/);

  // a foto vem do bucket privado por URL assinada
  const foto = page.getByRole("listitem", { name: nomeAluno }).getByRole("img", { name: `Foto de ${nomeAluno}` });
  await expect(foto).toBeVisible();
  await expect(foto).toHaveAttribute("src", /\/storage\/v1\/object\/sign\/fotos-alunos\/.+token=/);
  expect(await foto.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

  // revogar a autorização apaga a foto (LGPD)
  await page.getByRole("link", { name: `Editar ${nomeAluno}` }).click();
  await expect(page).toHaveURL(/\/editar$/, { timeout: 60000 });
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/A família autorizou/).uncheck();
  await expect(page.getByText("Sem autorização, a foto será apagada ao salvar.")).toBeVisible();
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page).toHaveURL(/\/restricoes\/alunos$/);
  await expect(page.getByRole("listitem", { name: nomeAluno }).getByRole("img", { name: `${nomeAluno}, sem foto` })).toBeVisible();

  // limpeza
  await page.getByRole("link", { name: `Editar ${nomeAluno}` }).click();
  await expect(page).toHaveURL(/\/editar$/, { timeout: 60000 });
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: `Excluir ${nomeAluno}` }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();
  await expect(page.getByRole("listitem", { name: nomeAluno })).toHaveCount(0);
});
