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
  await page.waitForFunction(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__?.version==='1.8.0-beta.1');
}

test('consola carga las 300 fichas y mantiene las tres dimensiones base',async({page})=>{
  await boot(page);
  await expect(page.locator('#metricReviewed')).toContainText('/ 300');
  await expect(page.locator('.queue-item')).toHaveCount(300);
  await expect(page.locator('#reviewCard h2')).toBeVisible();
  await expect(page.getByRole('heading',{name:/1 · Hecho y fuente/i})).toBeVisible();
  await expect(page.getByRole('heading',{name:/3 · Fotografía \/ imagen/i})).toBeVisible();
});

test('decisiones independientes persisten en localStorage',async({page})=>{
  await boot(page);
  await page.locator('[data-status-group="factualStatus"][data-status-value="approved"]').click();
  const textButton=page.locator('[data-status-group="textStatus"][data-status-value="approved"]');
  if(await textButton.isVisible())await textButton.click();
  await page.locator('[data-status-group="mediaStatus"][data-status-value="no_photo"]').click();
  const id=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());
  const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem('que-ano-editorial-review-v18')).records[id],id);
  expect(saved.factualStatus).toBe('approved');expect(saved.mediaStatus).toBe('no_photo');
  await page.reload();await page.waitForFunction(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__);const restored=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],id);expect(restored.mediaStatus).toBe('no_photo');
});

test('filtros separan pendientes y evidencia automática',async({page})=>{
  await boot(page);
  await page.selectOption('#statusFilter','needs_review');
  await expect(page.locator('.queue-item').first()).toBeVisible();
  const count=await page.locator('.queue-item').count();expect(count).toBeGreaterThan(0);expect(count).toBeLessThan(300);
  await page.selectOption('#categoryFilter','Ciencia');
  const categories=await page.locator('.queue-item small').allTextContents();expect(categories.every(x=>x.includes('Ciencia'))).toBeTruthy();
});

test('atajos permiten aprobar y navegar sin escribir credenciales',async({page})=>{
  await boot(page);const first=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());
  await page.keyboard.press('a');const approved=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],first);expect(approved.factualStatus).toBe('approved');
  await page.keyboard.press('ArrowRight');const next=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());expect(next).not.toBe(first);
});

test('capturas de consola editorial desktop y móvil',async({page})=>{
  fs.mkdirSync(shotDir,{recursive:true});
  await boot(page);await page.screenshot({path:path.join(shotDir,'v18-review-console-desktop.png'),fullPage:true});
  await boot(page,{width:390,height:844});await page.screenshot({path:path.join(shotDir,'v18-review-console-mobile-390x844.png'),fullPage:true});
});
