import {test,expect} from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url=pathToFileURL(path.join(root,'review','index.html')).href;
const shotDir=path.join(root,'test-results','screenshots');

async function boot(page,{width=1440,height=1000}={}){
  await page.setViewportSize({width,height});
  await page.goto(url);
  await page.waitForFunction(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__?.version==='1.8.7-c');
}

test('consola v1.8.7-c carga 300 fichas y una sola experiencia de revisión',async({page})=>{
  await boot(page);
  await expect(page.locator('#metricReviewed')).toContainText('/ 300');
  await expect(page.locator('.queue-item')).toHaveCount(300);
  await expect(page.getByRole('heading',{name:/1 · Hecho y fuente/i})).toBeVisible();
  await expect(page.getByRole('heading',{name:/2 · Contenido textual/i})).toBeVisible();
  await expect(page.getByRole('heading',{name:/3 · Contenido visual/i})).toBeVisible();
  expect(await page.locator('script[src="review-v187b.js"]').count()).toBe(0);
  expect(await page.locator('script[src="review.js"]').count()).toBe(0);
});

test('feedback humano se traduce a 30 reemplazos, 2 reformulaciones y 118 textos genéricos',async({page})=>{
  await boot(page);
  const audit=await page.evaluate(()=>({
    doubtful:window.__QA_EDITORIAL_FEEDBACK_V187C__.factual.doubtful.length,
    reviewSource:window.__QA_EDITORIAL_FEEDBACK_V187C__.factual.review_source.length,
    generic:window.__QA_EDITORIAL_FEEDBACK_V187C__.text.generic.length,
    replacements:Object.keys(window.__QA_EDITORIAL_REPLACEMENTS_V187C__.items).length,
    replacementMin:Math.min(...Object.values(window.__QA_EDITORIAL_REPLACEMENTS_V187C__.items).map(x=>x.length)),
    reframes:Object.keys(window.__QA_EDITORIAL_REPLACEMENTS_V187C__.sourceReframes).length,
    refinements:Object.keys(window.__QA_EDITORIAL_TEXT_REFINEMENTS_V187C__.items).length
  }));
  expect(audit.doubtful).toBe(30);
  expect(audit.reviewSource).toBe(2);
  expect(audit.generic).toBe(118);
  expect(audit.replacements).toBe(30);
  expect(audit.replacementMin).toBeGreaterThanOrEqual(2);
  expect(audit.reframes).toBe(2);
  expect(audit.refinements).toBe(101);
});

test('lote 02 mantiene 100 propuestas y 100 contratos textuales estructuralmente válidos',async({page})=>{
  await boot(page);
  await page.selectOption('#batchFilter','batch-02-100');
  await expect(page.locator('.queue-item')).toHaveCount(100);
  const audit=await page.evaluate(()=>{
    const items=window.__QA_EDITORIAL_BATCH_V187__?.items||[];
    return {total:items.length,proposals:items.filter(x=>x.proposal).length,pass:items.filter(x=>x.textCheck?.structuralPass).length,sourced:items.filter(x=>x.sourceUrl).length,forbidden:items.filter(x=>x.textCheck?.violations?.length).map(x=>x.id)};
  });
  expect(audit.total).toBe(100);expect(audit.proposals).toBe(100);expect(audit.pass).toBe(100);expect(audit.sourced).toBe(100);expect(audit.forbidden).toEqual([]);
});

test('búsqueda v1.8.7-c admite hasta seis alternativas y nunca autoaprueba',async({page})=>{
  await boot(page);
  const audit=await page.evaluate(()=>{
    const data=window.__QA_EDITORIAL_REVIEW_MEDIA_V187C__||{summary:{},items:{}};
    const rows=Object.values(data.items||{}),candidates=rows.flatMap(x=>x.candidates||[]);
    return {target:data.summary?.targetIds||0,searched:data.summary?.searched||0,max:Math.max(0,...rows.map(x=>(x.candidates||[]).length)),invalidRights:candidates.filter(x=>!['publishable','review_only'].includes(x.rightsTier)).length,autoApproved:candidates.filter(x=>x.reviewRequired!==true).length,missingSource:candidates.filter(x=>!x.sourcePage).length};
  });
  expect(audit.target).toBe(141);
  expect(audit.max).toBeLessThanOrEqual(6);
  expect(audit.invalidRights).toBe(0);
  expect(audit.autoApproved).toBe(0);
  expect(audit.missingSource).toBe(0);
});

