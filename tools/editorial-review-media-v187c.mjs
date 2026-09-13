import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const feedback=JSON.parse(fs.readFileSync(path.join(root,'reports/editorial-feedback-v187c.json'),'utf8'));
const content=fs.readFileSync(path.join(root,'js/content.js'),'utf8');
const sandbox={};vm.createContext(sandbox);vm.runInContext(`${content}\n;globalThis.__QUESTIONS__=QUESTIONS;`,sandbox);
const questions=sandbox.__QUESTIONS__||[];
const byId=new Map(questions.map(q=>[q.id,q]));
const ids=feedback.ids?.badMedia||[];
const COMMONS='https://commons.wikimedia.org/w/api.php';
const WIKI={es:'https://es.wikipedia.org/w/api.php',en:'https://en.wikipedia.org/w/api.php'};
const UA='QueAnoEditorial/1.8.7c (+https://github.com/JMoralesP15/HTML-Juego)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clean=v=>String(v??'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const tokens=v=>norm(v).split(' ').filter(t=>t.length>=3&&!new Set(['the','and','para','con','del','las','los','una','uno','first','primer','primera','year','ano','años','album','film','movie','pelicula','launch','lanzamiento']).has(t));
const uniq=a=>[...new Set(a.filter(Boolean))];
const ext=(m,k)=>clean(m?.[k]?.value||'');
const openLicense=v=>{const x=clean(v).toLowerCase();return !/\b(?:nc|nd)\b|noncommercial|no derivatives|fair use/.test(x)&&/public domain|dominio p[uú]blico|\bcc0\b|cc[- ]?by(?:[- ]sa)?\b/.test(x)};
const referenceVisual=/\b(logo|logotype|poster|afiche|cover|portada|caratula|screenshot|screen ?capture|album art|box art|game cover|book cover)\b/i;
const lowValue=/\b(map|mapa|diagram|diagrama|flag|bandera|seal|escudo|cosplay|replica|reenactment|re-enactment|commemorative|anniversary|collage|montage|grid|mosaic)\b/i;
const photoHint=/\b(photograph|photography|photo|photographic|fotografia|fotográfica|fotografico|foto|negative|press photo|archive photo)\b/i;

