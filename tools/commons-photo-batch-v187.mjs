import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=JSON.parse(fs.readFileSync(path.join(root,'reports/editorial-batch-v187.json'),'utf8'));
const COMMONS='https://commons.wikimedia.org/w/api.php';
const WIKIDATA='https://www.wikidata.org/w/api.php';
const UA='QueAnoEditorial/1.8.7b (+https://github.com/JMoralesP15/HTML-Juego)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clean=v=>String(v??'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const ext=(m,k)=>clean(m?.[k]?.value||'');
const uniq=a=>[...new Set(a.filter(Boolean))];
const stop=new Set(['primer','primera','first','the','and','for','from','with','para','con','del','las','los','una','uno','sobre','event','evento','launch','lanzamiento','year','years','ano','anos','album','film','movie','war','guerra']);
const tokens=v=>norm(v).split(' ').filter(t=>t.length>=4&&!stop.has(t));
const openLicense=v=>{const x=clean(v).toLowerCase();return !/\b(?:nc|nd)\b|noncommercial|no derivatives|fair use/.test(x)&&/public domain|dominio p[uú]blico|\bcc0\b|cc[- ]?by(?:[- ]sa)?\b/.test(x)};
const badVisual=/\b(logo|logotype|poster|afiche|cover|portada|caratula|screenshot|screen ?capture|web ?page|homepage|main ?page|map|mapa|diagram|diagrama|illustration|ilustracion|drawing|dibujo|painting|pintura|flag|bandera|icon|icono|seal|escudo|cosplay|replica|reenactment|re-enactment|recreation|commemorative|anniversary|fan ?art|collage|montage|montaje|grid|mosaic)\b/i;
const photoHint=/\b(photograph|photography|photo|photographic|fotografia|fotografica|fotografico|foto|negative|gelatin silver|press photo|archive photo)\b/i;
const physicalObjectCategories=new Set(['Tecnología','Videojuegos','Música','Cultura','Cine']);
const eventSensitiveCategories=new Set(['Historia','Chile']);

