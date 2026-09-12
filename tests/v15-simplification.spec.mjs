import {test,expect} from '@playwright/test';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url=pathToFileURL(path.join(root,'index.html')).href+'#main';

async function boot(page,{width=1366,height=768,start=true}={}){
  await page.addInitScript(()=>{window.__QUE_ANO_DISABLE_ANALYTICS__=true});
  await page.setViewportSize({width,height});
  await page.goto(url);
  await page.waitForFunction(()=>typeof __QA_V15__==='object'&&typeof __QA_V16__==='object');
  await page.evaluate(start=>{const s=defaultState();s.onboardingSeen=true;setState(s);round=null;lastSummary=null;const d=document.getElementById('detailDialog');if(d?.open)d.close();showView('hoy',{focus:false});if(start)startDaily()},start);
}

async function expectCTAInViewport(page){
  const cta=page.locator('.atlas-v12.is-question #primaryAction');await expect(cta).toBeVisible();
  const box=await cta.boundingBox();const vp=page.viewportSize();expect(box).toBeTruthy();expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(vp.height+1);expect(box.x+box.width).toBeLessThanOrEqual(vp.width+1);
}

test('CTA Confirmar queda visible en desktop y muestra el año',async({page})=>{
  await boot(page,{width:1366,height:768});await expectCTAInViewport(page);
  const value=await page.locator('#yearInput').inputValue();await expect(page.locator('#primaryAction')).toContainText(`Confirmar ${value}`);
});

for(const [width,height] of [[375,667],[390,844],[412,915]]){
  test(`pregunta móvil ${width}x${height}: CTA visible y sin overflow`,async({page})=>{
    await boot(page,{width,height});await expectCTAInViewport(page);
    const m=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));expect(m.scroll).toBeLessThanOrEqual(m.client+1);
    await expect(page.locator('.atlas-header-session .v15-progress-text')).toHaveText('1 / 5');
  });
}

test('timer usa deadline: el tiempo sigue corriendo aunque se detenga el repaint',async({page})=>{
  await boot(page);
  const before=await page.evaluate(()=>__QA_V15__.remaining());
  await page.evaluate(()=>qaTimerPause());
  await page.waitForTimeout(650);
  const hiddenElapsed=await page.evaluate(()=>__QA_V15__.remaining());
  expect(before-hiddenElapsed).toBeGreaterThan(450);
  await page.evaluate(()=>qaTimerResume());
});

test('al regresar después del deadline se registra timeout',async({page})=>{
  await boot(page);
  await page.evaluate(()=>{qaTimer.deadline=Date.now()-1;qaTimerPause();qaTimerResume()});
  await page.waitForFunction(()=>round?.phase==='answer');
  const a=await page.evaluate(()=>round.answers[round.index]);expect(a.timedOut).toBe(true);
});

test('Enter confirma la estimación y abre feedback de aprendizaje',async({page})=>{
  await boot(page);const input=page.locator('#yearInput');await input.focus();await input.press('Enter');
  await expect(page.locator('.v15-result-hero')).toBeVisible();await expect(page.locator('.v16-learning-card')).toBeVisible();await expect(page.locator('.v15-essential')).toBeHidden();await expect(page.locator('.v13-feedback-sequence')).toBeHidden();
});

test('No lo sé sigue funcionando',async({page})=>{
  await boot(page);await page.locator('[data-action="skip"]').click();await expect(page.locator('.v15-result-hero')).toBeVisible();
  const skipped=await page.evaluate(()=>round.answers[round.index].skipped);expect(skipped).toBe(true);
});

test('contexto rico queda bajo demanda',async({page})=>{
  await boot(page);await page.locator('#primaryAction').click();
  const button=page.locator('[data-v16-action="context-toggle"]');await expect(button).toBeVisible();await expect(button).toHaveAttribute('aria-expanded','false');await expect(page.locator('.atlas-document')).toBeHidden();
  await button.click();await expect(button).toHaveAttribute('aria-expanded','true');await expect(page.locator('.atlas-document')).toBeVisible();await expect(page.locator('.atlas-document-copy')).not.toContainText(/Referencia heredada|pendiente de revisión editorial/i);
});

test('la pantalla normal oculta metadata editorial interna',async({page})=>{
  await boot(page);await expect(page.locator('.atlas-header-meta span')).toHaveCount(3);await expect(page.locator('.atlas-header-meta span').nth(2)).toBeHidden();
  await page.locator('#primaryAction').click();await expect(page.locator('.v14-culture-badge')).toBeHidden();
});

test('Ajustes conserva acceso al ambiente musical',async({page})=>{
  await boot(page,{start:false});await page.locator('#settingsButton').click();const b=page.locator('#v15AmbientSetting');await expect(b).toBeVisible();await expect(b).toHaveAttribute('aria-pressed','false');
});

test('integridad histórica permanece congelada',async({page})=>{
  await boot(page,{start:false});const r=await page.evaluate(()=>({total:QUESTIONS.length,ids:new Set(QUESTIONS.map(q=>q.id)).size,badYears:QUESTIONS.filter(q=>!Number.isInteger(q.year)).length,audit:auditQuestionBank(),calendar:typeof auditCalendar==='function'?auditCalendar():null}));
  expect(r.total).toBe(300);expect(r.ids).toBe(300);expect(r.badYears).toBe(0);expect(r.audit.issues.duplicateIds).toEqual([]);expect(r.audit.issues.yearRange).toEqual([]);
});
