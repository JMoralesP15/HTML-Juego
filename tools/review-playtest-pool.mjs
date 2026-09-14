import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),context=vm.createContext({window:{},console,URL,Date,Map,Set,Math,JSON,Intl});
for(const name of ['content','editorial','editorial-verification-v18','editorial-v18-manual','content-v12','curation-v14'])vm.runInContext(fs.readFileSync(new URL(`js/${name}.js`,root),'utf8'),context);
const bank=vm.runInContext('QUESTIONS',context),release=JSON.parse(fs.readFileSync(new URL('reports/human-tester-release.json',root)));
const rows=release.items.map(item=>({...bank.find(q=>q.id===item.id),...item}));
const countBy=key=>rows.reduce((m,q)=>(m[q[key]]=(m[q[key]]||0)+1,m),{});
const report={scope:'Editorial relevance and presentation audit, not independent historical fact verification',sample:'Qualitative feedback from two people; not a representative sample',events:rows.length,categories:countBy('category'),difficulty:countBy('difficulty'),flags:rows.flatMap(q=>{
 const issues=[];if((q.prompt||'').includes(String(q.year)))issues.push('question_reveals_year');
 if(/la misma ficha|la fecha concreta registrada|figura fechad/i.test(q.learning.summary))issues.push('editorial_metadiscourse');
 if(q.media.selectionKey==='current')issues.push('legacy_visual_human_approved_review_photo_preference');
 if(q.cultureTier==='niche')issues.push('prior_curation_niche_classification_check_against_human_preference');
 return issues.length?[{id:q.id,title:q.title,issues}]:[];
}),decision:'Keep human approvals; allow interests, diversify daily categories, explicitly label short pools. Flagged items require editorial judgement rather than automatic replacement.'};
fs.writeFileSync(new URL('reports/playtest-pool-review.json',root),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));

