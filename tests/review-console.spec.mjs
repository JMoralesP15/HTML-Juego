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
  await page.waitForFunction(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__?.version==='1.8.8');
}

test('consola v1.8.8 carga 300 fichas en una sola experiencia',async({page})=>{
  await boot(page);
  await expect(page.locator('#metricReviewed')).toContainText('/ 300');
  await expect(page.locator('.queue-item')).toHaveCount(300);
  await expect(page.getByRole('heading',{name:/1 · Hecho y fuente/i})).toBeVisible();
  await expect(page.getByRole('heading',{name:/2 · Contenido textual/i})).toBeVisible();
  await expect(page.getByRole('heading',{name:/3 · Contenido visual/i})).toBeVisible();
  expect(await page.locator('script[src="review-v187b.js"]').count()).toBe(0);
  expect(await page.locator('script[src="review-v187c.js"]').count()).toBe(0);
});

test('contrato humano conserva 30 dudosos, 2 reformulaciones y 118 genéricos',async({page})=>{
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
  expect(audit).toMatchObject({doubtful:30,reviewSource:2,generic:118,replacements:30,reframes:2,refinements:101});
  expect(audit.replacementMin).toBeGreaterThanOrEqual(2);
});

test('101 textos genéricos no dudosos quedan reconstruidos pero no autoaprobados',async({page})=>{
  await boot(page);
  const audit=await page.evaluate(()=>{
    const store=window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore();
    const rows=Object.values(store.records||{});
    return {
      remediated:rows.filter(r=>r.autoRemediatedTextV188).length,
      autoApproved:rows.filter(r=>r.autoRemediatedTextV188&&r.textStatus==='approved').length,
      tooShort:rows.filter(r=>r.autoRemediatedTextV188&&String(r.edits?.summary||'').trim().split(/\s+/).filter(Boolean).length<30).length
    };
  });
  expect(audit.remediated).toBe(101);
  expect(audit.autoApproved).toBe(0);
  expect(audit.tooShort).toBe(0);
});

test('los 2 revisar fuente se reformulan sin sustituir el evento',async({page})=>{
  await boot(page);
  const audit=await page.evaluate(()=>{
    const store=window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore();
    return ['everest','gravwaves'].map(id=>({id,...store.records[id]}));
  });
  expect(audit).toHaveLength(2);
  for(const row of audit){
    expect(row.autoReframedV188).toBe(true);
    expect(row.factualStatus).toBe('approved');
    expect(row.edits.title).toBeTruthy();
    expect(row.edits.prompt).toBeTruthy();
    expect(row.edits.source).toBeTruthy();
    expect(row.replacementChoice).toBeNull();
  }
});

test('media v1.8.8 cubre originales rechazados y variantes de reemplazo',async({page})=>{
  await boot(page);
  const audit=await page.evaluate(()=>{
    const data=window.__QA_EDITORIAL_REVIEW_MEDIA_V188__||{summary:{},items:{},replacementItems:{}};
    const rows=Object.values(data.items||{}),repRows=Object.values(data.replacementItems||{}).flat();
    const candidates=[...rows.flatMap(x=>x.candidates||[]),...repRows.flatMap(x=>x.candidates||[])];
    return {
      summary:data.summary,
      max:Math.max(0,...[...rows,...repRows].map(x=>(x.candidates||[]).length)),
      invalidRights:candidates.filter(x=>!['publishable','review_only'].includes(x.rightsTier)).length,
      autoApproved:candidates.filter(x=>x.reviewRequired!==true).length,
      missingSource:candidates.filter(x=>!x.sourcePage).length
    };
  });
  expect(audit.summary.targetIds).toBe(141);
  expect(audit.summary.replacementEvents).toBe(30);
  expect(audit.summary.searchedOriginals).toBe(141);
  expect(audit.summary.searchedReplacements).toBe(audit.summary.replacementVariants);
  expect(audit.max).toBeLessThanOrEqual(8);
  expect(audit.invalidRights).toBe(0);
  expect(audit.autoApproved).toBe(0);
  expect(audit.missingSource).toBe(0);
});

test('seleccionar reemplazo cambia el evento y su conjunto visual',async({page})=>{
  await boot(page);
  await page.fill('#searchInput','usb');
  await page.locator('.queue-item').first().click();
  const before=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCandidates('usb').map(x=>x.original||x.src));
  await page.locator('[data-replacement-choice="0"]').click();
  const state=await page.evaluate(()=>({
    record:window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records.usb,
    after:window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCandidates('usb').map(x=>x.original||x.src),
    media:window.__QA_EDITORIAL_REVIEW_CONSOLE__.getReplacementMedia('usb',0)
  }));
  expect(state.record.replacementChoice).toBe(0);
  expect(state.record.factualStatus).toBe('replacement_selected');
  expect(state.record.textStatus).toBe('pending');
  expect(state.record.mediaStatus).toBe('pending');
  expect(state.media).toBeTruthy();
  expect(state.after).toEqual((state.media.candidates||[]).map(x=>x.original||x.src).slice(0,8));
  if(before.length&&state.after.length)expect(state.after).not.toEqual(before);
});

test('review_only queda bloqueada para aprobación automática',async({page})=>{
  await boot(page);
  const target=await page.evaluate(()=>{
    const ids=window.__QA_EDITORIAL_FEEDBACK_V187C__.media.anachronistic;
    for(const id of ids){
      const c=window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCandidates(id)||[];
      const i=c.findIndex(x=>x.rightsTier==='review_only');
      if(i>=0)return{id,index:i};
    }
    return null;
  });
  if(!target)test.skip(true,'No review_only candidate in generated set');
  await page.fill('#searchInput',target.id);await page.locator('.queue-item').first().click();
  await page.locator(`[data-media-choice="candidate:${target.index}"]`).click();
  await page.locator('[data-status-group="mediaStatus"][data-status-value="approved"]').click();
  const saved=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],target.id);
  expect(saved.mediaStatus).toBe('rights_review');
});

test('no_photo sigue siendo decisión editorial válida',async({page})=>{
  await boot(page);
  await page.locator('[data-status-group="mediaStatus"][data-status-value="no_photo"]').click();
  const id=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getCurrent());
  const saved=await page.evaluate(id=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records[id],id);
  expect(saved.mediaStatus).toBe('no_photo');expect(saved.mediaChoice).toBe('no_photo');
});

test('un store local más reciente conserva precedencia',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('que-ano-editorial-review-v18',JSON.stringify({version:'1.8.7-c',records:{facebook:{factualStatus:'incorrect',textStatus:'approved',mediaStatus:'no_photo',mediaChoice:'no_photo',replacementChoice:null,note:'decisión local',edits:{summary:'texto local'},updatedAt:'2026-09-13T08:00:00.000Z'}},migrations:{v187cHumanFeedbackSeed:true}})));
  await boot(page);
  const saved=await page.evaluate(()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__.getStore().records.facebook);
  expect(saved.factualStatus).toBe('incorrect');expect(saved.note).toBe('decisión local');expect(saved.edits.summary).toBe('texto local');
});

test('capturas de consola editorial v1.8.8 desktop y móvil',async({page})=>{
  fs.mkdirSync(shotDir,{recursive:true});
  await boot(page);await page.selectOption('#statusFilter','doubtful');await page.screenshot({path:path.join(shotDir,'v188-review-remediation-desktop.png'),fullPage:true});
  await boot(page,{width:390,height:844});await page.selectOption('#statusFilter','generic');await page.screenshot({path:path.join(shotDir,'v188-review-remediation-mobile-390x844.png'),fullPage:true});
});
