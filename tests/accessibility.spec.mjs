import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'index.html')).href + '#main';

async function boot(page, { start = true } = {}) {
  await page.addInitScript(() => { window.__QUE_ANO_DISABLE_ANALYTICS__ = true; });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url);
  await page.waitForFunction(() => typeof defaultState === 'function' && document.getElementById('view'));
  await page.evaluate((shouldStart) => {
    const state = defaultState();
    state.onboardingSeen = true;
    setState(state);
    round = null;
    lastSummary = null;
    const dialog = document.getElementById('detailDialog');
    if (dialog?.open) dialog.close();
    showView('hoy', { focus: false });
    if (shouldStart) startDaily();
  }, start);
}

async function assertAccessible(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const relevant = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  const compact = relevant.map(v => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.length,
    targets: v.nodes.slice(0, 8).map(n => n.target),
    samples: v.nodes.slice(0, 4).map(n => n.html)
  }));
  expect(compact, `${label}: violaciones relevantes de accesibilidad\n${JSON.stringify(compact, null, 2)}`).toEqual([]);
}

test('axe · pantalla inicial y pregunta', async ({ page }) => {
  await boot(page, { start: false });
  await assertAccessible(page, 'Hoy');
  await page.evaluate(() => startDaily());
  await assertAccessible(page, 'Pregunta');
});

test('axe · feedback y contexto', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    const q = QUESTION_BY_ID.get(round.questionIds[round.index]);
    setYear(q.year);
    commitAnswer();
    const dialog = document.getElementById('detailDialog');
    if (dialog?.open) dialog.close();
  });
  await assertAccessible(page, 'Feedback');
  await page.locator('[data-action="detail"]').first().click();
  await expect(page.locator('#detailDialog')).toHaveAttribute('open', '');
  await assertAccessible(page, 'Contexto');
});

test('axe · resumen', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => {
    while (round) {
      if (round.phase === 'question') {
        const q = QUESTION_BY_ID.get(round.questionIds[round.index]);
        setYear(q.year);
        commitAnswer();
      }
      if (round?.phase === 'answer') nextQuestion();
    }
  });
  await expect(page.locator('.atlas-summary')).toBeVisible();
  await assertAccessible(page, 'Resumen');
});

test('axe · navegación, colección y estadísticas', async ({ page }) => {
  await boot(page, { start: false });
  await page.evaluate(() => showView('coleccion', { focus: false }));
  await assertAccessible(page, 'Colección');
  await page.evaluate(() => showView('estadisticas', { focus: false }));
  await assertAccessible(page, 'Estadísticas');
  await page.evaluate(() => showView('repaso', { focus: false }));
  await assertAccessible(page, 'Repaso');
});