import {test,expect} from '@playwright/test';
import path from 'node:path';
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
const url=pathToFileURL(path.join(root,'index.html')).href+'?edition=full#main';

async function boot(page,{width=390,height=844,start=true}={}){
  await page.addInitScript(()=>{window.__QUE_ANO_DISABLE_ANALYTICS__=true});
  await page.setViewportSize({width,height});
  await page.goto(url);
  await page.waitForFunction(()=>typeof __QA_V14__==='object'&&typeof __QA_V14_CURATION__==='object'&&typeof __QA_V15__==='object'&&typeof __QA_V16__==='object');
  await page.evaluate(start=>{const s=defaultState();s.onboardingSeen=true;setState(s);round=null;lastSummary=null;const d=document.getElementById('detailDialog');if(d?.open)d.close();showView('hoy',{focus:false});if(start)startDaily()},start);
}

async function answer(page,offset=1){await page.evaluate(off=>{const q=QUESTION_BY_ID.get(round.questionIds[round.index]);setYear(q.year+off);commitAnswer(false)},offset)}

test('las 300 fechas conservan clasificación cultural sin generar relleno editorial',async({page})=>{
  await boot(page,{start:false});
  const result=await page.evaluate(()=>({total:QUESTIONS.length,invalid:QUESTIONS.filter(q=>!['core','context','niche'].includes(q.cultureTier)||!Number.isFinite(q.cultureScore)||q.cultureScore<0||q.cultureScore>100).length,images:QUESTIONS.filter(q=>q.image).length,generated:QUESTIONS.filter(q=>q.v12GeneratedImage||q.v14GeneratedFallback||String(q.image||'').startsWith('data:image/svg+xml')).length,summary:__QA_V14_CURATION__.summary}));
  expect(result.total).toBe(300);expect(result.invalid).toBe(0);expect(result.generated).toBe(0);expect(result.images).toBeLessThanOrEqual(45);expect(result.summary.coverage.generatedImageFallbacks).toBe(0);expect(result.summary.coverage.generatedContextFallbacks).toBe(0);expect(Object.values(result.summary.tiers).reduce((a,b)=>a+b,0)).toBe(300);
});

test('ambiente generativo sigue apagado por defecto y se controla desde Ajustes',async({page})=>{
  await boot(page,{start:false});await expect(page.locator('#ambientToggle')).toBeHidden();await page.locator('#settingsButton').click();
  const button=page.locator('#v15AmbientSetting');await expect(button).toHaveAttribute('aria-pressed','false');await button.click();await expect(button).toHaveAttribute('aria-pressed','true');await button.click();await expect(button).toHaveAttribute('aria-pressed','false');
});

test('feedback móvil no desborda y conserva curaduría sin exponer metadata editorial',async({page})=>{
  await boot(page,{width:375,height:667});await answer(page);
  await expect(page.locator('.v14-culture-badge')).toBeHidden();await expect(page.locator('.v16-learning-card')).toBeVisible();
  const m=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));expect(m.scroll).toBeLessThanOrEqual(m.client+1);
  await openAdditionalContent(page);await expect(page.locator('.atlas-document')).toBeVisible();await expect(page.locator('.atlas-document-copy')).not.toContainText(/Nivel editorial|Referencia heredada|pendiente de revisión editorial/i);
});

