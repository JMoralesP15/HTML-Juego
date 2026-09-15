import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'index.html')).href + '?edition=full#main';
const sizes = [
  {name:'1440x900', width:1440, height:900},
  {name:'1366x768', width:1366, height:768},
  {name:'390x844', width:390, height:844},
  {name:'375x667', width:375, height:667},
];

async function boot(page, size=sizes[0]){
  const consoleErrors=[];page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text())});page.on('pageerror',err=>consoleErrors.push(err.message));
  await page.setViewportSize({width:size.width,height:size.height});await page.goto(url);await page.waitForFunction(() => typeof startDaily === 'function' && typeof defaultState === 'function' && typeof __QA_V15__ === 'object' && document.getElementById('view'));
  await page.evaluate(() => {const s=defaultState();s.onboardingSeen=true;setState(s);if(document.getElementById('detailDialog')?.open)document.getElementById('detailDialog').close();round=null;lastSummary=null;showView('hoy',{focus:false});startDaily()});await expect(page.locator('#detailDialog')).not.toHaveAttribute('open','');return consoleErrors;
}

async function assertFrame(page,{allowPageScroll=false}={}){
  const metrics=await page.evaluate(()=>({docW:document.documentElement.scrollWidth,clientW:document.documentElement.clientWidth,bodyW:document.body.scrollWidth,gameOverflow:document.querySelector('.game')?getComputedStyle(document.querySelector('.game')).overflow:null,summaryOverflow:document.querySelector('.summary-v11')?getComputedStyle(document.querySelector('.summary-v11')).overflowY:null,primary:!!document.querySelector('.primary')}));
  expect(metrics.docW).toBeLessThanOrEqual(metrics.clientW+1);expect(metrics.bodyW).toBeLessThanOrEqual(metrics.clientW+1);expect(metrics.primary).toBeTruthy();if(!allowPageScroll && metrics.summaryOverflow)expect(['auto','scroll']).not.toContain(metrics.summaryOverflow);await expect(page.locator('body')).not.toContainText('undefined');await expect(page.locator('body')).not.toContainText('NaN');
}

async function answerWithOffset(page,offset){await page.evaluate((off)=>{const q=QUESTION_BY_ID.get(round.questionIds[round.index]);const guess=Math.max(GLOBAL_MIN_YEAR,Math.min(GLOBAL_MAX_YEAR,q.year+off));setYear(guess);commitAnswer()},offset)}

for (const size of sizes) {
  test(`Pregunta ${size.name}`, async ({page}) => {
    const errors=await boot(page,size);await expect(page.locator('#yearInput')).toBeVisible();await expect(page.locator('#primaryAction')).toContainText('Confirmar');await assertFrame(page);
    const box=await page.locator('#yearInput').boundingBox(),plus=await page.locator('[data-action="adjust"][data-step="1"]').boundingBox();expect(box && plus && box.x+box.width <= plus.x+1).toBeTruthy();
    const cta=await page.locator('#primaryAction').boundingBox(),vp=page.viewportSize();expect(cta && cta.y+cta.height<=vp.height+1).toBeTruthy();await page.screenshot({path:`test-results/screenshots/v15-pregunta-${size.name}.png`,fullPage:true});expect(errors).toEqual([]);
  });

  test(`Feedback exacto ${size.name}`, async ({page}) => {
    const errors=await boot(page,size);await answerWithOffset(page,0);await expect(page.locator('#primaryAction')).toBeVisible();await expect(page.locator('.v15-result-distance')).toHaveText('Respuesta exacta');await expect(page.locator('.exact-scale')).toBeHidden();await assertFrame(page,{allowPageScroll:size.width<=760});await page.screenshot({path:`test-results/screenshots/v15-feedback-exacto-${size.name}.png`,fullPage:true});expect(errors).toEqual([]);
  });
}

