import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'index.html')).href + '#main';
const FIXED_NOW = '2026-09-12T12:00:00.000Z';
const shotDir = path.join(root, 'test-results', 'screenshots');

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
  await expect(page.locator('.v16-learning-card')).toBeVisible();
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

async function assertVisualContract(page, phase, name) {
  const viewport = page.viewportSize();
  const metrics = await page.evaluate((currentPhase) => {
    const rect = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    };
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      dialogOpen: Boolean(document.getElementById('detailDialog')?.open),
      surface: rect(currentPhase === 'summary' ? '.atlas-summary' : '.atlas-v12'),
      primary: rect(currentPhase === 'summary' ? '.summary-primary' : '#primaryAction'),
      year: rect('#yearInput'),
      learning: rect('.v16-learning-card'),
      narrativeCount: document.querySelectorAll('.v16-learning-card .v16-learning-narrative').length,
      contextExpanded: document.querySelector('.v16-context-button')?.getAttribute('aria-expanded') || null,
      question: document.querySelector('.atlas-v12')?.classList.contains('is-question') || false,
      answered: document.querySelector('.atlas-v12')?.classList.contains('is-answered') || false,
      summary: Boolean(document.querySelector('.atlas-summary')),
      learnedItems: document.querySelectorAll('.v16-learned-item').length
    };
  }, phase);

  expect(metrics.innerWidth).toBe(viewport.width);
  expect(metrics.innerHeight).toBe(viewport.height);
  expect(metrics.documentWidth).toBeLessThanOrEqual(viewport.width + 1);
  expect(metrics.bodyWidth).toBeLessThanOrEqual(viewport.width + 1);
  expect(metrics.dialogOpen).toBe(false);
  expect(metrics.surface).toBeTruthy();
  expect(metrics.surface.x).toBeGreaterThanOrEqual(-1);
  expect(metrics.surface.right).toBeLessThanOrEqual(viewport.width + 1);

  if (phase === 'question') {
    expect(metrics.question).toBe(true);
    expect(metrics.year).toBeTruthy();
    expect(metrics.primary).toBeTruthy();
    expect(metrics.primary.bottom).toBeLessThanOrEqual(viewport.height + 1);
    await expect(page.locator('#primaryAction')).toContainText('Confirmar');
  }

  if (phase === 'feedback') {
    expect(metrics.answered).toBe(true);
    expect(metrics.learning).toBeTruthy();
    expect(metrics.narrativeCount).toBeGreaterThanOrEqual(1);
    expect(metrics.narrativeCount).toBeLessThanOrEqual(2);
    expect(metrics.contextExpanded).toBe('false');
    await expect(page.locator('.v16-learning-card')).not.toContainText(/Qué fue|Dato para recordar|La fecha es el punto de entrada/i);
  }

  if (phase === 'summary') {
    expect(metrics.summary).toBe(true);
    expect(metrics.learnedItems).toBe(5);
    expect(metrics.primary).toBeTruthy();
  }

  fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({
    path: path.join(shotDir, `regression-v184-${name}.png`),
    fullPage: phase === 'summary',
    animations: 'disabled'
  });
}

test('regresión visual contractual · desktop canónico', async ({ page }) => {
  await boot(page);
  await assertVisualContract(page, 'question', 'desktop-question');
  await answer(page, 0);
  await assertVisualContract(page, 'feedback', 'desktop-feedback-exact');

  await boot(page);
  await answer(page, 1);
  await assertVisualContract(page, 'feedback', 'desktop-feedback-near');

  await boot(page);
  await finishRound(page, 4);
  await expect(page.locator('.atlas-summary')).toBeVisible();
  await assertVisualContract(page, 'summary', 'desktop-summary');
});

test('regresión visual contractual · mobile 390x844', async ({ page }) => {
  await boot(page, 390, 844);
  await assertVisualContract(page, 'question', 'mobile-question-390x844');
  await answer(page, 1);
  await assertVisualContract(page, 'feedback', 'mobile-feedback-390x844');

  await boot(page, 390, 844);
  await finishRound(page, 8);
  await expect(page.locator('.atlas-summary')).toBeVisible();
  await assertVisualContract(page, 'summary', 'mobile-summary-390x844');
});
