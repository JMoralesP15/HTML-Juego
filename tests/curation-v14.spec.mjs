import {test,expect} from '@playwright/test';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url=pathToFileURL(path.join(root,'index.html')).href+'#main';

async function boot(page,{width=390,height=844,start=true}={}){
  await page.addInitScript(()=>{window.__QUE_ANO_DISABLE_ANALYTICS__=true});
  await page.setViewportSize({width,height});
  await page.goto(url);
  await page.waitForFunction(()=>typeof __QA_V14__==='object'&&typeof __QA_V14_CURATION__==='object'&&typeof __QA_V15__==='object');
  await page.evaluate(start=>{const s=defaultState();s.onboardingSeen=true;setState(s);round=null;lastSummary=null;const d=document.getElementById('detailDialog');if(d?.open)d.close();showView('hoy',{focus:false});if(start)startDaily()},start);
}

async function answer(page,offset=1){await page.evaluate(off=>{const q=QUESTION_BY_ID.get(round.questionIds[round.index]);setYear(q.year+off);commitAnswer(false)},offset)}

test('las 300 fechas reciben score y nivel de cultura general',async({page})=>{
  await boot(page,{start:false});
  const result=await page.evaluate(()=>({total:QUESTIONS.length,invalid:QUESTIONS.filter(q=>!['core','context','niche'].includes(q.cultureTier)||!Number.isFinite(q.cultureScore)||q.cultureScore<0||q.cultureScore>100).length,context:QUESTIONS.filter(q=>!q.v14Context?.remember||!q.v14Context?.connection).length,images:QUESTIONS.filter(q=>!q.image).length,summary:__QA_V14_CURATION__.summary}));
  expect(result.total).toBe(300);expect(result.invalid).toBe(0);expect(result.context).toBe(0);expect(result.images).toBe(0);expect(Object.values(result.summary.tiers).reduce((a,b)=>a+b,0)).toBe(300);
});

test('ambiente generativo sigue apagado por defecto y se controla desde Ajustes',async({page})=>{
  await boot(page,{start:false});await expect(page.locator('#ambientToggle')).toBeHidden();await page.locator('#settingsButton').click();
  const button=page.locator('#v15AmbientSetting');await expect(button).toHaveAttribute('aria-pressed','false');await button.click();await expect(button).toHaveAttribute('aria-pressed','true');await button.click();await expect(button).toHaveAttribute('aria-pressed','false');
});

test('feedback móvil no desborda y conserva clasificación editorial sin mostrarla como ruido',async({page})=>{
  await boot(page,{width:375,height:667});await answer(page);
  await expect(page.locator('.v14-culture-badge')).toBeHidden();
  const m=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));expect(m.scroll).toBeLessThanOrEqual(m.client+1);
  const toggle=page.locator('[data-v15-action="context-toggle"]');await toggle.click();await expect(page.locator('.v13-context-extra')).toContainText('DATO PARA RECORDAR');await expect(page.locator('.v13-context-extra')).toContainText('CONEXIÓN');
});

test('Commons sólo acepta licencias abiertas con atribución visible',async({page})=>{
  await boot(page,{width:390,height:844,start:false});
  const q=await page.evaluate(()=>{const x=QUESTIONS.find(q=>q.v12GeneratedImage||q.v14GeneratedFallback);round=createRound('practice',[x]);currentView='repaso';renderGame();return {id:x.id,title:x.title}});
  await page.route('https://commons.wikimedia.org/w/api.php*',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({query:{pages:{1:{title:`File:${q.title}.jpg`,imageinfo:[{thumburl:'https://upload.wikimedia.org/mock-open-image.jpg',url:'https://upload.wikimedia.org/mock-open-image.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'},Artist:{value:'Archivo QA'},ImageDescription:{value:`Documento relacionado con ${q.title}`}}}]}}}})}));
  await page.route('https://upload.wikimedia.org/mock-open-image.jpg',async route=>route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#333"/></svg>'}));
  await answer(page);await page.locator('[data-v15-action="context-toggle"]').click();await expect(page.locator('.v14-open-media-credit')).toBeVisible({timeout:7000});await expect(page.locator('.v14-open-media-credit')).toContainText('CC BY 4.0');await expect(page.locator('.v14-open-media-credit a')).toHaveAttribute('href',/commons\.wikimedia\.org/);
  const licenseCheck=await page.evaluate(()=>({ok:__QA_V14__.licenseAllowed('CC BY-SA 4.0'),bad:__QA_V14__.licenseAllowed('CC BY-NC 4.0')}));expect(licenseCheck.ok).toBe(true);expect(licenseCheck.bad).toBe(false);
});

test('fallo de red conserva el fallback documental offline',async({page})=>{
  await boot(page,{start:false});await page.route('https://commons.wikimedia.org/w/api.php*',route=>route.abort());
  await page.evaluate(()=>{const q=QUESTIONS.find(x=>x.v12GeneratedImage||x.v14GeneratedFallback);round=createRound('practice',[q]);currentView='repaso';renderGame();setYear(q.year+2);commitAnswer(false)});
  const before=await page.locator('.atlas-document-image img').getAttribute('src');expect(before).toBeTruthy();await page.waitForTimeout(900);const after=await page.locator('.atlas-document-image img').getAttribute('src');expect(after).toBe(before);
});