async function api(base,params,attempt=1){
  const url=`${base}?${new URLSearchParams({...params,format:'json',formatversion:'2',origin:'*'})}`;
  try{
    const res=await fetch(url,{headers:{'User-Agent':UA,'Api-User-Agent':UA,'Accept':'application/json'}});
    if(!res.ok){const err=new Error(`HTTP ${res.status}`);err.status=res.status;throw err}
    return await res.json();
  }catch(error){
    if(attempt>=3)throw error;
    await sleep(500*Math.pow(2,attempt-1));
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
  if(/^image\/(jpeg|tiff|webp)$/i.test(mime))return true;
  if(/^image\/png$/i.test(mime)&&photoHint.test(blob))return true;
  return false;
}
function classifyVisual(item,yearOriginal,exactYear){
  const delta=Number.isFinite(yearOriginal)?yearOriginal-item.year:null;
  if(Number.isFinite(delta)&&Math.abs(delta)<=5)return {visualType:'contemporaneous_documentary_photo',warning:null};
  if(Number.isFinite(delta)&&delta>5&&physicalObjectCategories.has(item.category)&&exactYear)return {visualType:'later_photo_of_original_artifact',warning:'later_photo_of_original_artifact'};
  if(Number.isFinite(delta)&&delta>12&&eventSensitiveCategories.has(item.category))return {visualType:'later_context_photo',warning:'high_temporal_delta'};
  return {visualType:'documentary_photo',warning:Number.isFinite(delta)&&Math.abs(delta)>12?'high_temporal_delta':null};
}
function scoreCandidate(item,blob,vocab,yearOriginal){
  const n=norm(blob),matched=uniq(vocab.filter(t=>n.includes(t)));
  const exactYear=new RegExp(`(^|\\D)${item.year}(\\D|$)`).test(blob);
  const hasPhotoHint=photoHint.test(blob);
  const temporalDeltaYears=Number.isFinite(yearOriginal)?yearOriginal-item.year:null;
  const contemporaneous=Number.isFinite(yearOriginal)&&Math.abs(temporalDeltaYears)<=5;
  const score=matched.length*5+(exactYear?3:0)+(hasPhotoHint?2:0)+(contemporaneous?4:0);
  return {score,matched,exactYear,hasPhotoHint,yearOriginal,temporalDeltaYears,contemporaneous};
}

async function searchTitles(query){
  const data=await api(COMMONS,{action:'query',list:'search',srnamespace:'6',srlimit:'10',srsearch:query});
  return (data?.query?.search||[]).map(x=>x.title).filter(Boolean);
}
async function discover(item,entity){
  const names=uniq([entity?.en,entity?.es,...(entity?.names||[]),item.wikimediaPageTitle,item.title]).filter(Boolean);
  const queryAttempts=[],titleSets=[];
  for(const name of names.slice(0,5)){
    for(const query of [`"${name}" ${item.year}`,`"${name}" photograph`,`"${name}" photo`]){
      try{
        const titles=await searchTitles(query);
        queryAttempts.push({query,status:'ok',resultCount:titles.length});
        titleSets.push(...titles);
      }catch(error){
        queryAttempts.push({query,status:'error',error:String(error?.message||error),httpStatus:error?.status||null});
      }
      await sleep(90);
    }
  }
  const titles=uniq(titleSets).slice(0,30);
  if(!titles.length)return {status:queryAttempts.some(x=>x.status==='error')?'error':'no_candidate',queryAttempts,candidates:[]};
  let data;
  try{
    data=await api(COMMONS,{action:'query',prop:'imageinfo',titles:titles.join('|'),iiprop:'url|mime|extmetadata',iiurlwidth:'1200',iiextmetadatalanguage:'en',iiextmetadatafilter:'LicenseShortName|UsageTerms|LicenseUrl|Artist|Credit|ImageDescription|DateTimeOriginal|DateTime|Categories'});
  }catch(error){
    queryAttempts.push({query:'imageinfo',status:'error',error:String(error?.message||error),httpStatus:error?.status||null});
    return {status:'error',queryAttempts,candidates:[]};
  }
  const vocab=semanticVocabulary(item,entity),candidates=[];
  for(const page of data?.query?.pages||[]){
    const info=page.imageinfo?.[0],meta=info?.extmetadata||{};if(!info)continue;
    const license=ext(meta,'LicenseShortName')||ext(meta,'UsageTerms');
    const description=ext(meta,'ImageDescription'),categories=ext(meta,'Categories');
    const blob=`${page.title} ${description} ${categories}`;
    if(!info.url||!openLicense(license)||badVisual.test(blob))continue;
    const mime=clean(info.mime);if(!photoMimeOk(mime,blob))continue;
    const oy=originalYear(meta),scored=scoreCandidate(item,blob,vocab,oy);
    if(scored.matched.length<1||scored.score<7)continue;
    if(Number.isFinite(scored.temporalDeltaYears)&&Math.abs(scored.temporalDeltaYears)>40&&!scored.exactYear&&eventSensitiveCategories.has(item.category))continue;
    const type=classifyVisual(item,oy,scored.exactYear),warnings=[];
    if(!Number.isFinite(oy))warnings.push('image_year_unknown');
    if(type.warning)warnings.push(type.warning);
    if(/\bcc by\b|\bcc-by\b/i.test(license))warnings.push('attribution_required');
    if(scored.matched.length===1)warnings.push('single_alias_match');
    if(!description)warnings.push('description_insufficient');
    candidates.push({
      fileTitle:page.title,mime,src:info.thumburl||info.url,original:info.url,
      sourcePage:`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_')).replace(/%3A/g,':')}`,
      artist:ext(meta,'Artist')||null,credit:ext(meta,'Credit')||null,license,licenseUrl:ext(meta,'LicenseUrl')||null,
      description:description||null,visualType:type.visualType,entityMatch:true,matchedAliases:scored.matched,
      eventYear:item.year,imageYear:scored.yearOriginal,temporalDeltaYears:scored.temporalDeltaYears,
      exactYear:scored.exactYear,contemporaneous:scored.contemporaneous,score:scored.score,rejectionWarnings:warnings,reviewRequired:true
    });
  }
  candidates.sort((a,b)=>b.score-a.score||Number(b.contemporaneous)-Number(a.contemporaneous)||Math.abs(a.temporalDeltaYears??999)-Math.abs(b.temporalDeltaYears??999));
  const top=candidates.slice(0,3);
  return {status:top.length?'found':queryAttempts.some(x=>x.status==='error')?'error':'no_candidate',queryAttempts,candidates:top};
}

const entities=await entityNames(input.items);
let searched=0,success=0,noCandidate=0,errors=0,candidatesTotal=0,candidatesContemporaneous=0,laterOriginalArtifact=0;
for(const item of input.items){
  searched++;
  try{item.mediaSearch=await discover(item,entities.get(item.wikidataQid))}
  catch(error){item.mediaSearch={status:'error',queryAttempts:[{query:'unexpected',status:'error',error:String(error?.message||error),httpStatus:error?.status||null}],candidates:[]}}
  const candidates=item.mediaSearch?.candidates||[];
  candidatesTotal+=candidates.length;
  candidatesContemporaneous+=candidates.filter(x=>x.contemporaneous).length;
  laterOriginalArtifact+=candidates.filter(x=>x.visualType==='later_photo_of_original_artifact').length;
  if(item.mediaSearch.status==='found')success++;else if(item.mediaSearch.status==='no_candidate')noCandidate++;else errors++;
  if(searched%10===0)process.stdout.write(`[${searched}/100] found: ${success}; candidates: ${candidatesTotal}; no_candidate: ${noCandidate}; errors: ${errors}\n`);
  await sleep(120);
}
input.version='1.8.7-b';
input.generatedAt=new Date().toISOString();
input.summary={...input.summary,visualSearched:searched,searchSuccess:success,noCandidate,searchErrors:errors,candidatesTotal,candidatesTechnicallyEligible:candidatesTotal,candidatesContemporaneous,laterOriginalArtifact,mediaPolicy:'Candidate discovery only. Open-license photographic candidates are ranked for human review; no candidate is auto-approved or published.'};
delete input.summary.commonsSearched;delete input.summary.commonsFound;delete input.summary.commonsErrors;delete input.summary.realPhotoCandidates;delete input.summary.withoutRealPhotoCandidate;
for(const item of input.items){delete item.mediaCandidate;delete item.mediaSearchError}
fs.writeFileSync(path.join(root,'reports/editorial-batch-v187.json'),JSON.stringify(input,null,2)+'\n');
console.log(JSON.stringify(input.summary,null,2));
