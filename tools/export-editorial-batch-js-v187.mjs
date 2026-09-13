import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('reports/editorial-batch-v187.json','utf8'));
const payload=JSON.stringify(data);
const code=`window.__QA_EDITORIAL_BATCH_V187__=${payload};\n`;
fs.writeFileSync('js/editorial-media-v187.js',code);
console.log(JSON.stringify({batch:data.batch,total:data.summary?.total,textContractPass:data.summary?.textContractPass,visualSearched:data.summary?.visualSearched,candidatesTotal:data.summary?.candidatesTotal,noCandidate:data.summary?.noCandidate,searchErrors:data.summary?.searchErrors,autoPublished:0},null,2));
