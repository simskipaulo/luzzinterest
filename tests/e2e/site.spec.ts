import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

interface Piece {
  slug: string;
  name: string;
  collection: string;
  category: string;
  images: Array<{ src: string; alt: string }>;
}

interface CustomProcess {
  eyebrow: string;
  title: string;
  introduction: string;
  steps: Array<{ title: string; text: string }>;
}

const { site, pieces } = JSON.parse(readFileSync(new URL("../../.generated/catalog.json", import.meta.url), "utf8")) as {
  site: { customProcess?: CustomProcess };
  pieces: Piece[];
};
const firstPiece = pieces[0];
const galleryPiece = pieces.find((piece) => piece.images.length > 1) ?? firstPiece;
const pieceUrl = (piece: Piece) => `/pecas/${piece.slug}/`;
const whatsappUrl = "https://chat.whatsapp.com/Fo9bsCjy1CfIDCqoaqPDoR";

test("percurso da entrada ao acervo, peça e contato no WhatsApp", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Vista o irracional." })).toBeVisible();
  const acervoLink = page.locator('main a[href="/acervo/"]').first();
  await expect(acervoLink).toBeVisible();
  await acervoLink.click();
  await expect(page).toHaveURL(/\/acervo\/?$/);
  await expect(page.getByRole("heading", { level: 1, name: "O que já ganhou forma." })).toBeVisible();
  await page.locator(`main a[href="${pieceUrl(firstPiece)}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`/pecas/${firstPiece.slug}/?$`));
  await expect(page.getByRole("heading", { level: 1, name: firstPiece.name })).toBeVisible();
  const whatsapp = page.getByRole("link", { name: "Conversar sobre encomenda no grupo" });
  await expect(whatsapp).toHaveAttribute("href", whatsappUrl);
  await expect(whatsapp).toHaveAttribute("target", "_blank");
  await expect(whatsapp).toHaveAttribute("rel", /noopener/);
  // O destino é verificado sem abrir o WhatsApp nem ingressar no grupo.
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: firstPiece.name })).toBeVisible();
  await expect.poll(async () => page.locator("main .piece-image").first().evaluate((image) =>
    image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
  )).toBe(true);
  expect(errors).toEqual([]);
});

test("filtros de coleção e tipo correspondem ao catálogo", async ({ page }) => {
  await page.goto("/acervo/");
  await expect(page.locator("main .archive-grid .piece-card-link")).toHaveCount(pieces.length);
  for (const name of ["Camisa Ghellion", "Polo Paranoico"]) {
    const piece = pieces.find((item) => item.name === name);
    expect(piece).toBeDefined();
    await expect(page.getByRole("link", { name, exact: true })).toHaveAttribute("href", pieceUrl(piece!));
  }
  for (const piece of pieces) {
    const photo = page.locator(`main a[href="${pieceUrl(piece)}"]`).getByRole("img", { name: piece.images[0].alt, exact: true });
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
  }
  const collection = page.getByRole("combobox", { name: "Coleção", exact: true });
  const category = page.getByRole("combobox", { name: "Tipo de peça", exact: true });
  const collections = [...new Set(pieces.map((piece) => piece.collection))];
  const categories = [...new Set(pieces.map((piece) => piece.category))];
  if (collections.length > 1) {
    await collection.selectOption({ label: firstPiece.collection });
    for (const piece of pieces) {
      const card = page.locator(`main a[href="${pieceUrl(piece)}"]`);
      if (piece.collection === firstPiece.collection) await expect(card).toBeVisible();
      else await expect(card).not.toBeVisible();
    }
    await collection.selectOption({ index: 0 });
  }
  if (categories.length > 1) {
    await category.selectOption({ label: firstPiece.category });
    for (const piece of pieces) {
      const card = page.locator(`main a[href="${pieceUrl(piece)}"]`);
      if (piece.category === firstPiece.category) await expect(card).toBeVisible();
      else await expect(card).not.toBeVisible();
    }
    await category.selectOption({ index: 0 });
  }
  for (const piece of pieces) {
    await expect(page.locator(`main a[href="${pieceUrl(piece)}"]`)).toBeVisible();
  }
});

test("processo de customização apresenta as etapas do conteúdo e contato sem checkout", async ({ page }) => {
  expect(site.customProcess).toBeDefined();
  const process = site.customProcess!;
  await page.goto("/");
  const section = page.locator(".custom-process");
  await expect(section).toHaveAttribute("aria-labelledby", "custom-process-title");
  await expect(section.locator("#custom-process-title")).toHaveText(process.title);
  await expect(section.getByText(process.eyebrow, { exact: true })).toBeVisible();
  await expect(section.getByText(process.introduction, { exact: true })).toBeVisible();
  await expect(section.getByRole("listitem")).toHaveCount(process.steps.length);
  await expect(section.getByRole("heading", { level: 3 })).toHaveText(process.steps.map((step) => step.title));
  for (let index = 0; index < process.steps.length; index++) {
    await expect(section.getByRole("listitem").nth(index).getByText(process.steps[index].text, { exact: true })).toBeVisible();
  }
  const contact = section.getByRole("link", { name: "Conversar sobre uma ideia no grupo" });
  await expect(contact).toHaveAttribute("href", whatsappUrl);
  await expect(contact).toHaveAttribute("target", "_blank");
  await expect(contact).toHaveAttribute("rel", /noopener/);
  await expect(page.locator("main")).not.toContainText(/R\$\s*\d/);
  await expect(page.locator("form")).toHaveCount(0);
});

test("galeria permite ampliar, trocar foto e fechar pelo teclado", async ({ page }) => {
  await page.goto(pieceUrl(galleryPiece));
  const opener = page.getByRole("button", { name: `Ampliar foto 1 de ${galleryPiece.name}`, exact: true });
  await opener.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: `Galeria de ${galleryPiece.name}` });
  await expect(dialog).toBeVisible();
  const photo = dialog.getByRole("img").first();
  const originalSource = await photo.getAttribute("src");
  if (galleryPiece.images.length > 1) {
    await dialog.getByRole("button", { name: "Próxima foto", exact: true }).click();
    await expect(photo).not.toHaveAttribute("src", originalSource!);
    await dialog.getByRole("button", { name: "Foto anterior", exact: true }).click();
    await expect(photo).toHaveAttribute("src", originalSource!);
  }
  await dialog.getByRole("button", { name: "Fechar galeria", exact: true }).focus();
  for (let index = 0; index < 5; index++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  for (let index = 0; index < 5; index++) {
    await page.keyboard.press("Shift+Tab");
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test("conteúdo e navegação essenciais existem sem JavaScript", async ({ browser, baseURL }, testInfo) => {
  const { viewport, isMobile, hasTouch, deviceScaleFactor, userAgent } = testInfo.project.use;
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport, isMobile, hasTouch, deviceScaleFactor, userAgent });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Vista o irracional." })).toBeVisible();
  if (site.customProcess) {
    const section = page.locator(".custom-process");
    await expect(section.getByRole("heading", { level: 2, name: site.customProcess.title })).toBeVisible();
    await expect(section.getByRole("heading", { level: 3 })).toHaveText(site.customProcess.steps.map((step) => step.title));
  }
  const fallbackNavigation = page.getByRole("navigation", { name: "Navegação alternativa" });
  await expect(fallbackNavigation).toBeVisible();
  await expect(fallbackNavigation.getByRole("link", { name: "Contato" })).toHaveAttribute("href", "/#contato");
  await fallbackNavigation.getByRole("link", { name: "Acervo", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "O que já ganhou forma." })).toBeVisible();
  await page.locator(`main a[href="${pieceUrl(firstPiece)}"]`).first().click();
  await expect(page.getByRole("heading", { level: 1, name: firstPiece.name })).toBeVisible();
  await expect(page.getByRole("link", { name: "Conversar sobre encomenda no grupo" })).toHaveAttribute("href", whatsappUrl);
  await context.close();
});

test("voltar no navegador depois de abrir uma foto de outra peça preserva a galeria", async ({ page }) => {
  const pair = pieces.filter((piece) => piece.images.length === 1).map((source) => {
    const related = pieces.filter((piece) => piece.slug !== source.slug)
      .sort((left, right) => Number(right.collection === source.collection) - Number(left.collection === source.collection)).slice(0, 2);
    const destination = related.find((piece) => piece.images.length > source.images.length);
    return destination ? { source, destination } : undefined;
  }).find((candidate) => candidate !== undefined);
  expect(pair, "O catálogo deve oferecer uma peça com uma foto ligada a outra com mais fotos para cobrir esta regressão.").toBeDefined();
  const { source, destination } = pair!;
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(pieceUrl(source));
  await page.locator(`main a[href="${pieceUrl(destination)}"]`).click();
  await page.getByRole("button", { name: `Ampliar foto 2 de ${destination.name}`, exact: true }).click();
  await expect(page.getByRole("dialog", { name: `Galeria de ${destination.name}` })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1, name: source.name })).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: `Ampliar foto 1 de ${source.name}`, exact: true }).click();
  await expect(page.getByRole("dialog", { name: `Galeria de ${source.name}` })).toBeVisible();
  expect(errors).toEqual([]);
});

test("URLs desconhecidas devolvem status 404 e uma página legível", async ({ page, request }) => {
  for (const pathname of ["/nao-existe/", "/pecas/peca-inexistente/"]) {
    const response = await request.get(pathname);
    expect(response.status()).toBe(404);
    expect(response.headers()["content-type"]).toContain("text/html");
    expect(await response.text()).not.toMatch(/<script\b/i);
    const document = await page.goto(pathname);
    expect(document?.status()).toBe(404);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Abrir menu", includeHidden: true })).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("Vamos tentar de novo.");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("link", { name: "Explorar o acervo" }).click();
    await expect(page).toHaveURL(/\/acervo\/?$/);
    await expect(page.getByRole("heading", { level: 1, name: "O que já ganhou forma." })).toBeVisible();
  }
});

test("fontes próprias carregam com sucesso a partir do site", async ({ page, baseURL }) => {
  const fonts: Array<{ url: string; status: number }> = [];
  page.on("response", (response) => {
    if (response.request().resourceType() === "font") fonts.push({ url: response.url(), status: response.status() });
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(fonts.length).toBeGreaterThanOrEqual(4);
  expect(fonts.every((font) => font.status === 200 && new URL(font.url).origin === new URL(baseURL!).origin)).toBe(true);
  const loadedFamilies = await page.evaluate(() => [...document.fonts].filter((font) => font.status === "loaded").map((font) => font.family));
  expect(loadedFamilies).toContain("Barlow Condensed");
  expect(loadedFamilies).toContain("IBM Plex Sans");
});

test("layout cabe na tela e respeita movimento reduzido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const pathname of ["/", "/acervo/", pieceUrl(firstPiece)]) {
    await page.goto(pathname);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    const animations = await page.locator("main").evaluate((main) => main.getAnimations({ subtree: true })
      .filter((animation) => animation.playState === "running")
      .map((animation) => Number(animation.effect?.getComputedTiming().duration ?? 0)));
    expect(animations.every((duration) => duration <= 1)).toBe(true);
  }
});

test("título da entrada permanece completo em telas de 320 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const title = page.getByRole("heading", { level: 1, name: "Vista o irracional." });
  await expect(title).toBeVisible();
  await expect(title.locator("span")).toHaveText("irracional.");
  expect(await title.evaluate((heading) => {
    const span = heading.querySelector("span")!;
    const titleBounds = heading.getBoundingClientRect();
    const spanBounds = span.getBoundingClientRect();
    return heading.scrollWidth <= heading.clientWidth + 1
      && span.scrollWidth <= span.clientWidth + 1
      && titleBounds.left >= 0 && titleBounds.right <= innerWidth + 1
      && spanBounds.left >= 0 && spanBounds.right <= innerWidth + 1;
  })).toBe(true);
});
