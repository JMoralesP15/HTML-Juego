import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ctx=vm.createContext({console,window:{},Date,Map,Set,Math,JSON,Intl,URL});
ctx.window=ctx;
for(const file of ['js/content.js','js/editorial-proposals-v181-batch1.js','js/editorial-proposals-v182-history.js','js/editorial-proposals-v182-science.js','js/editorial-proposals-v182-tech.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
}
const questions=vm.runInContext('QUESTIONS.map(q=>({...q}))',ctx);
const v181=vm.runInContext('JSON.parse(JSON.stringify(window.__QA_EDITORIAL_PROPOSALS_V181__?.items||{}))',ctx);
const v182=vm.runInContext('JSON.parse(JSON.stringify(window.__QA_EDITORIAL_PROPOSALS_V182__?.items||{}))',ctx);
const selection=JSON.parse(fs.readFileSync(path.join(root,'reports/editorial-batch02-selection.json'),'utf8'));
const evidence=JSON.parse(fs.readFileSync(path.join(root,'reports/factual-verification-v18.json'),'utf8'));
const rows=evidence.rows||evidence.items||evidence;
const byId=new Map(questions.map(q=>[q.id,q]));
const ids=Object.values(selection.categories||{}).flat();
if(ids.length!==100||new Set(ids).size!==100)throw new Error(`Selección batch-02-100 inválida: ${ids.length} ids`);

const forbidden=[/la ficha indica/i,/la ficha identifica/i,/preguntamos por/i,/la fecha es el punto de entrada/i,/contenido complementario/i,/qué fue:/i,/por qué importa:/i,/dato para recordar:/i];
const wc=v=>String(v||'').trim().split(/\s+/).filter(Boolean).length;
const checkText=(summary,expanded='')=>{
  const summaryWords=wc(summary),expandedWords=wc(expanded),violations=forbidden.filter(rx=>rx.test(`${summary||''} ${expanded||''}`)).map(String);
  return {summaryWords,expandedWords,summaryOk:summaryWords>=35&&summaryWords<=90,expandedOk:!expanded||(expandedWords>=45&&expandedWords<=150),noMetadiscourse:violations.length===0,violations};
};
const rowFor=id=>Array.isArray(rows)?rows.find(x=>x.id===id):rows[id];
const items=ids.map((id,index)=>{
  const q=byId.get(id),proposal=v182[id]||v181[id]||null,e=rowFor(id)||{};
  if(!q)throw new Error(`Falta ${id} en banco`);
  const summary=proposal?.summary||q.context||q.fact||'';
  const expanded=proposal?.expanded||q.significance||'';
  const legacyMedia=e.media||q.v18Media||null;
  return {
    index:index+1,id,title:q.title,year:q.year,category:q.category,region:q.region||null,
    entity:q.entity||null,wikidataQid:e.wikimedia?.qid||null,wikimediaPageTitle:e.wikimedia?.pageTitle||null,
    sourceUrl:e.sourceUrl||proposal?.source||q.source||null,sourceLabel:e.sourceLabel||proposal?.sourceLabel||q.sourceLabel||null,
    textSource:proposal?'proposal':'current_bank',proposal,
    learning:{summary,expanded,dateNote:proposal?.dateNote||''},
    textCheck:checkText(summary,expanded),
    legacyMediaCandidate:legacyMedia,
    mediaCandidate:null,
    evidenceStatus:e.status||null
  };
});
const contractPass=x=>x.textCheck.summaryOk&&x.textCheck.expandedOk&&x.textCheck.noMetadiscourse;
const summary={
  total:items.length,
  proposalReady:items.filter(x=>x.proposal).length,
  currentBankOnly:items.filter(x=>!x.proposal).length,
  textContractPass:items.filter(contractPass).length,
  textNeedsEdit:items.filter(x=>!contractPass(x)).length,
  legacyVisualCandidates:items.filter(x=>x.legacyMediaCandidate).length,
  realPhotoCandidates:0,
  withoutRealPhotoCandidate:items.length
};
const out={schema:'que-ano-editorial-batch-v1.8.7',version:'1.8.7-draft.1',batch:'batch-02-100',generatedAt:new Date().toISOString(),selectionRule:selection.selectionRule,summary,items};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/editorial-batch-v187.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
