import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=JSON.parse(fs.readFileSync(path.join(root,'reports/editorial-batch-v187.json'),'utf8'));
const API='https://commons.wikimedia.org/w/api.php';
const UA='QueAnoEditorial/1.8.7 (+https://github.com/JMoralesP15/HTML-Juego)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clean=v=>String(v??'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const ext=(m,k)=>clean(m?.[k]?.value||'');
const openLicense=v=>{const x=clean(v).toLowerCase();return !/\b(?:nc|nd)\b|noncommercial|no derivatives|fair use/.test(x)&&/public domain|dominio p[uú]blico|\bcc0\b|cc[- ]?by(?:[- ]sa)?\b/.test(x)};
const badVisual=/\b(logo|logotype|poster|cover|portada|screenshot|map|mapa|diagram|diagrama|illustration|ilustracion|drawing|painting|flag|bandera|icon|seal|escudo)\b/i;

async function api(params){
  const url=`${API}?${new URLSearchParams({...params,format:'json',formatversion:'2',origin:'*'})}`;
  const res=await fetch(url,{headers:{'User-Agent':UA,'Api-User-Agent':UA,'Accept':'application/json'}});
  if(!res.ok)throw new Error(`Commons HTTP ${res.status}`);
  return res.json();
}

async function discover(item){
  const search=await api({action:'query',list:'search',srnamespace:'6',srlimit:'6',srsearch:`${item.title} ${item.year}`});
  const titles=(search?.query?.search||[]).map(x=>x.title).filter(Boolean);
  if(!titles.length)return null;
  const data=await api({action:'query',prop:'imageinfo',titles:titles.join('|'),iiprop:'url|mime|extmetadata',iiurlwidth:'1200'});
  const tokens=item.title.toLowerCase().split(/\W+/).filter(x=>x.length>3);
  const candidates=[];
  for(const page of data?.query?.pages||[]){
    const info=page.imageinfo?.[0],meta=info?.extmetadata||{};if(!info)continue;
    const license=ext(meta,'LicenseShortName')||ext(meta,'UsageTerms');if(!openLicense(license))continue;
    const description=ext(meta,'ImageDescription'),blob=`${page.title} ${description}`;if(badVisual.test(blob))continue;
    const normalized=blob.toLowerCase(),overlap=tokens.filter(t=>normalized.includes(t)).length,yearHit=blob.includes(String(item.year));
    const photoHint=/photograph|photo\b|fotograf/i.test(blob);
    const score=overlap*3+(yearHit?4:0)+(photoHint?2:0);if(score<4)continue;
    candidates.push({fileTitle:page.title,src:info.thumburl||info.url,original:info.url,sourcePage:`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_')).replace(/%3A/g,':')}`,artist:ext(meta,'Artist')||null,license,licenseUrl:ext(meta,'LicenseUrl')||null,description:description||null,score,photoTypeStatus:photoHint?'probable_photograph':'human_check_required'});
  }
  candidates.sort((a,b)=>b.score-a.score);return candidates[0]||null;
}

let searched=0,found=0;
for(const item of input.items){
  if(item.mediaCandidate)continue;
  searched++;
  try{const candidate=await discover(item);if(candidate){item.mediaCandidate=candidate;found++;}}
  catch(error){item.mediaSearchError=String(error?.message||error)}
  await sleep(180);
}
input.version='1.8.7-draft.2';
input.generatedAt=new Date().toISOString();
input.summary={...input.summary,commonsSearched:searched,commonsFound:found,withMediaCandidate:input.items.filter(x=>x.mediaCandidate).length,withoutMediaCandidate:input.items.filter(x=>!x.mediaCandidate).length,mediaPolicy:'Candidate only: human review required for relevance, contemporaneity, photographic nature and rights.'};
fs.writeFileSync(path.join(root,'reports/editorial-batch-v187.json'),JSON.stringify(input,null,2)+'\n');
console.log(JSON.stringify(input.summary,null,2));
