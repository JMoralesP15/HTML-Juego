// Deterministic editorial audit for v1.4. Scores are editorial estimates, not observed recognition rates.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sandbox={console,Date,Map,Set,Math,JSON,Intl,URL,encodeURIComponent};sandbox.window=sandbox;
const context=vm.createContext(sandbox);
for(const name of ['content','editorial','content-v12','curation-v14'])vm.runInContext(fs.readFileSync(path.join(root,'js',`${name}.js`),'utf8'),context,{filename:`${name}.js`});
const questions=vm.runInContext('QUESTIONS',context);

const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
const median=xs=>{if(!xs.length)return 0;const a=[...xs].sort((x,y)=>x-y),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2};
const pct=(n,d)=>d?n/d:0;
const groups=(key)=>questions.reduce((acc,q)=>{const k=q[key]||'Sin dato';(acc[k]||(acc[k]=[])).push(q);return acc},{});
const tierStats=Object.fromEntries(['core','context','niche'].map(t=>{const xs=questions.filter(q=>q.cultureTier===t);return [t,{count:xs.length,share:pct(xs.length,questions.length)}]}));
const categoryStats=Object.fromEntries(Object.entries(groups('category')).sort((a,b)=>a[0].localeCompare(b[0],'es')).map(([category,qs])=>[category,{total:qs.length,meanScore:Number(mean(qs.map(q=>q.cultureScore)).toFixed(1)),medianScore:median(qs.map(q=>q.cultureScore)),core:qs.filter(q=>q.cultureTier==='core').length,context:qs.filter(q=>q.cultureTier==='context').length,niche:qs.filter(q=>q.cultureTier==='niche').length,nicheShare:pct(qs.filter(q=>q.cultureTier==='niche').length,qs.length)}]));
const regionCounts=Object.fromEntries(Object.entries(groups('region')).map(([r,qs])=>[r,qs.length]).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'es')));
const regionShares=Object.values(regionCounts).map(n=>n/questions.length),hhi=regionShares.reduce((s,p)=>s+p*p,0),effectiveRegions=hhi?1/hhi:0,top4=Object.entries(regionCounts).slice(0,4);
const all=questions.map(q=>({id:q.id,title:q.title,year:q.year,category:q.category,subcategory:q.subcategory||null,region:q.region||null,difficulty:q.difficulty,cultureScore:q.cultureScore,cultureTier:q.cultureTier,cultureTierLabel:q.cultureTierLabel,reason:q.cultureAssessment?.reason||'',hasSource:Boolean(q.source),hasImage:Boolean(q.image),imageType:q.imageType||null,reviewNeeded:Boolean(q.v14Context?.reviewNeeded)}));
const candidates=all.filter(q=>q.cultureTier==='niche').sort((a,b)=>a.cultureScore-b.cultureScore||a.category.localeCompare(b.category,'es')||a.year-b.year);
const contextCandidates=all.filter(q=>q.cultureTier==='context').sort((a,b)=>a.cultureScore-b.cultureScore||a.category.localeCompare(b.category,'es'));

const report={
  version:'1.4-curation-1',
  generatedAt:'deterministic-build',
  methodology:{
    status:'Editorial estimate. Not a measured probability of recognition and not a substitute for observed user testing.',
    rubric:{impact:'0–30',recognition:'0–25',persistence:'0–20',learning:'0–15',clarity:'0–10'},
    tiers:{core:'score >= 70',context:'50–69',niche:'< 50'},
    use:'Prioritize review and placement. Do not automatically delete or change historical dates from this score.'
  },
  totalQuestions:questions.length,
  tiers:tierStats,
  score:{mean:Number(mean(questions.map(q=>q.cultureScore)).toFixed(1)),median:median(questions.map(q=>q.cultureScore)),min:Math.min(...questions.map(q=>q.cultureScore)),max:Math.max(...questions.map(q=>q.cultureScore))},
  categories:categoryStats,
  geography:{regions:regionCounts,top4,top4Share:pct(top4.reduce((s,[,n])=>s+n,0),questions.length),hhi:Number(hhi.toFixed(4)),effectiveRegionCount:Number(effectiveRegions.toFixed(2)),interpretation:'HHI/effective-region count describe concentration of the bank only; they do not define a normative geographic quota.'},
  candidatesForNicheReview:candidates,
  contextRecommended:contextCandidates,
  allQuestions:all
};

const out=path.join(root,'reports','culture-curation-v14.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({totalQuestions:report.totalQuestions,tiers:report.tiers,score:report.score,geography:report.geography,candidatesForNicheReview:candidates.length},null,2));