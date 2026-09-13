import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const feedback=JSON.parse(fs.readFileSync(path.join(root,'reports/editorial-feedback-v187c.json'),'utf8'));
const sandbox={window:{}};vm.createContext(sandbox);
for(const file of ['js/editorial-feedback-v187c.js','js/editorial-replacements-v187c.js','js/editorial-text-refinements-v187c.js','js/editorial-text-refinements-v187c-fixes.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
const F=sandbox.window.__QA_EDITORIAL_FEEDBACK_V187C__,R=sandbox.window.__QA_EDITORIAL_REPLACEMENTS_V187C__,T=sandbox.window.__QA_EDITORIAL_TEXT_REFINEMENTS_V187C__;
const words=s=>String(s||'').trim().split(/\s+/).filter(Boolean).length;
const fail=[];
const doubtful=F.factual?.doubtful||[],generic=F.text?.generic||[],reviewSource=F.factual?.review_source||[],badMedia=feedback.ids?.badMedia||[];
if(doubtful.length!==30)fail.push(`doubtful=${doubtful.length}, expected 30`);
if(reviewSource.length!==2)fail.push(`review_source=${reviewSource.length}, expected 2`);
if(generic.length!==118)fail.push(`generic=${generic.length}, expected 118`);
if(badMedia.length!==141)fail.push(`badMedia=${badMedia.length}, expected 141`);
const rkeys=Object.keys(R.items||{});if(rkeys.length!==30)fail.push(`replacement items=${rkeys.length}, expected 30`);
for(const id of doubtful){const opts=R.items?.[id]||[];if(opts.length<2)fail.push(`${id}: needs >=2 replacement options`);for(const [i,o] of opts.entries()){for(const k of ['title','prompt','fact','year','category','entity','source','rationale'])if(!o[k])fail.push(`${id}[${i}]: missing ${k}`);if(o.reviewRequired!==true)fail.push(`${id}[${i}]: reviewRequired must be true`)}}
const refkeys=Object.keys(R.sourceReframes||{});if(refkeys.length!==2)fail.push(`source reframes=${refkeys.length}, expected 2`);for(const id of reviewSource)if(!R.sourceReframes?.[id])fail.push(`${id}: missing source reframe`);
const applicable=generic.filter(id=>!doubtful.includes(id));const tkeys=Object.keys(T.items||{});if(tkeys.length!==applicable.length)fail.push(`text refinements=${tkeys.length}, expected ${applicable.length}`);
for(const id of applicable){const x=T.items?.[id];if(!x){fail.push(`${id}: missing generic rewrite`);continue}const sw=words(x.summary),ew=words(x.expanded);if(sw<35||sw>80)fail.push(`${id}: summary ${sw} words (expected 35-80)`);if(ew<60||ew>140)fail.push(`${id}: expanded ${ew} words (expected 60-140)`);if(x.reviewRequired!==true)fail.push(`${id}: rewrite reviewRequired must be true`)}
if(fs.existsSync(path.join(root,'reports/editorial-review-media-v187c.json'))){const M=JSON.parse(fs.readFileSync(path.join(root,'reports/editorial-review-media-v187c.json'),'utf8'));if(M.summary?.targetIds!==141)fail.push(`media targetIds=${M.summary?.targetIds}, expected 141`);for(const id of badMedia){const row=M.items?.[id];if(!row){fail.push(`${id}: missing generated media row`);continue}if((row.candidates||[]).length>6)fail.push(`${id}: >6 media candidates`);for(const c of row.candidates||[]){if(!['publishable','review_only'].includes(c.rightsTier))fail.push(`${id}: invalid rightsTier`);if(c.reviewRequired!==true)fail.push(`${id}: media candidate is not reviewRequired`)}}}
const report={pass:fail.length===0,counts:{doubtful:doubtful.length,reviewSource:reviewSource.length,generic:generic.length,genericApplicable:applicable.length,replacements:rkeys.length,textRefinements:tkeys.length,badMedia:badMedia.length},failures:fail};
fs.writeFileSync(path.join(root,'reports/editorial-v187c-validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(fail.length)process.exit(1);