async function api(base,params,attempt=1){
  const url=`${base}?${new URLSearchParams({...params,format:'json',formatversion:'2',origin:'*'})}`;
  try{
    const res=await fetch(url,{headers:{'User-Agent':UA,'Api-User-Agent':UA,'Accept':'application/json'}});
    if(!res.ok){const e=new Error(`HTTP ${res.status}`);e.status=res.status;throw e}
    return await res.json();
  }catch(error){
    if(attempt>=3)throw error;
    await sleep(250*Math.pow(2,attempt-1));
    return api(base,params,attempt+1);
  }
}
function originalYear(meta){const raw=ext(meta,'DateTimeOriginal')||ext(meta,'DateTime');const m=raw.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);return m?Number(m[1]):null}
function vocabulary(q){return uniq([q.title,q.entity?.replace(/-/g,' '),q.fact,q.region].flatMap(tokens))}
function semanticScore(q,blob,oy){const n=norm(blob),v=vocabulary(q),matched=uniq(v.filter(t=>n.includes(t)));const exactYear=new RegExp(`(^|\\D)${q.year}(\\D|$)`).test(blob);const delta=Number.isFinite(oy)?oy-q.year:null;const contemporaneous=Number.isFinite(delta)&&Math.abs(delta)<=5;let score=matched.length*5+(exactYear?4:0)+(photoHint.test(blob)?2:0)+(contemporaneous?5:0);if(Number.isFinite(delta)&&Math.abs(delta)>20)score-=Math.min(6,Math.floor(Math.abs(delta)/10));if(lowValue.test(blob))score-=7;return {score,matched,exactYear,delta,contemporaneous}}
function visualType(q,blob,oy,exactYear){const delta=Number.isFinite(oy)?oy-q.year:null;if(referenceVisual.test(blob))return'review_only_reference';if(Number.isFinite(delta)&&Math.abs(delta)<=5)return'contemporaneous_documentary_photo';if(Number.isFinite(delta)&&delta>5&&['Tecnología','Videojuegos','Música','Cultura','Cine'].includes(q.category)&&exactYear)return'later_photo_of_original_artifact';if(Number.isFinite(delta)&&Math.abs(delta)>12)return'contextual_photo';return'documentary_photo'}
async function commonsSearch(q){
  const plans=uniq([`"${q.title}" ${q.year}`,`"${q.title}" photograph`,`"${q.title}" photo`,q.entity?`"${q.entity.replace(/-/g,' ')}"`:null]);
  const titles=[],attempts=[];
  for(const query of plans.slice(0,4)){
    try{const d=await api(COMMONS,{action:'query',list:'search',srnamespace:'6',srlimit:'18',srsearch:query});const found=(d?.query?.search||[]).map(x=>x.title);titles.push(...found);attempts.push({source:'commons',query,status:'ok',resultCount:found.length})}catch(e){attempts.push({source:'commons',query,status:'error',error:String(e.message),httpStatus:e.status||null})}
    await sleep(25);
  }
  const selected=uniq(titles).slice(0,55);if(!selected.length)return{attempts,candidates:[]};
  let data;try{data=await api(COMMONS,{action:'query',prop:'imageinfo',titles:selected.join('|'),iiprop:'url|mime|extmetadata',iiurlwidth:'1000',iiextmetadatalanguage:'en',iiextmetadatafilter:'LicenseShortName|UsageTerms|LicenseUrl|Artist|Credit|ImageDescription|DateTimeOriginal|DateTime|Categories'})}catch(e){attempts.push({source:'commons',query:'imageinfo',status:'error',error:String(e.message),httpStatus:e.status||null});return{attempts,candidates:[]}}
  const out=[];
  for(const page of data?.query?.pages||[]){
    const info=page.imageinfo?.[0],meta=info?.extmetadata||{};if(!info?.url)continue;
    const license=ext(meta,'LicenseShortName')||ext(meta,'UsageTerms')||'Licencia no indicada';
    const description=ext(meta,'ImageDescription'),categories=ext(meta,'Categories'),blob=`${page.title} ${description} ${categories}`;
    const oy=originalYear(meta),s=semanticScore(q,blob,oy);if(s.matched.length<1||s.score<4)continue;
    const type=visualType(q,blob,oy,s.exactYear),rightsTier=openLicense(license)?'publishable':'review_only';
    if(lowValue.test(blob)&&s.score<10)continue;
    const warnings=[];if(!Number.isFinite(oy))warnings.push('image_year_unknown');if(Number.isFinite(s.delta)&&Math.abs(s.delta)>12)warnings.push('high_temporal_delta');if(referenceVisual.test(blob))warnings.push('reference_asset');if(rightsTier!=='publishable')warnings.push('rights_unresolved');if(s.matched.length===1)warnings.push('single_alias_match');
    out.push({provider:'wikimedia_commons',fileTitle:page.title,src:info.thumburl||info.url,original:info.url,sourcePage:`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_')).replace(/%3A/g,':')}`,artist:ext(meta,'Artist')||null,credit:ext(meta,'Credit')||null,license,licenseUrl:ext(meta,'LicenseUrl')||null,description:description||null,visualType:type,rightsTier,eventYear:q.year,imageYear:oy,temporalDeltaYears:s.delta,matchedAliases:s.matched,score:s.score,rejectionWarnings:warnings,reviewRequired:true});
  }
  return{attempts,candidates:out};
}
async function wikipediaSearch(q,lang){
  const attempts=[],out=[];const query=q.title;
  try{
    const d=await api(WIKI[lang],{action:'query',generator:'search',gsrnamespace:'0',gsrlimit:'6',gsrsearch:query,prop:'pageimages|info',inprop:'url',piprop:'thumbnail|original|name',pithumbsize:'1000'});
    const pages=d?.query?.pages||[];attempts.push({source:`wikipedia_${lang}`,query,status:'ok',resultCount:pages.length});
    for(const p of pages){const src=p.thumbnail?.source||p.original?.source;if(!src||!p.fullurl)continue;const blob=`${p.title} ${p.pageimage||''}`,s=semanticScore(q,blob,null);if(s.matched.length<1)continue;out.push({provider:`wikipedia_${lang}`,fileTitle:p.pageimage||p.title,src,original:p.original?.source||src,sourcePage:p.fullurl,artist:null,credit:`Wikipedia ${lang.toUpperCase()} · página ${p.title}`,license:'Derechos no resueltos en descubrimiento automático',licenseUrl:null,description:`Imagen principal asociada a la página ${p.title}.`,visualType:'review_only_reference',rightsTier:'review_only',eventYear:q.year,imageYear:null,temporalDeltaYears:null,matchedAliases:s.matched,score:s.score+2,rejectionWarnings:['rights_unresolved','review_only_reference','image_year_unknown'],reviewRequired:true});}
  }catch(e){attempts.push({source:`wikipedia_${lang}`,query,status:'error',error:String(e.message),httpStatus:e.status||null})}
  return{attempts,candidates:out};
}
function dedupeAndRank(candidates){const seen=new Set(),out=[];for(const c of candidates.sort((a,b)=>b.score-a.score||Number(b.rightsTier==='publishable')-Number(a.rightsTier==='publishable')||Number(b.visualType==='contemporaneous_documentary_photo')-Number(a.visualType==='contemporaneous_documentary_photo'))){const key=c.original||c.src;if(!key||seen.has(key))continue;seen.add(key);out.push(c);if(out.length>=6)break}return out}
const items={};let searched=0,found=0,noCandidate=0,errors=0,totalCandidates=0,publishable=0,reviewOnly=0;
for(const id of ids){const q=byId.get(id);if(!q){items[id]={status:'missing_question',candidates:[],queryAttempts:[]};errors++;continue}searched++;let attempts=[],candidates=[];try{const c=await commonsSearch(q);attempts.push(...c.attempts);candidates.push(...c.candidates);if(candidates.length<4){const es=await wikipediaSearch(q,'es');attempts.push(...es.attempts);candidates.push(...es.candidates)}if(candidates.length<4){const en=await wikipediaSearch(q,'en');attempts.push(...en.attempts);candidates.push(...en.candidates)}}catch(e){attempts.push({source:'unexpected',query:q.title,status:'error',error:String(e.message)})}
  const top=dedupeAndRank(candidates);const hasError=attempts.some(x=>x.status==='error');const status=top.length?'found':hasError?'error':'no_candidate';items[id]={id,title:q.title,year:q.year,category:q.category,status,queryAttempts:attempts,candidates:top};if(top.length)found++;else if(status==='no_candidate')noCandidate++;else errors++;totalCandidates+=top.length;publishable+=top.filter(x=>x.rightsTier==='publishable').length;reviewOnly+=top.filter(x=>x.rightsTier==='review_only').length;if(searched%10===0)console.log(`[${searched}/${ids.length}] found=${found} candidates=${totalCandidates} errors=${errors}`);await sleep(35)}
const output={schema:'que-ano-editorial-review-media-v1.8.7-c',version:'1.8.7-c',generatedAt:new Date().toISOString(),policy:'Expanded candidate discovery for human comparison. rightsTier=review_only candidates may be shown in the review console but are blocked from automatic publication.',summary:{targetIds:ids.length,searched,found,noCandidate,errors,totalCandidates,publishable,reviewOnly,maxPerEvent:6},items};
fs.writeFileSync(path.join(root,'reports/editorial-review-media-v187c.json'),JSON.stringify(output,null,2)+'\n');
fs.writeFileSync(path.join(root,'js/editorial-review-media-v187c.js'),`/* generated by tools/editorial-review-media-v187c.mjs */\nwindow.__QA_EDITORIAL_REVIEW_MEDIA_V187C__=${JSON.stringify(output)};\n`);
console.log(JSON.stringify(output.summary,null,2));