test('seleccionar un reemplazo reinicia texto y visual para revisión del nuevo evento',async({page})=>{
  await boot(page);
  await page.selectOption('#statusFilter','doubtful');
  await expect(page.locator('.queue-item')).toHaveCount(30);
  await page.locator('.queue-item').first().click();
  await expect(page.locator('[data-replacement-choice]')).toHaveCount(2);
  await page.locator('[data-replacement-choice="0"]').click();
  const state=await page.evaluate(()=>{const id=window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent();return window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id]});
  expect(state.replacementChoice).toBe(0);expect(state.factualStatus).toBe('replacement_selected');expect(state.textStatus).toBe('pending');expect(state.mediaStatus).toBe('pending');
});

test('aplicar reescritura de texto genérico conserva aprobación humana separada',async({page})=>{
  await boot(page);
  await page.selectOption('#statusFilter','generic');
  const id=await page.evaluate(()=>{
    const ids=window.__QA_EDITORIAL_FEEDBACK_V187C__.text.generic;
    return ids.find(x=>window.__QA_EDITORIAL_TEXT_REFINEMENTS_V187C__.items[x])||null;
  });
  expect(id).toBeTruthy();
  await page.fill('#searchInput',id);
  await page.locator('.queue-item').first().click();
  await page.locator('[data-apply-refinement]').click();
  const saved=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],id);
  expect(saved.textStatus).toBe('edit');expect(saved.edits.summary.length).toBeGreaterThan(80);expect(saved.edits.expanded.length).toBeGreaterThan(120);
});

test('revisar fuente conserva evento y permite aplicar título/pregunta reformulados',async({page})=>{
  await boot(page);
  await page.selectOption('#statusFilter','review_source');
  await expect(page.locator('.queue-item')).toHaveCount(2);
  await page.locator('.queue-item').first().click();
  await expect(page.locator('[data-apply-reframe]')).toBeVisible();
  await page.locator('[data-apply-reframe]').click();
  const saved=await page.evaluate(()=>{const id=window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent();return window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id]});
  expect(saved.factualStatus).toBe('approved');expect(saved.edits.title).toBeTruthy();expect(saved.edits.prompt).toBeTruthy();
});

test('selección visual y estados persisten en el store canónico',async({page})=>{
  await boot(page);
  const id='walkman';
  await page.fill('#searchInput',id);await page.locator('.queue-item').first().click();
  await page.locator('[data-media-choice="current"]').click();
  await page.locator('[data-status-group="factualStatus"][data-status-value="approved"]').click();
  await page.locator('[data-status-group="textStatus"][data-status-value="approved"]').click();
  await page.locator('[data-status-group="mediaStatus"][data-status-value="approved"]').click();
  const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem('que-ano-editorial-review-v18')).records[id],id);
  expect(saved.factualStatus).toBe('approved');expect(saved.textStatus).toBe('approved');expect(saved.mediaStatus).toBe('approved');expect(saved.mediaChoice).toBe('current');
  await page.reload();await page.waitForFunction(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__?.version==='1.8.7-c');
  const restored=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],id);expect(restored.mediaChoice).toBe('current');
});

test('no_photo sigue siendo una decisión editorial válida',async({page})=>{
  await boot(page);
  await page.locator('[data-status-group="mediaStatus"][data-status-value="no_photo"]').click();
  const id=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());
  const saved=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],id);
  expect(saved.mediaStatus).toBe('no_photo');expect(saved.mediaChoice).toBe('no_photo');
});

test('un store local con revisión previa tiene precedencia sobre el seed versionado',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('que-ano-editorial-review-v18',JSON.stringify({version:'1.8.7-b',records:{facebook:{factualStatus:'incorrect',textStatus:'edit',mediaStatus:'no_photo',mediaChoice:'no_photo',note:'decisión local',edits:{summary:'texto local'},updatedAt:'2026-09-13T06:00:00.000Z'}},migrations:{}})));
  await boot(page);
  const saved=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records.facebook);
  expect(saved.factualStatus).toBe('incorrect');expect(saved.note).toBe('decisión local');expect(saved.edits.summary).toBe('texto local');
});

test('capturas de consola editorial v1.8.7-c desktop y móvil',async({page})=>{
  fs.mkdirSync(shotDir,{recursive:true});
  await boot(page);await page.selectOption('#statusFilter','doubtful');await page.screenshot({path:path.join(shotDir,'v187c-review-refinement-desktop.png'),fullPage:true});
  await boot(page,{width:390,height:844});await page.selectOption('#statusFilter','generic');await page.screenshot({path:path.join(shotDir,'v187c-review-refinement-mobile-390x844.png'),fullPage:true});
});

const tinyPNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC','base64');
async function openImageForm(page){await page.locator('.custom-media > summary').click()}
test('imagen manual por enlace conserva procedencia y derechos pendientes al recargar',async({page})=>{
  await boot(page);await openImageForm(page);
  await page.route('https://example.org/photo.png',route=>route.fulfill({status:200,contentType:'image/png',body:tinyPNG}));
  await page.locator('#customImageUrl').fill('https://example.org/photo.png');
  await page.locator('#customImageCredit').fill('Archivo de prueba');
  await page.locator('#customImageSource').fill('https://example.org/origen');
  await page.locator('[data-preview-image]').click();
  await expect(page.locator('#customImagePreview')).toBeVisible();
  await page.locator('[data-add-image]').click();
  const saved=await page.evaluate(()=>{const api=window.__QA_EDITORIAL_REVIEW_CONSOLE__;return api.getStore().records[api.getCurrent()]});
  expect(saved.customImages).toHaveLength(1);expect(saved.customImages[0].sourcePage).toBe('https://example.org/origen');
  expect(saved.mediaStatus).toBe('rights_review');expect(saved.mediaCandidateKey).toBe(saved.customImages[0].customId);
  await page.reload();await page.waitForFunction(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__);
  const restored=await page.evaluate(()=>{const api=window.__QA_EDITORIAL_REVIEW_CONSOLE__;return api.getCandidates(api.getCurrent()).filter(c=>c.provider==='manual')});
  expect(restored).toHaveLength(1);expect(restored[0].src).toBe('https://example.org/photo.png');
});
test('archivo subido se incorpora al JSON exportado sin aprobación automática',async({page})=>{
  await boot(page,{width:390,height:844});await openImageForm(page);
  await page.locator('#customImageFile').setInputFiles({name:'foto.png',mimeType:'image/png',buffer:tinyPNG});
  await page.locator('#customImageCredit').fill('Autora de prueba');
  await page.locator('#customImageLicense').selectOption('own');
  await page.locator('[data-preview-image]').click();await expect(page.locator('#customImagePreview')).toBeVisible();
  await page.locator('[data-add-image]').click();
  const id=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());
  const saved=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],id);
  expect(saved.mediaStatus).toBe('pending');expect(saved.customImages[0].src).toMatch(/^data:image\/jpeg;base64,/);
  const downloading=page.waitForEvent('download');await page.locator('#exportButton').click();
  const download=await downloading,exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  expect(exported.records[id].customImages[0].src).toBe(saved.customImages[0].src);
  await page.reload();await page.waitForFunction(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__);
  await expect(page.locator('.visual-candidate-grid img[src^="data:image/jpeg"]')).toBeVisible();
});
test('enlace roto y archivo no admitido muestran errores sin crear una candidata',async({page})=>{
  await boot(page);await openImageForm(page);
  await page.route('https://example.org/broken.png',route=>route.abort());
  await page.locator('#customImageUrl').fill('https://example.org/broken.png');await page.locator('[data-preview-image]').click();
  await expect(page.locator('#customImageMessage')).toContainText('No se pudo cargar');
  await page.locator('#customImageUrl').fill('');
  await page.locator('#customImageFile').setInputFiles({name:'documento.pdf',mimeType:'application/pdf',buffer:Buffer.from('no image')});
  await page.locator('[data-preview-image]').click();await expect(page.locator('#customImageMessage')).toContainText('Formato no admitido');
  await expect(page.locator('#customImagePreview')).toBeHidden();
});
test('las imágenes manuales del original no pasan al evento de reemplazo',async({page})=>{
  await boot(page);await page.selectOption('#statusFilter','doubtful');
  await openImageForm(page);await page.locator('#customImageFile').setInputFiles({name:'foto.png',mimeType:'image/png',buffer:tinyPNG});
  await page.locator('#customImageCredit').fill('Archivo de prueba');
  await page.locator('[data-preview-image]').click();await expect(page.locator('#customImagePreview')).toBeVisible();await page.locator('[data-add-image]').click();
  await page.locator('[data-replacement-choice="0"]').click();
  const candidates=await page.evaluate(()=>{const api=window.__QA_EDITORIAL_REVIEW_CONSOLE__;return api.getCandidates(api.getCurrent())});
  expect(candidates).toEqual([]);
  await openImageForm(page);await page.locator('#customImageFile').setInputFiles({name:'reemplazo.png',mimeType:'image/png',buffer:tinyPNG});
  await page.locator('#customImageCredit').fill('Archivo para reemplazo');
  await page.locator('[data-preview-image]').click();await expect(page.locator('#customImagePreview')).toBeVisible();await page.locator('[data-add-image]').click();
  const added=await page.evaluate(()=>{const api=window.__QA_EDITORIAL_REVIEW_CONSOLE__;return api.getCandidates(api.getCurrent())});
  expect(added).toHaveLength(1);expect(added[0].eventScope).toBe('replacement:0');
});
