import {test,expect} from '@playwright/test';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url=pathToFileURL(path.join(root,'index.html')).href+'#main';

async function boot(page,{width=1440,height=900,start=true}={}){
  await page.addInitScript(()=>{window.__QUE_ANO_DISABLE_ANALYTICS__=true});await page.setViewportSize({width,height});await page.goto(url);await page.waitForFunction(()=>typeof startDaily==='function'&&typeof __QA_V13__==='object'&&typeof __QA_V15__==='object'&&typeof __QA_V16__==='object');
  await page.evaluate(start=>{const s=defaultState();s.onboardingSeen=true;setState(s);round=null;lastSummary=null;const d=document.getElementById('detailDialog');if(d?.open)d.close();showView('hoy',{focus:false});if(start)startDaily()},start);
}
async function answerCurrent(page,offset=0){await page.evaluate(off=>{const q=QUESTION_BY_ID.get(round.questionIds[round.index]);setYear(Math.max(GLOBAL_MIN_YEAR,Math.min(GLOBAL_MAX_YEAR,q.year+off)));commitAnswer(false)},offset)}

test('mobile prioriza pregunta, año y timer sin overflow horizontal',async({page})=>{
  await boot(page,{width:390,height:844});const m=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,visibleMeta:[...document.querySelectorAll('.atlas-header-meta span')].filter(el=>getComputedStyle(el).display!=='none').length,core:document.querySelector('.atlas-core')?.getBoundingClientRect().width||0}));
  expect(m.scroll).toBeLessThanOrEqual(m.client+1);expect(m.visibleMeta).toBe(2);expect(m.core).toBeLessThanOrEqual(130);await expect(page.locator('#qaTimerShell')).toBeVisible();await expect(page.locator('#yearInput')).toBeVisible();await expect(page.locator('#primaryAction')).toContainText('Confirmar');
});

test('feedback mantiene divulgación progresiva con menos chrome',async({page})=>{
  await boot(page);await answerCurrent(page,1);await expect(page.locator('.v13-feedback-sequence')).toBeHidden();await expect(page.locator('[data-v13-action="context-toggle"]')).toBeHidden();await expect(page.locator('[data-v15-action="context-toggle"]')).toBeHidden();
  await expect(page.locator('.v16-learning-card')).toBeVisible();const toggle=page.locator('[data-v16-action="context-toggle"]');await expect(toggle).toBeVisible();await expect(page.locator('.atlas-document')).toBeHidden();await toggle.click();await expect(page.locator('.atlas-document')).toBeVisible();await expect(page.locator('.atlas-document-copy')).toContainText('CONTEXTO');await expect(toggle).toHaveAttribute('aria-expanded','true');
});

test('v1.8 no fabrica láminas ni exige una cuota de imágenes',async({page})=>{
  await boot(page,{start:false});
  const result=await page.evaluate(()=>({
    generated:QUESTIONS.filter(q=>q.v12GeneratedImage||q.v14GeneratedFallback||String(q.image||'').startsWith('data:image/svg+xml')).length,
    explicitImages:QUESTIONS.filter(q=>q.image).length,
    documentary:QUESTIONS.filter(q=>q.image&&q.imageType==='documentary').length,
    coverageGenerated:QA_V12_COVERAGE.generatedImages
  }));
  expect(result.generated).toBe(0);expect(result.coverageGenerated).toBe(0);expect(result.explicitImages).toBeLessThanOrEqual(45);expect(result.documentary).toBeLessThanOrEqual(result.explicitImages);
});

test('colección incorpora sets jugables',async({page})=>{
  await boot(page,{start:false});await page.evaluate(()=>showView('coleccion',{focus:false}));await page.locator('[data-v13-action="collection-sets"]').click();await expect(page.locator('.v13-collection-sets')).toBeVisible();await expect(page.locator('.v13-set-card')).toHaveCount(6);await expect(page.locator('.v13-set-intro')).toContainText('La colección también se juega');
});

test('Learning Gain compara la misma fecha entre días distintos',async({page})=>{
  await boot(page,{start:false});const gain=await page.evaluate(()=>{const q=QUESTIONS[0],s=defaultState();s.practiceSessions=[{date:'2026-09-01',answers:[{id:q.id,error:18,skipped:false}]},{date:'2026-09-08',answers:[{id:q.id,error:6,skipped:false}]},{date:'2026-09-08',answers:[{id:q.id,error:4,skipped:false}]}];return __QA_V13__.learningGain(s)});expect(gain.pairs).toBe(1);expect(gain.mean).toBe(14);expect(gain.improvedRate).toBe(1);
});

test('Repaso muestra una recomendación de siguiente sesión',async({page})=>{
  await boot(page,{start:false});await page.evaluate(()=>showView('repaso',{focus:false}));await expect(page.locator('.v13-learning-panel')).toBeVisible();await expect(page.locator('[data-v13-action="smart-review"]')).toBeVisible();await expect(page.locator('.v13-learning-panel')).toContainText('SIGUIENTE SESIÓN');
});
