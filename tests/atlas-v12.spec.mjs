import {test,expect} from '@playwright/test';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url=pathToFileURL(path.join(root,'index.html')).href+'#main';
const desktop={width:1440,height:900},mobile={width:390,height:844},smallMobile={width:375,height:667};

async function boot(page,size=desktop){
  const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize(size);await page.goto(url);await page.waitForFunction(()=>typeof startDaily==='function'&&typeof __QA_TIMER__==='object'&&typeof __QA_V15__==='object'&&typeof __QA_V16__==='object');
  await page.evaluate(()=>{const s=defaultState();s.onboardingSeen=true;setState(s);if(document.getElementById('detailDialog')?.open)document.getElementById('detailDialog').close();round=null;lastSummary=null;showView('hoy',{focus:false});startDaily()});return errors;
}
async function answerOffset(page,offset,remaining=10000){await page.evaluate(({offset,remaining})=>{const q=QUESTIONS.find(x=>x.year+offset>=GLOBAL_MIN_YEAR&&x.year+offset<=GLOBAL_MAX_YEAR);round.questionIds[round.index]=q.id;renderGame();setYear(q.year+offset);__QA_TIMER__.setRemaining(remaining);commitAnswer(false)}, {offset,remaining})}

test('timer parte en 15 segundos y decrece',async({page})=>{await boot(page);await expect(page.locator('#qaTimerSeconds')).toHaveText('15');const a=await page.evaluate(()=>__QA_TIMER__.snapshot().remainingMs);await page.waitForTimeout(350);const b=await page.evaluate(()=>__QA_TIMER__.snapshot().remainingMs);expect(b).toBeLessThan(a);expect(b).toBeGreaterThan(14000)});

test('timer se detiene al responder y guarda tiempo',async({page})=>{await boot(page);await page.evaluate(()=>{__QA_TIMER__.setRemaining(9000);const q=QUESTION_BY_ID.get(round.questionIds[round.index]);setYear(q.year);commitAnswer(false)});const a=await page.evaluate(()=>round.answers[0]);expect(a.remainingMs).toBeGreaterThan(8500);expect(a.elapsedMs).toBeGreaterThan(5500);expect(a.scoringVersion).toBe('timer-v1');await expect(page.locator('#qaTimerSeconds')).toHaveCount(0)});

test('visibility hidden detiene repaint pero no el tiempo real',async({page})=>{await boot(page);await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>window.__testVisibility||'visible'});window.__testVisibility='hidden';document.dispatchEvent(new Event('visibilitychange'))});const a=await page.evaluate(()=>__QA_TIMER__.snapshot().remainingMs);await page.waitForTimeout(350);const b=await page.evaluate(()=>__QA_TIMER__.snapshot().remainingMs);expect(a-b).toBeGreaterThan(250);await page.evaluate(()=>{window.__testVisibility='visible';document.dispatchEvent(new Event('visibilitychange'))});await page.waitForTimeout(250);const c=await page.evaluate(()=>__QA_TIMER__.snapshot().remainingMs);expect(c).toBeLessThan(b)});

test('timeout autoenvía la estimación de forma neutral',async({page})=>{await boot(page);await page.evaluate(()=>{qaTimer.deadline=Date.now()+30});await page.waitForTimeout(220);const a=await page.evaluate(()=>round.answers[0]);expect(a.timedOut).toBe(true);expect(a.remainingMs).toBe(0);expect(a.timeBonus).toBe(0);await expect(page.locator('.v15-result-note')).toContainText('Se agotó el tiempo');await expect(page.locator('.v15-result-note')).not.toContainText('fallaste')});

test('No lo sé cancela timer, puntaje y bonus',async({page})=>{await boot(page);await page.evaluate(()=>commitAnswer(true));const a=await page.evaluate(()=>round.answers[0]);expect(a.skipped).toBe(true);expect(a.points).toBe(0);expect(a.timeBonus).toBe(0);await expect(page.locator('.atlas-state-revealed')).toBeVisible();await expect(page.locator('.v15-result-hero')).toContainText(String(a.actual))});

test('bonus temporal respeta máximo de 30% y 300 puntos',async({page})=>{await boot(page);await page.evaluate(()=>{const q=QUESTION_BY_ID.get(round.questionIds[round.index]);setYear(q.year);__QA_TIMER__.setRemaining(7500);commitAnswer(false)});const a=await page.evaluate(()=>round.answers[0]);expect(a.basePoints).toBe(1000);expect(a.timeBonus).toBe(150);expect(a.points).toBe(1150)});

test('velocidad no supera una diferencia grande de precisión',async({page})=>{await boot(page);const values=await page.evaluate(()=>{const accurate=points(0)+qaTimeBonus(points(0),0),fastWrong=points(20)+qaTimeBonus(points(20),15000);return {accurate,fastWrong}});expect(values.accurate).toBeGreaterThan(values.fastWrong)});