test('Feedback cercano, lejano y fecha revelada', async ({page}) => {
  await boot(page,sizes[0]);await answerWithOffset(page,1);await expect(page.locator('.v15-result-distance')).toContainText('1 año');await page.screenshot({path:'test-results/screenshots/v15-feedback-cercano-1440x900.png',fullPage:true});
  await boot(page,sizes[0]);await page.evaluate(() => {const candidate=QUESTIONS.find(q=>q.year+40<=GLOBAL_MAX_YEAR);if(!candidate)throw new Error('No existe una pregunta válida para probar +40 años.');round.questionIds[round.index]=candidate.id;renderGame();setYear(candidate.year+40);commitAnswer()});await expect(page.locator('.v15-result-distance')).toContainText('40 años');await page.screenshot({path:'test-results/screenshots/v15-feedback-lejano-1440x900.png',fullPage:true});
  await boot(page,sizes[0]);await page.evaluate(()=>commitAnswer(true));await expect(page.locator('.v15-result-distance')).toHaveText('Fecha revelada para repasar');await page.screenshot({path:'test-results/screenshots/v15-feedback-revelada-1440x900.png',fullPage:true});
});

test('Feedback cercano y revelado mobile', async ({page}) => {
  await boot(page,sizes[2]);await answerWithOffset(page,-1);await assertFrame(page,{allowPageScroll:true});await page.screenshot({path:'test-results/screenshots/v15-feedback-cercano-390x844.png',fullPage:true});await boot(page,sizes[2]);await page.evaluate(()=>commitAnswer(true));await page.screenshot({path:'test-results/screenshots/v15-feedback-revelada-390x844.png',fullPage:true});
});

test('Resumen diario desktop abre ficha desde aprendizaje', async ({page}) => {
  const errors=await boot(page,sizes[0]);await page.evaluate(() => {while(round){if(round.phase==='question'){const q=QUESTION_BY_ID.get(round.questionIds[round.index]);setYear(q.year);commitAnswer()}if(round?.phase==='answer')nextQuestion()}});await expect(page.locator('.summary-v11')).toBeVisible();await expect(page.locator('[data-action="summary-detail"]')).toHaveCount(0);await expect(page.locator('.v16-learned-item')).toHaveCount(5);await assertFrame(page);await page.screenshot({path:'test-results/screenshots/resumen-1440x900.png',fullPage:true});await page.locator('.v16-learned-item').first().click();await expect(page.locator('#detailDialog')).toHaveAttribute('open','');await expect(page.locator('#dialogTitle')).not.toHaveText('Tus respuestas');await page.screenshot({path:'test-results/screenshots/resumen-contexto-1440x900.png',fullPage:true});expect(errors).toEqual([]);
});

test('Resumen diario mobile usa scroll de página', async ({page}) => {
  await boot(page,sizes[2]);await page.evaluate(() => {while(round){if(round.phase==='question'){const q=QUESTION_BY_ID.get(round.questionIds[round.index]);setYear(Math.min(GLOBAL_MAX_YEAR,q.year+8));commitAnswer()}if(round?.phase==='answer')nextQuestion()}});await expect(page.locator('.summary-v11')).toBeVisible();const overflow=await page.locator('.summary-v11').evaluate(el=>getComputedStyle(el).overflowY);expect(['auto','scroll']).not.toContain(overflow);await assertFrame(page,{allowPageScroll:true});await page.screenshot({path:'test-results/screenshots/resumen-390x844.png',fullPage:true});
});

test('Repaso de dos preguntas adapta el progreso simplificado', async ({page}) => {
  await boot(page,sizes[0]);await page.evaluate(()=>{const qs=QUESTIONS.slice(0,2);round=createRound('review',qs);currentView='repaso';persistRound();renderGame()});await expect(page.locator('.archive-progress li')).toHaveCount(2);await expect(page.locator('.archive-progress')).toBeHidden();await expect(page.locator('.v15-progress-text')).toHaveText('1 / 2');await page.screenshot({path:'test-results/screenshots/v15-repaso-pregunta-1440x900.png',fullPage:true});await answerWithOffset(page,3);await page.screenshot({path:'test-results/screenshots/v15-repaso-feedback-1440x900.png',fullPage:true});
});

test('Focus visible en YearSelector, CTA y No lo sé', async ({page}) => {
  await boot(page,sizes[0]);
  // Wait for the renderer's scheduled initial focus before moving it ourselves.
  await expect(page.locator('#yearInput')).toBeFocused();
  await page.keyboard.press('Tab');
  for(const selector of ['#yearInput','#primaryAction','[data-action="skip"]']){
    const control=page.locator(selector);
    await control.focus();
    await expect(control).toBeFocused();
    await expect(control).not.toHaveCSS('outline-style','none');
    await expect(control).not.toHaveCSS('outline-width','0px');
  }
  await page.screenshot({path:'test-results/screenshots/focus-yearselector-1440x900.png',fullPage:true});
});
