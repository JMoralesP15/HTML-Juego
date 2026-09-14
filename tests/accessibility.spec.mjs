import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'index.html')).href + '?edition=full#main';

async function boot(page, { start = true } = {}) {
  await page.addInitScript(() => { window.__QUE_ANO_DISABLE_ANALYTICS__ = true; });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url);
  await page.waitForFunction(() => typeof defaultState === 'function' && typeof __QA_V15__ === 'object' && typeof __QA_V16__ === 'object' && document.getElementById('view'));
  await page.evaluate((shouldStart) => {
    const state = defaultState();state.onboardingSeen = true;setState(state);round = null;lastSummary = null;
    const dialog = document.getElementById('detailDialog');if (dialog?.open) dialog.close();showView('hoy', { focus: false });if (shouldStart) startDaily();
  }, start);
}

async function assertAccessible(page, label) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const relevant = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  const compact = relevant.map(v => ({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.length,targets:v.nodes.slice(0,8).map(n=>n.target),samples:v.nodes.slice(0,4).map(n=>n.html)}));
  expect(compact, `${label}: violaciones relevantes de accesibilidad\n${JSON.stringify(compact, null, 2)}`).toEqual([]);
}

test('axe · pantalla inicial y pregunta', async ({ page }) => {
  await boot(page, { start: false });await assertAccessible(page, 'Hoy');await page.evaluate(() => startDaily());await assertAccessible(page, 'Pregunta');
});

test('axe · feedback, contexto progresivo y ficha', async ({ page }) => {
  await boot(page);await page.evaluate(() => {const original=qaExtendedContext;qaExtendedContext=q=>({...original(q),locate:'Este proceso histórico conecta transformaciones sociales de varias generaciones.'});const q=QUESTION_BY_ID.get(round.questionIds[round.index]);setYear(q.year);commitAnswer();const dialog=document.getElementById('detailDialog');if(dialog?.open)dialog.close()});
  await assertAccessible(page, 'Feedback');
  const toggle=page.locator('[data-v16-action="context-toggle"]');await expect(toggle).toBeVisible();await toggle.click();await assertAccessible(page,'Feedback expandido');
  await page.evaluate(()=>openDetail(round.questionIds[round.index]));await expect(page.locator('#detailDialog')).toHaveAttribute('open','');await assertAccessible(page,'Ficha completa');
});

test('axe · resumen', async ({ page }) => {
  await boot(page);await page.evaluate(() => {while(round){if(round.phase==='question'){const q=QUESTION_BY_ID.get(round.questionIds[round.index]);setYear(q.year);commitAnswer()}if(round?.phase==='answer')nextQuestion()}});await expect(page.locator('.atlas-summary')).toBeVisible();await assertAccessible(page,'Resumen');
});

test('axe · navegación, colección y estadísticas', async ({ page }) => {
  await boot(page, { start: false });await page.evaluate(()=>showView('coleccion',{focus:false}));await assertAccessible(page,'Colección');await page.evaluate(()=>showView('estadisticas',{focus:false}));await assertAccessible(page,'Estadísticas');await page.evaluate(()=>showView('repaso',{focus:false}));await assertAccessible(page,'Repaso');
});
