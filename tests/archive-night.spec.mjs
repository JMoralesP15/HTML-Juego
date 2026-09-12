import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'index.html')).href + '#main';
const desktop={width:1440,height:900}, shortDesktop={width:1366,height:768}, mobile={width:390,height:844};

async function boot(page,size=desktop){
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize(size);
  await page.goto(url);
  await page.waitForFunction(()=>typeof startDaily==='function'&&typeof defaultState==='function');
  await page.evaluate(()=>{const s=defaultState();s.onboardingSeen=true;setState(s);if(document.getElementById('detailDialog')?.open)document.getElementById('detailDialog').close();round=null;lastSummary=null;showView('hoy',{focus:false});startDaily();});
  return errors;
}

async function forceOffset(page,offset){
  await page.evaluate(off=>{
    const candidate=QUESTIONS.find(q=>q.year+off>=GLOBAL_MIN_YEAR&&q.year+off<=GLOBAL_MAX_YEAR);
    if(!candidate)throw new Error(`No candidate for offset ${off}`);
    round.questionIds[round.index]=candidate.id;
    setYear(candidate.year+off);
    commitAnswer();
  },offset);
}

function intersects(a,b){return !(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y)}

for(const [name,size] of [['1440x900',desktop],['1366x768',shortDesktop],['390x844',mobile]]){
  test(`Archivo nocturno pregunta ${name} sin solapamientos`,async({page})=>{
    const errors=await boot(page,size);
    await expect(page.locator('.archive-question-layout')).toBeVisible();
    await expect(page.locator('#yearInput')).toBeVisible();
    await expect(page.locator('.archive-progress')).toBeVisible();
    if(size.width>900){
      const editorial=await page.locator('.archive-editorial').boundingBox();
      const estimator=await page.locator('.archive-estimator').boundingBox();
      expect(editorial&&estimator&&!intersects(editorial,estimator)).toBeTruthy();
      const title=await page.locator('.archive-editorial h1').boundingBox();
      const instrument=await page.locator('.year-instrument').boundingBox();
      expect(title&&instrument&&!intersects(title,instrument)).toBeTruthy();
    }
    const metrics=await page.evaluate(()=>({docW:document.documentElement.scrollWidth,clientW:document.documentElement.clientWidth,primary:document.querySelectorAll('.game .primary').length}));
    expect(metrics.docW).toBeLessThanOrEqual(metrics.clientW+1);
    expect(metrics.primary).toBe(1);
    expect(errors).toEqual([]);
    await page.screenshot({path:`test-results/screenshots/archive-pregunta-${name}.png`,fullPage:true});
  });
}

test('Instrumento temporal soporta teclado ±1 y ±10',async({page})=>{
  await boot(page,desktop);
  const input=page.locator('#yearInput');
  await input.focus();
  const start=Number(await input.inputValue());
  await page.keyboard.press('ArrowRight');
  expect(Number(await input.inputValue())).toBe(Math.min(2026,start+1));
  await page.keyboard.press('Shift+ArrowRight');
  expect(Number(await input.inputValue())).toBe(Math.min(2026,start+11));
  await page.keyboard.press('ArrowLeft');
  expect(Number(await input.inputValue())).toBe(Math.max(1950,Math.min(2026,start+10)));
});

test('Feedback conserva clases perceptivas 5, 20 y 40 años',async({page})=>{
  await boot(page,desktop);await forceOffset(page,5);await expect(page.locator('.scale-close')).toBeVisible();
  await page.screenshot({path:'test-results/screenshots/archive-feedback-5-1440x900.png',fullPage:true});
  await boot(page,desktop);await forceOffset(page,20);await expect(page.locator('.scale-medium')).toBeVisible();
  await page.screenshot({path:'test-results/screenshots/archive-feedback-20-1440x900.png',fullPage:true});
  await boot(page,desktop);await forceOffset(page,40);await expect(page.locator('.scale-wide')).toBeVisible();
  await page.screenshot({path:'test-results/screenshots/archive-feedback-40-1440x900.png',fullPage:true});
});

test('Feedback revelado es neutral y no punitivo',async({page})=>{
  await boot(page,desktop);await page.evaluate(()=>commitAnswer(true));
  await expect(page.locator('.reveal-scale')).toBeVisible();
  await expect(page.locator('body')).toContainText('Fecha revelada');
  await expect(page.locator('body')).toContainText('Queda para repasar');
  await expect(page.locator('body')).not.toContainText('fallaste');
  await page.screenshot({path:'test-results/screenshots/archive-feedback-revelada-1440x900.png',fullPage:true});
});

test('Targets principales cumplen 44 px',async({page})=>{
  await boot(page,mobile);
  for(const selector of ['[data-action="adjust"][data-step="-10"]','[data-action="adjust"][data-step="-1"]','[data-action="adjust"][data-step="1"]','[data-action="adjust"][data-step="10"]','#primaryAction','[data-action="skip"]']){
    const box=await page.locator(selector).boundingBox();
    expect(box?.height||0).toBeGreaterThanOrEqual(44);
    expect(box?.width||0).toBeGreaterThanOrEqual(44);
  }
});

test('Reduced motion del sistema reduce transiciones',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await boot(page,desktop);
  const durations=await page.locator('.archive-question-layout').evaluate(el=>({animation:getComputedStyle(el).animationDuration,transition:getComputedStyle(el).transitionDuration}));
  const first=v=>Number.parseFloat(String(v).split(',')[0])||0;
  expect(first(durations.animation)).toBeLessThanOrEqual(.001);
  expect(first(durations.transition)).toBeLessThanOrEqual(.001);
  await page.screenshot({path:'test-results/screenshots/archive-reduced-motion-1440x900.png',fullPage:true});
});

test('Resumen diario cierra la sesión sin CTA de loop infinito',async({page})=>{
  await boot(page,desktop);
  await page.evaluate(()=>{while(round){if(round.phase==='question'){const q=QUESTION_BY_ID.get(round.questionIds[round.index]);setYear(q.year);commitAnswer()}if(round?.phase==='answer')nextQuestion()}});
  await expect(page.locator('.archive-summary')).toBeVisible();
  await expect(page.locator('body')).toContainText('Archivo de hoy completo');
  await expect(page.locator('.summary-footer .primary')).toHaveCount(1);
  await expect(page.locator('.summary-footer')).not.toContainText('Juega otra');
  await page.screenshot({path:'test-results/screenshots/archive-resumen-1440x900.png',fullPage:true});
});
