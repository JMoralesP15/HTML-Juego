import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=JSON.parse(fs.readFileSync(path.join(root,'reports/editorial-batch-v187.json'),'utf8'));
const COMMONS='https://commons.wikimedia.org/w/api.php';
const WIKIDATA='https://www.wikidata.org/w/api.php';
const UA='QueAnoEditorial/1.8.7 (+https://github.com/JMoralesP15/HTML-Juego)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clean=v=>String(v??'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const ext=(m,k)=>clean(m?.[k]?.value||'');
const uniq=a=>[...new Set(a.filter(Boolean))];
const stop=new Set(['primer','primera','first','the','and','for','from','with','para','con','del','las','los','una','uno','sobre','event','evento','launch','lanzamiento','year','years','ano','anos','album','film','movie','war','guerra']);
const tokens=v=>norm(v).split(' ').filter(t=>t.length>=4&&!stop.has(t));
const openLicense=v=>{const x=clean(v).toLowerCase();return !/\b(?:nc|nd)\b|noncommercial|no derivatives|fair use/.test(x)&&/public domain|dominio p[uú]blico|\bcc0\b|cc[- ]?by(?:[- ]sa)?\b/.test(x)};
const badVisual=/\b(logo|logotype|poster|afiche|cover|portada|caratula|screenshot|screen ?capture|web ?page|homepage|main ?page|map|mapa|diagram|diagrama|illustration|ilustracion|drawing|dibujo|painting|pintura|flag|bandera|icon|icono|seal|escudo|cosplay|replica|reenactment|re-enactment|recreation|commemorative|anniversary|fan ?art)\b/i;
const photoHint=/\b(photograph|photography|photo|photographic|fotografia|fotografica|fotografico|foto|negative|gelatin silver|press photo|archive photo)\b/i;

async function api(base,params,attempt=1){
  try{
    const url=`${base}?${new URLSearchParams({...params,format:'json',formatversion:'2',origin:'*'})}`;
    const res=await fetch(url,{headers:{'User-Agent':UA,'Api-User-Agent':UA,'Accept':'application/json'}});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }catch(error){
    if(attempt>=3)throw error;
    await sleep(500*attempt);
    return api(base,params,attempt+1);
  }
}

async function entityNames(items){
  const qids=uniq(items.map(x=>x.wikidataQid));
  const out=new Map();
  for(let i=0;i<qids.length;i+=50){
    const chunk=qids.slice(i,i+50);
    const data=await api(WIKIDATA,{action:'wbgetentities',ids:chunk.join('|'),props:'labels|aliases',languages:'en|es'});
    for(const qid of chunk){
      const e=data?.entities?.[qid]||{};
      const en=e.labels?.en?.value||null,es=e.labels?.es?.value||null;
      const aliases=[...(e.aliases?.en||[]),...(e.aliases?.es||[])].map(x=>x.value);
      out.set(qid,{en,es,names:uniq([en,es,...aliases])});
    }
  }
  return out;
}

function originalYear(meta){
  const raw=ext(meta,'DateTimeOriginal')||ext(meta,'DateTime');
  const m=raw.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
  return m?Number(m[1]):null;
}
function semanticVocabulary(item,entity){
  return uniq([item.title,item.wikimediaPageTitle,item.entity?.replace(/-/g,' '),...(entity?.names||[])]).flatMap(tokens);
}
function photoMimeOk(mime,blob){
  if(/^image\/(jpeg|tiff)$/i.test(mime))return true;
  if(/^image\/png$/i.test(mime)&&photoHint.test(blob))return true;
  return false;
}
function scoreCandidate(item,blob,vocab,yearOriginal){
  const n=norm(blob),matched=uniq(vocab.filter(t=>n.includes(t)));
  const exactYear=new RegExp(`(^|\\D)${item.year}(\\D|$)`).test(blob);
  const hasPhotoHint=photoHint.test(blob);
  const contemporaneous=Number.isFinite(yearOriginal)&&Math.abs(yearOriginal-item.year)<=5;
  const score=matched.length*5+(exactYear?3:0)+(hasPhotoHint?2:0)+(contemporaneous?2:0);
  return {score,matched,exactYear,hasPhotoHint,yearOriginal,contemporaneous};
}