test('Commons sólo acepta licencias abiertas con atribución visible',async({page})=>{
  await boot(page,{width:390,height:844,start:false});
  const q=await page.evaluate(()=>{const x=QUESTIONS.find(q=>!q.image||q.imageType!=='documentary')||QUESTIONS[0];round=createRound('practice',[x]);currentView='repaso';renderGame();return {id:x.id,title:x.title}});
  await page.route('https://commons.wikimedia.org/w/api.php*',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({query:{pages:{1:{title:`File:${q.title}.jpg`,imageinfo:[{thumburl:'https://upload.wikimedia.org/mock-open-image.jpg',url:'https://upload.wikimedia.org/mock-open-image.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'},Artist:{value:'Archivo QA'},ImageDescription:{value:`Documento relacionado con ${q.title}`}}}]}}}})}));
  await page.route('https://upload.wikimedia.org/mock-open-image.jpg',async route=>route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#333"/></svg>'}));
  await answer(page);await openAdditionalContent(page);await expect(page.locator('.v14-open-media-credit')).toBeVisible({timeout:7000});await expect(page.locator('.v14-open-media-credit')).toContainText('CC BY 4.0');await expect(page.locator('.v14-open-media-credit a')).toHaveAttribute('href',/commons\.wikimedia\.org/);
  const licenseCheck=await page.evaluate(()=>({ok:__QA_V14__.licenseAllowed('CC BY-SA 4.0'),bad:__QA_V14__.licenseAllowed('CC BY-NC 4.0')}));expect(licenseCheck.ok).toBe(true);expect(licenseCheck.bad).toBe(false);
});

test('media curada v1.8 conserva precedencia aunque Commons responda tarde',async({page})=>{
  await boot(page,{start:false});
  const setup=await page.evaluate(()=>{
    const q=QUESTIONS.find(x=>x.v18Media?.src);if(!q)return null;
    q.__v184SavedMedia=JSON.parse(JSON.stringify(q.v18Media));
    q.__v184SavedImageType=q.imageType;
    q.__v184SavedImageSource=q.imageSource;
    const media=q.__v184SavedMedia;
    q.v18Media=null;q.imageType='';q.imageSource='';
    round=createRound('practice',[q]);currentView='repaso';renderGame();
    return {id:q.id,title:q.title,curatedSrc:media.src};
  });
  expect(setup).toBeTruthy();
  await page.route('https://commons.wikimedia.org/w/api.php*',async route=>{
    await new Promise(resolve=>setTimeout(resolve,500));
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({query:{pages:{1:{title:`File:${setup.title}.jpg`,imageinfo:[{thumburl:'https://upload.wikimedia.org/late-open-image.jpg',url:'https://upload.wikimedia.org/late-open-image.jpg',extmetadata:{LicenseShortName:{value:'CC BY 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by/4.0/'},Artist:{value:'Commons tardío'},ImageDescription:{value:`Documento tardío relacionado con ${setup.title}`}}}]}}}})});
  });
  await page.route('https://upload.wikimedia.org/late-open-image.jpg',async route=>route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#555"/></svg>'}));
  const commonsRequest=page.waitForRequest(req=>req.url().startsWith('https://commons.wikimedia.org/w/api.php'));
  await answer(page);
  await commonsRequest;
  await page.evaluate(id=>{const q=QUESTION_BY_ID.get(id);q.v18Media=q.__v184SavedMedia;q.imageType=q.__v184SavedImageType||'documentary';q.imageSource=q.__v184SavedImageSource||q.v18Media?.sourcePage||'';__QA_V18_MEDIA__.install()},setup.id);
  await openAdditionalContent(page);
  const curated=page.locator('.atlas-document-image[data-v18="1"]');await expect(curated).toBeVisible();
  await page.waitForTimeout(800);
  await expect(curated).toBeVisible();await expect(curated.locator('img')).toHaveAttribute('src',setup.curatedSrc);await expect(curated.locator('figcaption')).toContainText('CURADA v1.8');
  await expect(page.locator('img[src="https://upload.wikimedia.org/late-open-image.jpg"]')).toHaveCount(0);
});

test('fallo de red conserva aprendizaje textual sin fabricar una placa decorativa',async({page})=>{
  await boot(page,{start:false});await page.route('https://commons.wikimedia.org/w/api.php*',route=>route.abort());
  await page.evaluate(()=>{const q=QUESTIONS.find(x=>!x.image)||QUESTIONS[0];round=createRound('practice',[q]);currentView='repaso';renderGame();setYear(q.year+2);commitAnswer(false)});
  await page.waitForTimeout(900);await expect(page.locator('.v16-learning-card')).toBeVisible();await openAdditionalContent(page);await expect(page.locator('.atlas-document-copy')).toBeVisible();await expect(page.locator('.atlas-document-image')).toHaveCount(0);
});

