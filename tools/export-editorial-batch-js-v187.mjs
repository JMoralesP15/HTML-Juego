import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('reports/editorial-batch-v187.json','utf8'));
const payload=JSON.stringify(data);
const code=`window.__QA_EDITORIAL_BATCH_V187__=${payload};\n(function(){const rows=new Map((window.__QA_EDITORIAL_BATCH_V187__.items||[]).map(x=>[x.id,x]));const qs=Array.isArray(window.QUESTIONS)?window.QUESTIONS:(typeof QUESTIONS!=='undefined'?QUESTIONS:[]);for(const q of qs){const item=rows.get(q.id);if(item?.mediaCandidate)q.v18Media=item.mediaCandidate;}})();\n`;
fs.writeFileSync('js/editorial-media-v187.js',code);
console.log(JSON.stringify({batch:data.batch,total:data.summary?.total,realPhotoCandidates:data.summary?.realPhotoCandidates,withoutRealPhotoCandidate:data.summary?.withoutRealPhotoCandidate},null,2));