async function searchTitles(query){
  const data=await api(COMMONS,{action:'query',list:'search',srnamespace:'6',srlimit:'8',srsearch:query});
  return (data?.query?.search||[]).map(x=>x.title).filter(Boolean);
}
async function discover(item,entity){
  const searchNames=uniq([entity?.en,entity?.es,item.wikimediaPageTitle,item.title]).slice(0,3);
  const titleSets=[];
  for(const name of searchNames){
    titleSets.push(...await searchTitles(`"${name}" ${item.year}`));
    await sleep(80);
  }
  const titles=uniq(titleSets).slice(0,16);
  if(!titles.length)return null;
  const data=await api(COMMONS,{action:'query',prop:'imageinfo',titles:titles.join('|'),iiprop:'url|mime|extmetadata',iiurlwidth:'1200',iiextmetadatalanguage:'en',iiextmetadatafilter:'LicenseShortName|UsageTerms|LicenseUrl|Artist|Credit|ImageDescription|DateTimeOriginal|DateTime|Categories'});
  const vocab=semanticVocabulary(item,entity),candidates=[];
  for(const page of data?.query?.pages||[]){
    const info=page.imageinfo?.[0],meta=info?.extmetadata||{};if(!info)continue;
    const license=ext(meta,'LicenseShortName')||ext(meta,'UsageTerms');if(!openLicense(license))continue;
    const description=ext(meta,'ImageDescription'),categories=ext(meta,'Categories');
    const blob=`${page.title} ${description} ${categories}`;
    if(badVisual.test(blob))continue;
    const mime=clean(info.mime);if(!photoMimeOk(mime,blob))continue;
    const oy=originalYear(meta),scored=scoreCandidate(item,blob,vocab,oy);
    if(scored.matched.length<1||scored.score<7)continue;
    if(Number.isFinite(oy)&&Math.abs(oy-item.year)>12&&!scored.exactYear)continue;
    candidates.push({
      fileTitle:page.title,mime,
      src:info.thumburl||info.url,original:info.url,
      sourcePage:`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_')).replace(/%3A/g,':')}`,
      artist:ext(meta,'Artist')||null,credit:ext(meta,'Credit')||null,
      license,licenseUrl:ext(meta,'LicenseUrl')||null,
      description:description||null,dateOriginal:ext(meta,'DateTimeOriginal')||null,
      score:scored.score,matchedEntityTokens:scored.matched,
      exactYear:scored.exactYear,originalYear:scored.yearOriginal,
      contemporaneous:scored.contemporaneous,
      photoTypeStatus:'probable_real_photograph',
      reviewRequired:true
    });
  }
  candidates.sort((a,b)=>b.score-a.score||Number(b.contemporaneous)-Number(a.contemporaneous)||Number(b.exactYear)-Number(a.exactYear));
  return candidates[0]||null;
}

const entities=await entityNames(input.items);
let searched=0,found=0,errors=0;
for(const item of input.items){
  searched++;
  try{
    const candidate=await discover(item,entities.get(item.wikidataQid));
    item.mediaCandidate=candidate;
    if(candidate)found++;
  }catch(error){item.mediaCandidate=null;item.mediaSearchError=String(error?.message||error);errors++}
  if(searched%10===0)process.stdout.write(`[${searched}/100] real-photo candidates: ${found}\n`);
  await sleep(120);
}
input.version='1.8.7-draft.3';
input.generatedAt=new Date().toISOString();
input.summary={...input.summary,commonsSearched:searched,commonsFound:found,commonsErrors:errors,realPhotoCandidates:found,withoutRealPhotoCandidate:input.items.length-found,mediaPolicy:'High-precision discovery only. Candidate must have an open reusable license, photographic MIME/evidence and semantic entity overlap. Human approval remains mandatory for relevance, contemporaneity and rights.'};
delete input.summary.withMediaCandidate;delete input.summary.withoutMediaCandidate;
fs.writeFileSync(path.join(root,'reports/editorial-batch-v187.json'),JSON.stringify(input,null,2)+'\n');
console.log(JSON.stringify(input.summary,null,2));
