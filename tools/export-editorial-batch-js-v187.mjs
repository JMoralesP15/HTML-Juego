import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('reports/editorial-batch-v187.json','utf8'));
fs.writeFileSync('js/editorial-media-v187.js',`window.__QA_EDITORIAL_BATCH_V187__=${JSON.stringify(data)};\n`);
console.log(JSON.stringify({batch:data.batch,total:data.summary?.total,withMediaCandidate:data.summary?.withMediaCandidate},null,2));
