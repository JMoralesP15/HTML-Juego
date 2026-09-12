import {test,expect} from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const reviewURL=pathToFileURL(path.join(root,'review','index.html')).href;
const gameIndex=fs.readFileSync(path.join(root,'index.html'),'utf8');

async function boot(page){
  await page.goto(reviewURL);
  await page.waitForFunction(()=>window.__QA_EDITORIAL_ASSIST_V181__?.ids?.length===50);
}

test('lote piloto contiene 50 propuestas válidas y no usa metadiscurso prohibido',async({page})=>{
  await boot(page);
  const audit=await page.evaluate(()=>{
    const items=window.__QA_EDITORIAL_PROPOSALS_V181__.items;
    const questions=new Set(QUESTIONS.map(q=>q.id));
    const forbidden=/(la ficha (indica|identifica)|preguntamos por|la fecha es el punto de entrada|contenido complementario)/i;
    return Object.entries(items).map(([id,p])=>({id,exists:questions.has(id),summary:p.summary||'',expanded:p.expanded||'',same:(p.summary||'').trim()===(p.expanded||'').trim(),badSummary:forbidden.test(p.summary||''),badExpanded:forbidden.test(p.expanded||''),source:!!p.source,confidence:p.confidence}));
  });
  expect(audit).toHaveLength(50);
  expect(audit.every(x=>x.exists&&x.summary.length>80&&x.expanded.length>100&&!x.same&&!x.badSummary&&!x.badExpanded&&x.source&&['high','medium','review'].includes(x.confidence))).toBeTruthy();
});

test('el juego público no carga ni aplica propuestas sin aprobación',async()=>{
  expect(gameIndex).not.toContain('editorial-proposals-v181-batch1.js');
  expect(gameIndex).not.toContain('editorial-assist-v181.js');
});

test('revisor muestra relato breve, expansión y nota cronológica sin bullets de producto',async({page})=>{
  await boot(page);
  await page.getByRole('button',{name:'Revisar lote 50'}).click();
  await expect(page.locator('.v181-proposal-section')).toBeVisible();
  await expect(page.locator('[data-v181-edit="summary"]')).toBeVisible();
  await expect(page.locator('[data-v181-edit="expanded"]')).toBeVisible();
  await expect(page.locator('[data-v181-edit="dateNote"]')).toBeVisible();
  await expect(page.locator('.v181-rule')).toContainText('no son etiquetas de interfaz');
  const cardText=await page.locator('.v181-proposal-section').innerText();
  expect(cardText).not.toMatch(/LA FICHA (INDICA|IDENTIFICA)/i);
});

test('aprobar, editar o descartar propuesta se guarda separado del banco',async({page})=>{
  await boot(page);
  await page.getByRole('button',{name:'Revisar lote 50'}).click();
  const id=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());
  await page.locator('[data-v181-status="approved"]').click();
  const stored=await page.evaluate(id=>JSON.parse(localStorage.getItem('que-ano-editorial-proposals-v181-batch01'))[id],id);
  expect(stored.status).toBe('approved');
  const baseStore=await page.evaluate(()=>localStorage.getItem('que-ano-editorial-review-v18'));
  expect(baseStore===null||!JSON.parse(baseStore)?.records?.[id]?.proposalStatus).toBeTruthy();
});

test('navegación del lote permite avanzar sin recorrer las 300 fichas',async({page})=>{
  await boot(page);
  await page.getByRole('button',{name:'Revisar lote 50'}).click();
  const first=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());
  await page.locator('[data-v181-next]').click();
  await page.waitForFunction(first=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent()!==first,first);
  const second=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());
  expect(second).not.toBe(first);
  await expect(page.locator('.v181-proposal-section')).toBeVisible();
});
