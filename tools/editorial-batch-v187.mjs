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
const v187=JSON.parse(fs.readFileSync(path.join(root,'data/editorial-proposals-v187-batch02.json'),'utf8')).items||{};
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
  const summaryOk=summaryWords>=35&&summaryWords<=90;
  const expandedOk=!expanded||(expandedWords>=45&&expandedWords<=150);
  const noMetadiscourse=violations.length===0;
  return {summaryWords,expandedWords,summaryOk,expandedOk,noMetadiscourse,structuralPass:summaryOk&&expandedOk&&noMetadiscourse,violations};
};
const rowFor=id=>Array.isArray(rows)?rows.find(x=>x.id===id):rows[id];
const tier=url=>String(url||'').includes('wikipedia.org')?'C':url?'B':null;
const items=ids.map((id,index)=>{
  const q=byId.get(id),baseProposal=v187[id]||v182[id]||v181[id]||null,e=rowFor(id)||{};
  if(!q)throw new Error(`Falta ${id} en banco`);
  const source=baseProposal?.source||e.sourceUrl||q.source||null;
  const sourceLabel=baseProposal?.sourceLabel||e.sourceLabel||q.sourceLabel||null;
  const proposal=baseProposal?{...baseProposal,source,sourceLabel,sourceTier:baseProposal.sourceTier||tier(source),confidence:baseProposal.confidence||'medium',confidenceReason:baseProposal.confidenceReason||'Borrador editorial con fuente factual enlazada; requiere validación humana final.'}:null;
  const summary=proposal?.summary||q.context||q.fact||'';
  const expanded=proposal?.expanded||q.significance||'';
  const legacyMedia=e.media||q.v18Media||null;
  return {
    index:index+1,id,title:q.title,year:q.year,category:q.category,region:q.region||null,
    entity:q.entity||null,wikidataQid:e.wikimedia?.qid||null,wikimediaPageTitle:e.wikimedia?.pageTitle||null,
    sourceUrl:source,sourceLabel,sourceTier:proposal?.sourceTier||tier(source),
    textSource:v187[id]?'proposal_v187':proposal?'proposal_legacy':'current_bank',proposal,
    learning:{summary,expanded,dateNote:proposal?.dateNote||''},
    textCheck:checkText(summary,expanded),
    legacyMediaCandidate:legacyMedia,
    mediaSearch:{status:'pending',queryAttempts:[],candidates:[]},
    evidenceStatus:e.status||null
  };
});
const contractPass=x=>x.textCheck.structuralPass===true;
const summary={
  total:items.length,
  proposalReady:items.filter(x=>x.proposal).length,
  currentBankOnly:items.filter(x=>!x.proposal).length,
  textContractPass:items.filter(contractPass).length,
  textNeedsEdit:items.filter(x=>!contractPass(x)).length,
  sourced:items.filter(x=>Boolean(x.sourceUrl)).length,
  sourceBlocked:items.filter(x=>!x.sourceUrl).length,
  legacyVisualCandidates:items.filter(x=>x.legacyMediaCandidate).length,
  visualSearched:0,searchSuccess:0,noCandidate:0,searchErrors:0,
  candidatesTotal:0,candidatesTechnicallyEligible:0,candidatesContemporaneous:0,laterOriginalArtifact:0,
  mediaPolicy:'Candidate discovery only. No discovered image is published or auto-approved; human review remains mandatory.'
};
const out={schema:'que-ano-editorial-batch-v1.8.7',version:'1.8.7-b',batch:'batch-02-100',generatedAt:new Date().toISOString(),selectionRule:selection.selectionRule,summary,items};
fs.writeFileSync(path.join(root,'reports/editorial-batch-v187.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
