import fs from 'node:fs';
const root=new URL('../',import.meta.url),release=JSON.parse(fs.readFileSync(new URL('reports/human-tester-release.json',root)));
const queue=[...release.items],results=[];
await Promise.all(Array.from({length:4},async()=>{while(queue.length){const item=queue.shift(),url=item.media.src;
  if(url.startsWith('assets/')){results.push({id:item.id,status:fs.existsSync(new URL(url,root))?'local_present':'missing'});continue}
  if(url.startsWith('data:image/')){results.push({id:item.id,status:'embedded'});continue}
  try{const r=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'Mozilla/5.0'}});const type=r.headers.get('content-type')||'';await r.body?.cancel();results.push({id:item.id,status:r.ok&&type.startsWith('image/')?'reachable':'unavailable',http:r.status,contentType:type})}catch(e){results.push({id:item.id,status:'unavailable',error:e.name})}
}}));
const report={checkedAt:new Date().toISOString(),method:'GET headers, body cancelled; availability does not verify browser decode or rights',results:results.sort((a,b)=>a.id.localeCompare(b.id))};
fs.writeFileSync(new URL('reports/human-tester-media-health.json',root),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(results.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{})));

