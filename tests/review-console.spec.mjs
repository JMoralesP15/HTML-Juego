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
  await page.waitForFunction(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__?.version==='1.8.7-draft.1');
}

test('consola única carga 300 fichas y las tres dimensiones',async({page})=>{
  await boot(page);
  await expect(page.locator('#metricReviewed')).toContainText('/ 300');
  await expect(page.locator('.queue-item')).toHaveCount(300);
  await expect(page.getByRole('heading',{name:/1 · Hecho y fuente/i})).toBeVisible();
  await expect(page.getByRole('heading',{name:/2 · Contenido textual/i})).toBeVisible();
  await expect(page.getByRole('heading',{name:/3 · Contenido visual/i})).toBeVisible();
  expect(await page.locator('script[src="editorial-assist-v181.js"]').count()).toBe(0);
});

test('lote editorial v1.8.2 contiene exactamente 100 eventos',async({page})=>{
  await boot(page);
  await page.selectOption('#batchFilter','batch-02-100');
  await expect(page.locator('.queue-item')).toHaveCount(100);
  await expect(page.locator('[data-edit="summary"]')).toBeVisible();
  await expect(page.locator('[data-edit="expanded"]')).toBeVisible();
  await expect(page.locator('[data-edit="dateNote"]')).toBeVisible();
});

test('decisiones factual textual y visual persisten en un solo store',async({page})=>{
  await boot(page);
  await page.locator('[data-status-group="factualStatus"][data-status-value="approved"]').click();
  await page.locator('[data-status-group="textStatus"][data-status-value="approved"]').click();
  await page.locator('[data-status-group="mediaStatus"][data-status-value="no_photo"]').click();
  const id=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());
  const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem('que-ano-editorial-review-v18')).records[id],id);
  expect(saved.factualStatus).toBe('approved');expect(saved.textStatus).toBe('approved');expect(saved.mediaStatus).toBe('no_photo');
  await page.reload();await page.waitForFunction(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__?.version==='1.8.7-draft.1');
  const restored=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],id);expect(restored.mediaStatus).toBe('no_photo');
});

test('migra decisiones del antiguo overlay v1.8.1 sin mantener un segundo modo',async({page})=>{
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

test('atajos permiten aprobar y navegar sin credenciales',async({page})=>{
  await boot(page);const first=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());
  await page.keyboard.press('a');const approved=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],first);expect(approved.factualStatus).toBe('approved');
  await page.keyboard.press('ArrowRight');const next=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());expect(next).not.toBe(first);
});

test('capturas de consola editorial unificada desktop y móvil',async({page})=>{
  fs.mkdirSync(shotDir,{recursive:true});
  await boot(page);await page.selectOption('#batchFilter','batch-02-100');await page.screenshot({path:path.join(shotDir,'v187-review-unified-desktop.png'),fullPage:true});
  await boot(page,{width:390,height:844});await page.selectOption('#batchFilter','batch-02-100');await page.screenshot({path:path.join(shotDir,'v187-review-unified-mobile-390x844.png'),fullPage:true});
});
