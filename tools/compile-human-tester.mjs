import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const input=process.argv[2];
if(!input)throw new Error('Usage: node tools/compile-human-tester.mjs review.json');
const raw=fs.readFileSync(input,'utf8'),review=JSON.parse(raw);
if(review.schema!=='que-ano-editorial-review')throw new Error('Unknown review schema');
const snapshot=path.join(root,'.review-published');fs.mkdirSync(snapshot,{recursive:true});
const ref='ee1c579ea0981329208e503292604876e81e1f4b';
const files=['content','editorial','editorial-verification-v18','editorial-v18-manual','editorial-media-v187','editorial-review-media-v187c','editorial-replacements-v187c'];
const ctx=vm.createContext({window:{},console});
for(const name of files){const file=path.join(snapshot,name+'.js');if(!fs.existsSync(file)){const res=await fetch(`https://raw.githubusercontent.com/JMoralesP15/HTML-Juego/${ref}/js/${name}.js`);if(!res.ok)throw new Error(`${name}: ${res.status}`);fs.writeFileSync(file,await res.text())}vm.runInContext(fs.readFileSync(file,'utf8'),ctx)}
const questions=vm.runInContext('QUESTIONS',ctx),media=ctx.window.__QA_EDITORIAL_REVIEW_MEDIA_V187C__?.items||{};
const items=[],excluded=[];
for(const [id,r] of Object.entries(review.records)){
  if(!['factualStatus','textStatus','mediaStatus'].every(k=>r[k]==='approved')){excluded.push({id,reason:'human_approval_incomplete'});continue}
  const q=questions.find(q=>q.id===id);if(!q)throw new Error(`Unknown approved ID ${id}`);
  const replacement=r.replacementChoice!=null?ctx.window.__QA_EDITORIAL_REPLACEMENTS_V187C__?.items?.[id]?.[r.replacementChoice]:null;
  if(r.replacementChoice!=null&&!replacement)throw new Error(`Unknown replacement: ${id}`);
  let selected;
  if(r.mediaChoice==='current')selected={src:q.v18LegacyImage||q.image,artist:q.imageCredit||'',license:q.imageLicense||'',sourcePage:q.imageSource||q.source,selectionKey:'current'};
  else selected=[...(replacement?[]:media[id]?.candidates||ctx.window.__QA_EDITORIAL_BATCH_V187__?.items?.find(x=>x.id===id)?.mediaSearch?.candidates||[]),...(r.customImages||[]).filter(c=>c.eventScope===(replacement?`replacement:${r.replacementChoice}`:'original'))].find(c=>(c.original||c.src)===r.mediaCandidateKey);
  if(replacement&&r.mediaChoice==='current')selected=null;
  if(!selected?.src||selected.rightsTier==='review_only'){excluded.push({id,reason:'selected_visual_unresolved'});continue}
  if(!/^(https:\/\/|assets\/|data:image\/(?:jpeg|png|webp);base64,)/.test(selected.src))throw new Error(`Unsafe image ${id}`);
  if(!r.edits?.summary?.trim())throw new Error(`Approved text not present: ${id}`);
  const base=replacement||r.edits;
  const edits=Object.fromEntries(['title','prompt','fact','source','sourceLabel','year','category'].filter(k=>base[k]!=null).map(k=>[k,base[k]]));
  items.push({id,...edits,learning:{summary:r.edits.summary,expanded:r.edits.expanded||'',dateNote:r.edits.dateNote||''},media:{src:selected.src,artist:selected.artist||selected.credit||'',license:selected.license||'',sourcePage:selected.sourcePage||'',description:selected.description||`Imagen seleccionada por revisión humana para ${edits.title||q.title}`,selectionKey:r.mediaCandidateKey||'current'},approvedAt:r.updatedAt});
}
if(items.length<10)throw new Error('Insufficient approved pool for daily/practice/timeline');
const release={id:'human-20260914-'+crypto.createHash('sha256').update(raw).digest('hex').slice(0,8),sourceSHA256:crypto.createHash('sha256').update(raw).digest('hex'),reviewSnapshot:ref,exportedAt:review.exportedAt,items};
fs.writeFileSync(path.join(root,'reports/human-tester-release.json'),JSON.stringify(release,null,2)+'\n');
fs.writeFileSync(path.join(root,'reports/human-tester-import.json'),JSON.stringify({total:Object.keys(review.records).length,included:items.length,excluded},null,2)+'\n');
const target=path.join(root,'js/curation-v14.js');let source=fs.readFileSync(target,'utf8').split('/* HUMAN_TESTER_RELEASE_DATA */')[0];
source+='/* HUMAN_TESTER_RELEASE_DATA */\nconst HUMAN_TESTER_RELEASE='+JSON.stringify(release)+';\n';
source+=fs.readFileSync(path.join(root,'tools/human-tester-runtime.txt'),'utf8');fs.writeFileSync(target,source);
console.log(JSON.stringify({release:release.id,included:items.length,excluded:excluded.filter(x=>x.reason!=='human_approval_incomplete')}));

