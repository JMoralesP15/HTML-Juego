import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'index.html')).href + '#main';
const FIXED_NOW = '2026-09-12T12:00:00.000Z';

async function boot(page, width = 1440, height = 900) {
  await page.addInitScript(({ fixedNow }) => {
    window.__QUE_ANO_DISABLE_ANALYTICS__ = true;
    const NativeDate = Date;
    const fixed = new NativeDate(fixedNow).valueOf();
    class FixedDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [fixed])); }
      static now() { return fixed; }
    }
    FixedDate.parse = NativeDate.parse;
    FixedDate.UTC = NativeDate.UTC;
    window.Date = FixedDate;
  }, { fixedNow: FIXED_NOW });
  await page.setViewportSize({ width, height });
  await page.goto(url);
  await page.waitForFunction(() => typeof startDaily === 'function' && typeof defaultState === 'function');
  await page.evaluate(() => {
    const state = defaultState();
    state.onboardingSeen = true;
    setState(state);
    round = null;
    lastSummary = null;
    showView('hoy', { focus: false });
    startDaily();
    const dialog = document.getElementById('detailDialog');
    if (dialog?.open) dialog.close();
  });
  await expect(page.locator('.atlas-v12.is-question')).toBeVisible();
  await page.evaluate(() => {
    const dialog = document.getElementById('detailDialog');
    if (dialog?.open) dialog.close();
  });
}

async function answer(page, offset = 0) {
  await page.evaluate((off) => {
    const q = QUESTION_BY_ID.get(round.questionIds[round.index]);
    const guess = Math.max(GLOBAL_MIN_YEAR, Math.min(GLOBAL_MAX_YEAR, q.year + off));
    setYear(guess);
    commitAnswer();
  }, offset);
  await expect(page.locator('.atlas-v12.is-answered')).toBeVisible();
}

async function finishRound(page, offset = 0) {
  await page.evaluate((off) => {
    while (round) {
      if (round.phase === 'question') {
        const q = QUESTION_BY_ID.get(round.questionIds[round.index]);
        setYear(Math.max(GLOBAL_MIN_YEAR, Math.min(GLOBAL_MAX_YEAR, q.year + off)));
        commitAnswer();
      }
      if (round?.phase === 'answer') nextQuestion();
    }
  }, offset);
}

const viewportShot = { animations: 'disabled', maxDiffPixelRatio: 0.01, threshold: 0.25 };
const fullPageShot = { ...viewportShot, fullPage: true };

test('regresión visual · desktop canónico', async ({ page }) => {
  await boot(page);
  await expect(page).toHaveScreenshot('desktop-question.png', viewportShot);
  await answer(page, 0);
  await expect(page).toHaveScreenshot('desktop-feedback-exact.png', viewportShot);

  await boot(page);
  await answer(page, 1);
  await expect(page).toHaveScreenshot('desktop-feedback-near.png', viewportShot);

  await boot(page);
  await finishRound(page, 4);
  await expect(page.locator('.atlas-summary')).toBeVisible();
  await expect(page).toHaveScreenshot('desktop-summary.png', fullPageShot);
});

test('regresión visual · mobile 390x844', async ({ page }) => {
  await boot(page, 390, 844);
  await expect(page).toHaveScreenshot('mobile-question-390x844.png', viewportShot);
  await answer(page, 1);
  await expect(page).toHaveScreenshot('mobile-feedback-390x844.png', viewportShot);

  await boot(page, 390, 844);
  await finishRound(page, 8);
  await expect(page.locator('.atlas-summary')).toBeVisible();
  await expect(page).toHaveScreenshot('mobile-summary-390x844.png', fullPageShot);
});