test('estado EXACTA conserva semántica con presentación simplificada',async({page})=>{await boot(page);await answerOffset(page,0);await expect(page.locator('.atlas-state-exact')).toBeVisible();await expect(page.locator('.v15-result-distance')).toHaveText('Respuesta exacta');await expect(page.locator('.atlas-sigil.exact')).toBeHidden();await page.screenshot({path:'test-results/screenshots/v15-feedback-exacta-1440x900.png',fullPage:true})});

test('estado CERCA conserva semántica con presentación simplificada',async({page})=>{await boot(page);await answerOffset(page,1);await expect(page.locator('.atlas-state-near')).toBeVisible();await expect(page.locator('.v15-result-distance')).toContainText('1 año');await page.screenshot({path:'test-results/screenshots/v15-feedback-cerca-1440x900.png',fullPage:true})});

test('estado DESFASE conserva semántica con presentación simplificada',async({page})=>{await boot(page);await answerOffset(page,5);await expect(page.locator('.atlas-state-medium')).toBeVisible();await expect(page.locator('.v15-result-distance')).toContainText('5 años');await page.screenshot({path:'test-results/screenshots/v15-feedback-desfase-1440x900.png',fullPage:true})});

test('estado SALTO TEMPORAL conserva semántica con presentación simplificada',async({page})=>{await boot(page);await answerOffset(page,40);await expect(page.locator('.atlas-state-far')).toBeVisible();await expect(page.locator('.v15-result-distance')).toContainText('40 años');await page.screenshot({path:'test-results/screenshots/v15-feedback-salto-1440x900.png',fullPage:true})});

test('cobertura de imágenes y contexto supera 50%',async({page})=>{await boot(page);const coverage=await page.evaluate(()=>QA_V12_COVERAGE);expect(coverage.images).toBeGreaterThanOrEqual(150);expect(coverage.extendedContext).toBeGreaterThanOrEqual(150);expect(coverage.generatedImages).toBeGreaterThan(0)});

test('feedback conserva documento y contexto bajo demanda',async({page})=>{await boot(page);await answerOffset(page,0);await expect(page.locator('.atlas-document')).toBeHidden();const toggle=page.locator('[data-v16-action="context-toggle"]');await expect(toggle).toBeVisible();await toggle.click();await expect(page.locator('.atlas-document')).toBeVisible();await expect(page.locator('.atlas-document-copy')).toContainText('CONTEXTO');await expect(page.locator('.atlas-document-copy')).toContainText('UBICACIÓN TEMPORAL');await expect(page.locator('.atlas-document-copy')).not.toContainText('Referencia heredada');await page.screenshot({path:'test-results/screenshots/v16-contexto-ampliado.png',fullPage:true})});

test('historial legacy sigue siendo válido sin campos de tiempo',async({page})=>{await boot(page);const a=await page.evaluate(()=>normalizeAnswer({id:'jfk',guess:1963,actual:1963,skipped:false,assisted:false}));expect(a.elapsedMs).toBeNull();expect(a.remainingMs).toBeNull();expect(a.timeBonus).toBe(0);expect(a.points).toBe(1000)});

for(const [name,size] of [['1440x900',desktop],['390x844',mobile],['375x667',smallMobile]])test(`v1.6 no genera overflow horizontal ${name}`,async({page})=>{const errors=await boot(page,size);const metrics=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));expect(metrics.scroll).toBeLessThanOrEqual(metrics.client+1);expect(errors).toEqual([]);await page.screenshot({path:`test-results/screenshots/v16-pregunta-${name}.png`,fullPage:true})});

test('summary incorpora tiempo sin abrir un loop infinito',async({page})=>{await boot(page);await page.evaluate(()=>{while(round){if(round.phase==='question'){const q=QUESTION_BY_ID.get(round.questionIds[round.index]);__QA_TIMER__.setRemaining(8000);setYear(q.year);commitAnswer()}if(round?.phase==='answer')nextQuestion()}});await expect(page.locator('.atlas-summary')).toBeVisible();await expect(page.locator('.atlas-summary')).toContainText('tiempo medio');await expect(page.locator('.summary-v11 .summary-primary')).toHaveCount(1);await expect(page.locator('.summary-v11')).not.toContainText('Juega otra');await page.screenshot({path:'test-results/screenshots/v16-summary-1440x900.png',fullPage:true})});

test('reduced motion sigue anulando transiciones de la nueva identidad',async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});await boot(page);const duration=await page.locator('.atlas-year-instrument .year-step').first().evaluate(el=>getComputedStyle(el).transitionDuration);expect(Number.parseFloat(duration)||0).toBeLessThanOrEqual(.001)});
