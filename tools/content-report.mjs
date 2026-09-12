// v1.7 content baseline: provenance and distribution without synthetic coverage targets.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sandbox={console,Date,Map,Set,Math,JSON,Intl,URL,encodeURIComponent};sandbox.window=sandbox;
const context=vm.createContext(sandbox);
for(const name of ['content','editorial','content-v12','curation-v14'])vm.runInContext(fs.readFileSync(path.join(root,'js',`${name}.js`),'utf8'),context,{filename:`${name}.js`});
const questions=vm.runInContext('QUESTIONS',context);
const countBy=key=>Object.fromEntries([...questions.reduce((m,q)=>{const k=q[key]||'Sin dato';m.set(k,(m.get(k)||0)+1);return m},new Map())].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]),'es')));
const generated=q=>Boolean(q.v12GeneratedImage||q.v14GeneratedFallback||String(q.image||'').startsWith('data:image/svg+xml'));
const regions=countBy('region'),top4=Object.entries(regions).slice(0,4),unverified=questions.filter(q=>!q.editorialVerified);
const report={
  version:'1.7-content-provenance-1',
  methodology:{status:'Inventory, not factual verification.',policy:'No image/context quota is filled with generated material. Missing media is allowed.',review:'editorialVerified is the only verification flag.'},
  totalQuestions:questions.length,categories:countBy('category'),difficulties:countBy('difficulty'),regions,
  regionConcentration:{top4,top4Count:top4.reduce((s,[,n])=>s+n,0),top4Share:top4.reduce((s,[,n])=>s+n,0)/questions.length},
  coverage:{
    sources:questions.filter(q=>q.source).length,
    explicitLearningText:questions.filter(q=>q.context||q.fact||q.significance).length,
    withImage:questions.filter(q=>q.image).length,
    documentaryImages:questions.filter(q=>q.image&&q.imageType==='documentary').length,
    generatedImages:questions.filter(generated).length,
    explicitExtendedContext:questions.filter(q=>q.extendedContext).length,
    editorialVerified:questions.length-unverified.length,
    editorialNeedsReview:unverified.length
  },
  pendingReview:unverified.map(q=>({id:q.id,title:q.title,category:q.category,region:q.region||null,source:q.source||null,sourceLabel:q.sourceLabel||null,image:q.image?{type:q.imageType||null,generated:generated(q)}:null})).sort((a,b)=>a.category.localeCompare(b.category,'es')||a.id.localeCompare(b.id))
};
const out=path.join(root,'reports');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'content-metrics.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({version:report.version,totalQuestions:report.totalQuestions,regionConcentration:report.regionConcentration,coverage:report.coverage},null,2));
