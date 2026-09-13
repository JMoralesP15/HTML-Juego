import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ctx=vm.createContext({console,window:{},Date,Map,Set,Math,JSON,Intl,URL});
ctx.window=ctx;
for(const file of ['js/content.js','js/editorial-proposals-v182-history.js','js/editorial-proposals-v182-science.js','js/editorial-proposals-v182-tech.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
}
const questions=vm.runInContext('QUESTIONS.map(q=>({...q}))',ctx);
const batch=vm.runInContext('JSON.parse(JSON.stringify(window.__QA_EDITORIAL_PROPOSALS_V182__))',ctx);
const evidence=JSON.parse(fs.readFileSync(path.join(root,'reports/factual-verification-v18.json'),'utf8'));
const rows=evidence.rows||evidence.items||evidence;
const byId=new Map(questions.map(q=>[q.id,q]));
const ids=[...(batch.order||[])];
if(ids.length!==100||new Set(ids).size!==100)throw new Error(`batch-02-100 inválido: ${ids.length} ids`);

const forbidden=[/la ficha indica/i,/la ficha identifica/i,/preguntamos por/i,/la fecha es el punto de entrada/i,/contenido complementario/i,/qué fue:/i,/por qué importa:/i,/dato para recordar:/i];
const wc=v=>String(v||'').trim().split(/\s+/).filter(Boolean).length;
const checkText=p=>{
  const summaryWords=wc(p.summary),expandedWords=wc(p.expanded),violations=forbidden.filter(rx=>rx.test(`${p.summary||''} ${p.expanded||''}`)).map(String);
  return {summaryWords,expandedWords,summaryOk:summaryWords>=35&&summaryWords<=90,expandedOk:!p.expanded||(expandedWords>=45&&expandedWords<=150),noMetadiscourse:violations.length===0,violations};
};
const rowFor=id=>Array.isArray(rows)?rows.find(x=>x.id===id):rows[id];
const items=ids.map((id,index)=>{
  const q=byId.get(id),p=batch.items[id],e=rowFor(id)||{};
  if(!q||!p)throw new Error(`Falta ${id} en banco o propuestas`);
  const media=e.media||q.v18Media||null;
  return {index:index+1,id,title:q.title,year:q.year,category:q.category,region:q.region||null,proposal:p,textCheck:checkText(p),mediaCandidate:media,evidenceStatus:e.status||null};
});
const summary={total:items.length,textContractPass:items.filter(x=>x.textCheck.summaryOk&&x.textCheck.expandedOk&&x.textCheck.noMetadiscourse).length,withMediaCandidate:items.filter(x=>x.mediaCandidate).length,withoutMediaCandidate:items.filter(x=>!x.mediaCandidate).length};
const out={schema:'que-ano-editorial-batch-v1.8.7',version:'1.8.7-draft.1',batch:'batch-02-100',generatedAt:new Date().toISOString(),summary,items};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/editorial-batch-v187.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if(summary.textContractPass<90)process.exitCode=2;
