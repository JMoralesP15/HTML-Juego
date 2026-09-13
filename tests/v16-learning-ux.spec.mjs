import {test,expect} from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';


async function openAdditionalContent(page){
  const toggle=page.locator('[data-v16-action="context-toggle"]');
  if(await toggle.isVisible()){
    await expect(page.locator('.atlas-document')).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
  }else{
    await expect(toggle).toBeHidden();
    await expect(page.locator('.atlas-document-copy > section')).toHaveCount(0);
  }
  await expect(page.locator('.atlas-document')).toBeVisible();
  await expect(page.locator('.atlas-document-copy')).not.toContainText(/La fecha concreta registrada|La misma ficha|Referencia heredada|pendiente de revisión editorial/i);
}

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url=pathToFileURL(path.join(root,'index.html')).href+'#main';
const shotDir=path.join(root,'test-results','screenshots');

async function boot(page,{width=1366,height=768,start=true}={}){
  await page.addInitScript(()=>{window.__QUE_ANO_DISABLE_ANALYTICS__=true});
  await page.setViewportSize({width,height});
  await page.goto(url);
  await page.waitForFunction(()=>typeof __QA_V16__==='object');
  await page.evaluate(start=>{const s=defaultState();s.onboardingSeen=true;setState(s);round=null;lastSummary=null;const d=document.getElementById('detailDialog');if(d?.open)d.close();showView('hoy',{focus:false});if(start)startDaily()},start);
}

async function answer(page){await page.locator('#primaryAction').click();await expect(page.locator('.atlas-v12.is-answered')).toBeVisible()}

async function finishCurrentRound(page){
  await page.evaluate(()=>{let step=0;const errors=[18,3,0,12,1];while(round){if(round.phase==='question'){const q=QUESTION_BY_ID.get(round.questionIds[round.index]),error=errors[Math.min(step,errors.length-1)];let guess=q.year+error;if(guess>GLOBAL_MAX_YEAR)guess=q.year-error;if(guess<GLOBAL_MIN_YEAR)guess=q.year;setYear(guess);commitAnswer(false)}if(round?.phase==='answer'){step++;nextQuestion()}}});
  await expect(page.locator('.summary-v11')).toBeVisible();
}

test('feedback enseña el hito con narrativa natural antes de ubicarlo en el atlas',async({page})=>{
  await boot(page);await answer(page);
  const card=page.locator('.v16-learning-card');await expect(card).toBeVisible();
  await expect(card).not.toContainText('Qué fue');
  await expect(card).not.toContainText('Por qué importa');
  await expect(card).not.toContainText('Dato para recordar');
  await expect(card).not.toContainText('La fecha es el punto de entrada');
  const paragraphs=await card.locator('.v16-learning-narrative').count();expect(paragraphs).toBeGreaterThanOrEqual(1);expect(paragraphs).toBeLessThanOrEqual(2);
  await expect(page.locator('.v16-context-button')).toHaveText('Profundizar');
  await expect(page.locator('.atlas-document-copy > section')).toHaveCount(0);
  await expect(page.locator('.v16-temporal-secondary')).toBeHidden();
});

test('Profundizar abre contexto sin mostrar estados editoriales internos',async({page})=>{
  await boot(page);await page.evaluate(()=>{const original=qaExtendedContext;qaExtendedContext=q=>({...original(q),locate:'Este proceso histórico conecta transformaciones sociales de varias generaciones.'})});await answer(page);const b=page.locator('.v16-context-button');await b.click();
  await expect(b).toHaveAttribute('aria-expanded','true');await expect(page.locator('.atlas-document.v16-context')).toBeVisible();
  await expect(page.locator('.atlas-document.v16-context')).not.toContainText('Referencia heredada');
  await expect(page.locator('.atlas-document.v16-context')).not.toContainText('pendiente de revisión editorial');
});

test('dificultad se aclara sin añadir chrome visible',async({page})=>{
  await boot(page);const d=page.locator('.atlas-header-meta span').nth(1);await expect(d).toBeVisible();await expect(d).toHaveAttribute('title','Dificultad editorial estimada. No modifica el puntaje.');
});

test('resumen final convierte la partida real en cinco aprendizajes y una recomendación',async({page})=>{
  await boot(page);await finishCurrentRound(page);
  await expect(page.locator('.summary-v11')).toContainText('Archivo de hoy completo');
  await expect(page.locator('.v16-learned-item')).toHaveCount(5);await expect(page.locator('.v16-review-next')).toBeVisible();
  await expect(page.locator('.v16-review-actions .summary-primary')).toBeVisible();
});

for(const [width,height] of [[375,667],[390,844]]){
  test(`móvil ${width}x${height}: navegación global no compite durante juego y resultado`,async({page})=>{
    await boot(page,{width,height});await expect(page.locator('.main-nav')).toBeHidden();await answer(page);await expect(page.locator('.main-nav')).toBeHidden();
    const m=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));expect(m.scroll).toBeLessThanOrEqual(m.client+1);
  });
}

test('ficha de detalle limpia la atribución genérica y estados internos',async({page})=>{
  await boot(page,{start:false});await page.evaluate(()=>{const s=getState();s.questionStats.walkman={attempts:1,scoredAttempts:1,totalError:2,avgError:2,bestError:2,lastError:2,intervalDays:1,dueDay:null,lastReviewedDate:dateKey(),successDates:[],lastSkipped:false};setState(s);openDetail('walkman')});
  await expect(page.locator('#detailDialog')).toBeVisible();await expect(page.locator('#detailDialog')).not.toContainText('referencia general');await expect(page.locator('#detailDialog')).not.toContainText('Referencia heredada');
  await expect(page.locator('#detailDialog')).toContainText('Contexto');
});

test('capturas v1.6: resultado, contexto y resumen en desktop y móvil',async({page})=>{
  fs.mkdirSync(shotDir,{recursive:true});
  await boot(page,{width:1366,height:768});await answer(page);await page.screenshot({path:path.join(shotDir,'v16-desktop-feedback.png'),fullPage:true});
  await openAdditionalContent(page);await page.screenshot({path:path.join(shotDir,'v16-desktop-context.png'),fullPage:true});
  await finishCurrentRound(page);await page.screenshot({path:path.join(shotDir,'v16-desktop-summary.png'),fullPage:true});

  await boot(page,{width:390,height:844});await answer(page);await page.screenshot({path:path.join(shotDir,'v16-mobile-feedback-390x844.png'),fullPage:true});
  await openAdditionalContent(page);await page.screenshot({path:path.join(shotDir,'v16-mobile-context-390x844.png'),fullPage:true});
  await finishCurrentRound(page);await page.screenshot({path:path.join(shotDir,'v16-mobile-summary-390x844.png'),fullPage:true});
});

test('integridad histórica sigue congelada en 300 hitos',async({page})=>{
  await boot(page,{start:false});const r=await page.evaluate(()=>({total:QUESTIONS.length,ids:new Set(QUESTIONS.map(q=>q.id)).size,badYears:QUESTIONS.filter(q=>!Number.isInteger(q.year)).length,calendar:typeof auditCalendar==='function'?auditCalendar():null}));
  expect(r.total).toBe(300);expect(r.ids).toBe(300);expect(r.badYears).toBe(0);if(r.calendar)expect(r.calendar.mismatches).toEqual([]);
});
