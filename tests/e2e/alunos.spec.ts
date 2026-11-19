import { expect, test } from "@playwright/test";
import { entrar, verificarTela } from "./apoio";

test("consulta vê alunos com foto, nome e nível, alterna a visão e filtra", async ({ page }) => {
  await entrar(page, "consulta@colegio.local");
  await expect(page).toHaveURL(/\/painel/);
  await page.goto("/restricoes/alunos");
  await expect(page.getByRole("heading", { name: "Restrições alimentares", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Alunos e alergias" })).toHaveAttribute("aria-current", "page");
  await verificarTela(page);

  // visão por aluno: o nível aparece em texto, não só na cor
  const joao = page.getByRole("listitem", { name: "João Pedro Lima" });
  await expect(joao).toBeVisible();
  await expect(joao.getByText("Grave", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cadastrar aluno/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^Editar / })).toHaveCount(0);

  // visão por alergia
  await page.getByRole("link", { name: "Por alergia" }).click();
  await expect(page).toHaveURL(/ver=alergia/);
  await expect(page.getByRole("heading", { name: /Alergia a amendoim/, level: 2 })).toBeVisible();
  await verificarTela(page);

  await page.getByLabel("Buscar aluno").fill("joao");
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(page).toHaveURL(/busca=joao/);
  await expect(page).toHaveURL(/ver=alergia/);
  await expect(page.getByText("Ana Beatriz Souza")).toHaveCount(0);

  await page.getByLabel("Buscar aluno").fill("zzz");
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(page.getByText(/Nenhum aluno com esses filtros/)).toBeVisible();
});

test("contagem do dia fica na outra aba, com as linhas alinhadas", async ({ page }) => {
  await entrar(page, "cozinha@colegio.local");
  await expect(page).toHaveURL(/\/painel/);
  await page.goto("/restricoes");
  await expect(page.getByRole("link", { name: "Contagem do dia" })).toHaveAttribute("aria-current", "page");
  await verificarTela(page);

  // todas as caixas de número na mesma coluna (mesma posição horizontal)
  const caixas = page.getByRole("tabpanel").getByRole("textbox");
  const posicoes = await caixas.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
  expect(posicoes.length).toBeGreaterThan(1);
  expect(new Set(posicoes).size).toBe(1);
});

test("consulta é mandada de volta ao tentar abrir o cadastro", async ({ page }) => {
  await entrar(page, "consulta@colegio.local");
  await expect(page).toHaveURL(/\/painel/);
  await page.goto("/restricoes/alunos/novo");
  await expect(page).toHaveURL(/\/restricoes\/alunos$/);
});

test("administrador cria alergia no cadastro, associa com nível grave e depois limpa tudo", async ({ page }) => {
  test.setTimeout(180000); // fluxo longo; no `next dev` as rotas novas compilam na primeira visita
  const sufixo = Date.now().toString(36);
  const nomeAluno = `Aluno Teste ${sufixo}`;
  const nomeAlergia = `Alergia teste ${sufixo}`;

  await entrar(page, "diretora@colegio.local");
  await expect(page).toHaveURL(/\/painel/);
  await page.goto("/restricoes/alunos");
  await expect(page.getByRole("heading", { name: "Como cadastrar" })).toBeVisible();
  await page.getByRole("link", { name: "Cadastrar aluno" }).first().click();
  await expect(page.getByRole("heading", { name: "Cadastrar aluno", level: 1 })).toBeVisible({ timeout: 60000 });
  await verificarTela(page);

  // sem nome e sem alergia, o formulário aponta os dois problemas
  await page.getByRole("button", { name: "Cadastrar aluno" }).click();
  await expect(page.getByText("Informe o nome do aluno.")).toBeVisible();
  await expect(page.getByText("Escolha ao menos uma restrição.")).toBeVisible();

  await page.getByLabel(/Nome completo/).fill(nomeAluno);
  await page.getByLabel("Turma").fill("5º ano Z");

  // a alergia não existe: a busca oferece criar, e ela já vem marcada
  await page.getByLabel("Procurar alergia").fill(nomeAlergia);
  await page.getByRole("button", { name: `Criar “${nomeAlergia}”` }).click();
  await expect(page.getByRole("checkbox", { name: nomeAlergia })).toBeChecked();
  // o rádio é visualmente oculto e quem recebe o toque é o rótulo (como a pessoa faz)
  await page.getByRole("radio", { name: "Grave" }).check({ force: true });
  await page.getByLabel(/A família autorizou/).check();
  await verificarTela(page);

  await page.getByRole("button", { name: "Cadastrar aluno" }).click();
  await expect(page).toHaveURL(/\/restricoes\/alunos$/);

  const cartao = page.getByRole("listitem", { name: nomeAluno });
  await expect(cartao).toBeVisible();
  await expect(cartao.getByText(nomeAlergia)).toBeVisible();
  await expect(cartao.getByText("Grave", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: `Editar ${nomeAluno}` }).click();
  await expect(page).toHaveURL(/\/editar$/, { timeout: 60000 });
  await expect(page.getByLabel(/Nome completo/)).toHaveValue(nomeAluno);
  await expect(page.getByRole("radio", { name: "Grave" })).toBeChecked();
  await page.waitForLoadState("networkidle"); // espera a hidratação antes de abrir o diálogo
  await page.getByRole("button", { name: `Excluir ${nomeAluno}` }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();
  await expect(page).toHaveURL(/\/restricoes\/alunos$/);
  await expect(page.getByRole("listitem", { name: nomeAluno })).toHaveCount(0);

  // limpa a alergia criada pelo teste, para não acumular no banco
  await page.goto("/cadastros/restricoes");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: `Excluir ${nomeAlergia}` }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Excluir" }).click();
  await expect(page.getByText(nomeAlergia)).toHaveCount(0);
});

test("consulta abre a lista para imprimir, com a seção de reação grave primeiro", async ({ page }) => {
  await entrar(page, "consulta@colegio.local");
  await expect(page).toHaveURL(/\/painel/);
  await page.goto("/restricoes/alunos");
  await page.getByRole("link", { name: "Imprimir lista" }).click();
  await expect(page).toHaveURL(/\/imprimir\/alunos$/, { timeout: 60000 });
  await expect(page.getByRole("heading", { name: "Alunos com restrição alimentar", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Imprimir" })).toBeVisible();

  const graves = page.getByRole("region", { name: /reação grave/ });
  await expect(graves.getByText("João Pedro Lima")).toBeVisible();
  await expect(graves.getByText("Ana Beatriz Souza")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Intolerância à lactose/, level: 2 })).toBeVisible();
  await verificarTela(page);

  // na folha impressa, botões e links de navegação somem
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: "Imprimir" })).toBeHidden();
});
