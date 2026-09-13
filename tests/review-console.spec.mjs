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
  await page.waitForFunction(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__?.version==='1.8.7-b');
}

test('consola única carga 300 fichas y las tres dimensiones',async({page})=>{
  await boot(page);
  await expect(page.locator('#metricReviewed')).toContainText('/ 300');
  await expect(page.locator('.queue-item')).toHaveCount(300);
  await expect(page.getByRole('heading',{name:/1 · Hecho y fuente/i})).toBeVisible();
  await expect(page.getByRole('heading',{name:/2 · Contenido textual/i})).toBeVisible();
  await expect(page.getByRole('heading',{name:/3 · Contenido visual/i})).toBeVisible();
  expect(await page.locator('script[src="editorial-assist-v181.js"]').count()).toBe(0);
  expect(await page.locator('script[src="review.js"]').count()).toBe(0);
});

test('lote 02 contiene 100 propuestas y 100 contratos textuales aprobados estructuralmente',async({page})=>{
  await boot(page);
  await page.selectOption('#batchFilter','batch-02-100');
  await expect(page.locator('.queue-item')).toHaveCount(100);
  const audit=await page.evaluate(()=>{
    const items=window.__QA_EDITORIAL_BATCH_V187__?.items||[];
    return {
      total:items.length,
      proposals:items.filter(x=>x.proposal).length,
      pass:items.filter(x=>x.textCheck?.structuralPass).length,
      sourced:items.filter(x=>x.sourceUrl).length,
      forbidden:items.filter(x=>x.textCheck?.violations?.length).map(x=>x.id)
    };
  });
  expect(audit.total).toBe(100);
  expect(audit.proposals).toBe(100);
  expect(audit.pass).toBe(100);
  expect(audit.sourced).toBe(100);
  expect(audit.forbidden).toEqual([]);
});

test('búsqueda visual registra estados y hasta tres candidatas trazables por evento',async({page})=>{
  await boot(page);
  const audit=await page.evaluate(()=>{
    const items=window.__QA_EDITORIAL_BATCH_V187__?.items||[];
    const candidates=items.flatMap(x=>x.mediaSearch?.candidates||[]);
    return {
      searched:items.filter(x=>['found','no_candidate','error','blocked'].includes(x.mediaSearch?.status)).length,
      maxCandidates:Math.max(0,...items.map(x=>(x.mediaSearch?.candidates||[]).length)),
      missingSource:candidates.filter(x=>!x.sourcePage).length,
      missingLicense:candidates.filter(x=>!x.license).length,
      autoApproved:candidates.filter(x=>x.reviewRequired!==true).length,
      invalidVisual:candidates.filter(x=>/(logo|poster|cover|screenshot|map|diagram|illustration|flag|cosplay|replica|reenactment|anniversary|collage|montage)/i.test(x.fileTitle||'')).length
    };
  });
  expect(audit.searched).toBe(100);
  expect(audit.maxCandidates).toBeLessThanOrEqual(3);
  expect(audit.missingSource).toBe(0);
  expect(audit.missingLicense).toBe(0);
  expect(audit.autoApproved).toBe(0);
  expect(audit.invalidVisual).toBe(0);
});

test('manifiesto no publica automáticamente candidatas en q.v18Media',async()=>{
  const code=fs.readFileSync(path.join(root,'tools','export-editorial-batch-js-v187.mjs'),'utf8');
  expect(code).not.toMatch(/q\.v18Media\s*=/);
  expect(code).toMatch(/__QA_EDITORIAL_BATCH_V187__/);
});

test('selección visual y estados persisten en un único store',async({page})=>{
  await boot(page);
  await page.selectOption('#batchFilter','batch-02-100');
  const id=await page.evaluate(()=>{
    const item=(window.__QA_EDITORIAL_BATCH_V187__?.items||[]).find(x=>(x.mediaSearch?.candidates||[]).length>0);
    return item?.id||window.__QA_EDITORIAL_BATCH02_V187__.ids[0];
  });
  await page.locator(`[data-open="${id}"]`).click();
  const choice=page.locator('[data-media-choice^="candidate:"]').first();
  if(await choice.count())await choice.click();else await page.locator('[data-media-choice="current"]').click();
  await page.locator('[data-status-group="factualStatus"][data-status-value="approved"]').click();
  await page.locator('[data-status-group="textStatus"][data-status-value="approved"]').click();
  await page.locator('[data-status-group="mediaStatus"][data-status-value="approved"]').click();
  const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem('que-ano-editorial-review-v18')).records[id],id);
  expect(saved.factualStatus).toBe('approved');expect(saved.textStatus).toBe('approved');expect(saved.mediaStatus).toBe('approved');expect(saved.mediaChoice).not.toBe('pending');
  await page.reload();await page.waitForFunction(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__?.version==='1.8.7-b');
  const restored=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],id);expect(restored.mediaChoice).toBe(saved.mediaChoice);
});

test('no_photo sigue siendo una decisión editorial válida',async({page})=>{
  await boot(page);
  await page.locator('[data-status-group="factualStatus"][data-status-value="approved"]').click();
  await page.locator('[data-status-group="textStatus"][data-status-value="approved"]').click();
  await page.locator('[data-status-group="mediaStatus"][data-status-value="no_photo"]').click();
  const id=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());
  const saved=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],id);
  expect(saved.mediaStatus).toBe('no_photo');expect(saved.mediaChoice).toBe('no_photo');
});

test('migra decisiones del antiguo overlay sin mantener un segundo modo',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('que-ano-editorial-proposals-v181-batch01',JSON.stringify({mac:{status:'edit',edits:{summary:'Resumen migrado'},note:'Nota migrada'}})));
  await boot(page);
  const migrated=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore());
  expect(migrated.migrations.v181).toBeTruthy();
  expect(migrated.records.mac.textStatus).toBe('edit');
  expect(migrated.records.mac.edits.summary).toBe('Resumen migrado');
});

test('filtros separan lote, pendientes y evidencia automática',async({page})=>{
  await boot(page);
  await page.selectOption('#statusFilter','needs_review');
  const count=await page.locator('.queue-item').count();expect(count).toBeGreaterThan(0);expect(count).toBeLessThan(300);
  await page.selectOption('#categoryFilter','Ciencia');
  const categories=await page.locator('.queue-item small').allTextContents();expect(categories.every(x=>x.includes('Ciencia'))).toBeTruthy();
});

test('capturas de consola editorial unificada desktop y móvil',async({page})=>{
  fs.mkdirSync(shotDir,{recursive:true});
  await boot(page);await page.selectOption('#batchFilter','batch-02-100');await page.screenshot({path:path.join(shotDir,'v187b-review-unified-desktop.png'),fullPage:true});
  await boot(page,{width:390,height:844});await page.selectOption('#batchFilter','batch-02-100');await page.screenshot({path:path.join(shotDir,'v187b-review-unified-mobile-390x844.png'),fullPage:true});
});
