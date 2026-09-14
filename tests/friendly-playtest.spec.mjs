import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const url=pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../index.html')).href;
test('opening and reading never start the clock; explicit keyboard action does',async({page})=>{
  await page.goto(url);await expect(page.getByText('Lee la pregunta con calma.')).toBeVisible();
  await page.getByRole('button',{name:'Comenzar →',exact:true}).click();
  await page.waitForTimeout(5100);expect(await page.evaluate(()=>round.answers.length)).toBe(0);
  expect(await page.evaluate(()=>qaTimer.interval)).toBeNull();
  await page.evaluate(()=>commitAnswer());expect(await page.evaluate(()=>round.answers.length)).toBe(0);
  await page.reload();await expect(page.getByRole('button',{name:'Continuar mi partida →'})).toBeVisible();
  expect(await page.evaluate(()=>qaTimer.interval)).toBeNull();
  await page.getByRole('button',{name:'Continuar mi partida →'}).click();
  await page.getByRole('button',{name:'Estoy listo →'}).press('Enter');
  await expect(page.locator('#qaTimerSeconds')).toHaveText('15');await page.waitForTimeout(1100);
  expect(await page.evaluate(()=>qaTimerSnapshot().remainingMs)).toBeLessThan(14500);
});
for(const width of [375,390,1366])test(`readable timer, question and source links at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});await page.goto(url);
  await page.getByRole('button',{name:'Comenzar →',exact:true}).click();await page.getByRole('button',{name:'Estoy listo →'}).click();
  await expect(page.locator('#qaTimerSeconds')).toBeVisible();
  const boxes=await page.evaluate(()=>{const a=document.querySelector('#qaTimerShell').getBoundingClientRect(),b=document.querySelector('#yearInput').getBoundingClientRect();return{overlap:a.bottom>b.top&&a.top<b.bottom&&a.right>b.left&&a.left<b.right,overflow:document.documentElement.scrollWidth>innerWidth+1,prompt:parseFloat(getComputedStyle(document.querySelector('#questionTitle')).fontSize),title:parseFloat(getComputedStyle(document.querySelector('.friendly-topic')).fontSize)}});
  expect(boxes.overlap).toBe(false);expect(boxes.overflow).toBe(false);expect(boxes.prompt).toBeGreaterThan(boxes.title);
  await page.screenshot({path:`test-results/screenshots/friendly-question-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'No lo sé',exact:true}).click();
  await page.getByText('Créditos y procedencia',{exact:true}).click();
  await expect(page.getByRole('link',{name:'Abrir fuente de la imagen ↗'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Abrir fuente de la imagen ↗'})).toHaveAttribute('href',/^https:\/\//);
  await page.getByText('Aprender más',{exact:true}).click();
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();expect(result.violations).toEqual([]);
  await page.screenshot({path:`test-results/screenshots/friendly-reveal-${width}.png`,fullPage:true});
});
test('session ends with five learned events and no speed bonus',async({page})=>{
  await page.goto(url);await page.getByRole('button',{name:'Comenzar →',exact:true}).click();
  for(let i=0;i<5;i++){await page.getByRole('button',{name:'Estoy listo →'}).click();await page.evaluate(()=>{setYear(QUESTION_BY_ID.get(round.questionIds[round.index]).year);commitAnswer()});await page.locator('#primaryAction').click()}
  await expect(page.getByRole('heading',{name:'Hoy aprendiste'})).toBeVisible();await expect(page.locator('.friendly-summary li')).toHaveCount(5);
  expect(await page.evaluate(()=>getState().sessions.at(-1).answers.every(a=>a.timeBonus===0))).toBe(true);
});

