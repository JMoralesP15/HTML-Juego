import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(name,data)=>fs.writeFileSync(path.join(root,'reports',name),JSON.stringify(data,null,2)+'\n');
const html=read('index.html');
const scripts=[...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map(m=>m[1]);
const styles=[...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m=>m[1]);

const classification={
  'js/content.js':'CANONICAL_ACTIVE','js/scheduler.js':'CANONICAL_ACTIVE','js/calendar.js':'CANONICAL_ACTIVE','js/editorial.js':'CANONICAL_ACTIVE','js/editorial-verification-v18.js':'CANONICAL_ACTIVE','js/editorial-v18-manual.js':'CANONICAL_ACTIVE','js/content-v12.js':'TRANSITIONAL_ACTIVE','js/curation-v14.js':'TRANSITIONAL_ACTIVE','js/storage.js':'CANONICAL_ACTIVE','js/game.js':'TRANSITIONAL_ACTIVE','js/panels.js':'CANONICAL_ACTIVE','js/archive-night.js':'TRANSITIONAL_ACTIVE','js/archive-numbering.js':'LEGACY_REQUIRED','js/atlas-v12.js':'TRANSITIONAL_ACTIVE','js/app.js':'CANONICAL_ACTIVE','js/runtime-contract.js':'CANONICAL_ACTIVE','js/semantic-contract.js':'TRANSITIONAL_ACTIVE','js/analytics-config.js':'CANONICAL_ACTIVE','js/analytics-v17.js':'CANONICAL_ACTIVE','js/product-v13.js':'TRANSITIONAL_ACTIVE','js/experience-v14.js':'TRANSITIONAL_ACTIVE','js/simplification-v15.js':'TRANSITIONAL_ACTIVE','js/learning-v16.js':'TRANSITIONAL_ACTIVE','js/experience-v18.js':'CANONICAL_ACTIVE',
  'style.css':'CANONICAL_ACTIVE','archive-night.css':'TRANSITIONAL_ACTIVE','atlas-v12.css':'TRANSITIONAL_ACTIVE','experience-v17.css':'TRANSITIONAL_ACTIVE','interaction-v17.css':'CANONICAL_ACTIVE'
};

function definitions(code){
  const found=[];
  const push=(name,kind,index)=>{if(name)found.push({name,kind,index})};
  for(const m of code.matchAll(/(?:^|\n)\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g))push(m[1],'function-declaration',m.index);
  for(const m of code.matchAll(/(?:^|\n)\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|(?:\([^\n;]*\)|[A-Za-z_$][\w$]*)\s*=>)/g))push(m[1],'variable-function',m.index);
  for(const m of code.matchAll(/(?:^|\n)\s*([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|(?:\([^\n;]*\)|[A-Za-z_$][\w$]*)\s*=>)/g))push(m[1],'global-assignment',m.index);
  for(const m of code.matchAll(/\bwindow\.([A-Za-z_$][\w$]*)\s*=\s*/g))push(m[1],'window-assignment',m.index);
  return found;
}
function listeners(code){return [...code.matchAll(/\.addEventListener\(\s*['"]([^'"]+)['"]/g)].map(m=>m[1])}
function patches(code){return [...code.matchAll(/(?:^|\n)\s*([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|(?:\([^\n;]*\)|[A-Za-z_$][\w$]*)\s*=>)/g)].map(m=>m[1])}
function selectors(code){
  const clean=code.replace(/\/\*[\s\S]*?\*\//g,'');
  return [...clean.matchAll(/([^{}]+)\{/g)].flatMap(m=>m[1].trim().startsWith('@')?[]:m[1].split(',').map(x=>x.trim()).filter(Boolean));
}

const js=scripts.map((src,loadIndex)=>{const code=read(src);return {path:src,type:'js',loadIndex,classification:classification[src]||'UNKNOWN',bytes:Buffer.byteLength(code),definitions:definitions(code),behaviorPatches:patches(code),eventListeners:listeners(code),mutationObservers:(code.match(/new\s+MutationObserver\s*\(/g)||[]).length,renderSubscriptions:(code.match(/__QYA_RUNTIME__\?*\.onRender\s*\(/g)||[]).length}});
const symbolMap=new Map();
for(const f of js)for(const d of f.definitions){const arr=symbolMap.get(d.name)||[];arr.push({path:f.path,loadIndex:f.loadIndex,kind:d.kind,sourceIndex:d.index});symbolMap.set(d.name,arr)}
const collisions=[...symbolMap.entries()].filter(([,defs])=>new Set(defs.map(x=>x.path)).size>1).map(([symbol,defs])=>{const sorted=[...defs].sort((a,b)=>a.loadIndex-b.loadIndex||a.sourceIndex-b.sourceIndex);return {symbol,definitions:sorted,effectiveOwner:sorted.at(-1).path,shadowedOwners:[...new Set(sorted.slice(0,-1).map(x=>x.path))],status:'STATIC_COLLISION'}}).sort((a,b)=>a.symbol.localeCompare(b.symbol));

const css=styles.map((src,loadIndex)=>{const code=read(src),sel=selectors(code);return {path:src,type:'css',loadIndex,classification:classification[src]||'UNKNOWN',bytes:Buffer.byteLength(code),importantCount:(code.match(/!important\b/g)||[]).length,selectorCount:sel.length,selectors:sel}});
const selectorMap=new Map();for(const f of css)for(const selector of f.selectors){const arr=selectorMap.get(selector)||[];arr.push(f.path);selectorMap.set(selector,arr)}
const repeated=[...selectorMap.entries()].filter(([,files])=>new Set(files).size>1).map(([selector,files])=>({selector,files:[...new Set(files)],occurrences:files.length})).sort((a,b)=>b.occurrences-a.occurrences||a.selector.localeCompare(b.selector));

const fileClassification={schema:'que-ano-runtime-file-classification-v1.8.3',auditDate:'2026-09-13',source:'index.html actual load order',files:[...js.map(({definitions,behaviorPatches,eventListeners,...x})=>x),...css.map(({selectors,...x})=>x)],metrics:{activeScripts:scripts.length,activeStylesheets:styles.length,classifiedFiles:[...js,...css].filter(x=>classification[x.path]).length,totalActiveFiles:scripts.length+styles.length,classificationCoverage:(scripts.length+styles.length)?[...js,...css].filter(x=>classification[x.path]).length/(scripts.length+styles.length):0}};
const runtime={schema:'que-ano-runtime-ownership-v1.8.3',auditDate:'2026-09-13',methodology:'Static inventory of files actually loaded by index.html. Classification is evidence of debt/state, never deletion authority.',active:{scripts,styles,scriptCount:scripts.length,stylesheetCount:styles.length,totalJsBytes:js.reduce((n,x)=>n+x.bytes,0),totalCssBytes:css.reduce((n,x)=>n+x.bytes,0)},signals:{collisionCount:collisions.length,behaviorPatchCount:js.reduce((n,x)=>n+x.behaviorPatches.length,0),mutationObserverCount:js.reduce((n,x)=>n+x.mutationObservers,0),renderSubscriptionCount:js.reduce((n,x)=>n+x.renderSubscriptions,0),eventListenerCount:js.reduce((n,x)=>n+x.eventListeners.length,0)},requiresBrowser:[{id:'MEDIA_ASYNC_PRECEDENCE',files:['js/experience-v14.js','js/experience-v18.js'],reason:'v1.4 media selection is asynchronous; static load order alone cannot prove that curated v1.8 media always remains final.'}]};
const globals={schema:'que-ano-global-collisions-v1.8.3',auditDate:'2026-09-13',methodology:'Regex-assisted static inventory. Collisions are candidates for ownership analysis; a collision does not authorize removal.',collisions,behaviorPatches:js.flatMap(x=>x.behaviorPatches.map(symbol=>({path:x.path,symbol}))),eventListeners:js.filter(x=>x.eventListeners.length).map(x=>({path:x.path,events:x.eventListeners})),mutationObservers:js.filter(x=>x.mutationObservers).map(x=>({path:x.path,count:x.mutationObservers})),renderSubscriptions:js.filter(x=>x.renderSubscriptions).map(x=>({path:x.path,count:x.renderSubscriptions}))};
const cascade={schema:'que-ano-css-cascade-audit-v1.8.3',auditDate:'2026-09-13',methodology:'Repeated selectors and !important are debt signals, not proof that a rule can be removed.',files:css.map(({selectors,...x})=>x),totalImportant:css.reduce((n,x)=>n+x.importantCount,0),repeatedSelectorCount:repeated.length,topRepeatedSelectors:repeated.slice(0,150)};

fs.mkdirSync(path.join(root,'reports'),{recursive:true});
write('runtime-file-classification.json',fileClassification);write('runtime-ownership.json',runtime);write('global-collisions.json',globals);write('css-cascade-audit.json',cascade);
console.log(JSON.stringify({classification:fileClassification.metrics,ownership:runtime.signals,css:{totalImportant:cascade.totalImportant,repeatedSelectorCount:cascade.repeatedSelectorCount}},null,2));
