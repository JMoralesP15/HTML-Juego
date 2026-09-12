// QUÉ AÑO v1.8 — reproducible factual corroboration and open-media batch pipeline.
// Automated Wikimedia evidence NEVER promotes editorialVerified. Manual verification remains explicit in editorial.js.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const USER_AGENT='QueAnoEditorial/1.8 (https://github.com/JMoralesP15/HTML-Juego)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clean=v=>String(v??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const chunk=(a,n)=>Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,(i+1)*n));

async function jsonFetch(url,attempt=1){
  try{
    const res=await fetch(url,{headers:{'User-Agent':USER_AGENT,'Api-User-Agent':USER_AGENT,'Accept':'application/json'}});
    if(!res.ok)throw new Error(`HTTP ${res.status} ${url}`);
    return await res.json();
  }catch(error){
    if(attempt>=3)throw error;
    await sleep(500*attempt);
    return jsonFetch(url,attempt+1);
  }
}

function loadQuestions(){
  const sandbox={console,Date,Map,Set,Math,JSON,Intl,URL,encodeURIComponent};sandbox.window=sandbox;
  const ctx=vm.createContext(sandbox);
  for(const name of ['content','editorial'])vm.runInContext(fs.readFileSync(path.join(root,'js',`${name}.js`),'utf8'),ctx,{filename:`${name}.js`});
  return vm.runInContext('QUESTIONS.map(q=>({...q}))',ctx);
}

const questions=loadQuestions();
const originalYears=Object.fromEntries(questions.map(q=>[q.id,q.year]));
const propertyNames={P571:'inicio/fundación',P575:'descubrimiento o invención',P577:'publicación/estreno',P580:'inicio',P585:'fecha del acontecimiento'};
const relationNames={P112:'fundador',P170:'creador',P50:'autor',P57:'director',P176:'fabricante',P123:'editorial',P264:'sello',P17:'país',P276:'lugar',P495:'país de origen'};
const relationPriority=['P112','P170','P50','P57','P176','P123','P264','P276','P17','P495'];
const temporalPriority=q=>{
  const kind=norm(q.kind);
  if(/fundacion|creacion|inicio/.test(kind))return ['P571','P580','P585','P577','P575'];
  if(/publicacion|estreno|lanzamiento|edicion|debut/.test(kind))return ['P577','P571','P585','P580','P575'];
  if(/descubrimiento|invencion/.test(kind))return ['P575','P585','P577','P571','P580'];
  return ['P585','P580','P571','P577','P575'];
};
function wikiInfo(source){
  try{
    const u=new URL(source);if(!/(^|\.)wikipedia\.org$/i.test(u.hostname))return null;
    const m=u.pathname.match(/^\/wiki\/(.+)$/);if(!m)return null;
    return {host:u.hostname,title:decodeURIComponent(m[1]).replace(/_/g,' '),api:`https://${u.hostname}/w/api.php`};
  }catch{return null}
}
function timeValue(claim){const v=claim?.mainsnak?.datavalue?.value;return v&&typeof v==='object'&&typeof v.time==='string'?v:null}
function timeYear(v){const m=String(v?.time||'').match(/^([+-])(\d{4,})-/);if(!m)return null;const n=Number(m[2]);return m[1]==='-'?-n:n}
const MONTHS=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function formatExactDate(v){
  if(!v||Number(v.precision)<10)return '';
  const m=String(v.time).match(/^\+(\d{4,})-(\d{2})-(\d{2})/);if(!m)return '';
  const year=Number(m[1]),month=Number(m[2]),day=Number(m[3]);
  if(month<1||month>12)return '';
  if(Number(v.precision)>=11&&day>0)return `${day} de ${MONTHS[month-1]} de ${year}`;
  return `${MONTHS[month-1]} de ${year}`;
}
function claimEntityId(claim){const v=claim?.mainsnak?.datavalue?.value;return v&&typeof v==='object'&&v['entity-type']==='item'&&v.id?v.id:null}
function firstLabel(entity){return clean(entity?.labels?.es?.value||entity?.labels?.en?.value||'')}
function getClaims(entity,prop){return Array.isArray(entity?.claims?.[prop])?entity.claims[prop]:[]}
function sourceLabelFor(page){return page?.title?`Wikipedia · ${page.title}`:null}

const rows=new Map(questions.map(q=>[q.id,{id:q.id,title:q.title,year:q.year,category:q.category,kind:q.kind,region:q.region||null,status:q.editorialVerified?'manual_verified':'needs_review',manualVerified:Boolean(q.editorialVerified),sourceUrl:q.source||null,sourceLabel:q.sourceLabel||null,wikimedia:null,evidence:{},detail:null,media:null,issues:[]}]))

// Phase 1: resolve exact Wikipedia pages in deterministic batches.
const groups=new Map();
for(const q of questions){if(q.editorialVerified)continue;const w=wikiInfo(q.source);if(!w)continue;const arr=groups.get(w.host)||[];arr.push({q,w});groups.set(w.host,arr)}
const pageById=new Map();
for(const [host,items] of groups){
  for(const batch of chunk(items,25)){
    const p=new URLSearchParams({action:'query',format:'json',formatversion:'2',redirects:'1',prop:'extracts|pageprops|pageimages',exintro:'1',explaintext:'1',piprop:'name|original|thumbnail',pithumbsize:'1200',titles:batch.map(x=>x.w.title).join('|'),origin:'*'});
    const data=await jsonFetch(`https://${host}/w/api.php?${p}`);
    const remap=new Map();
    for(const n of data?.query?.normalized||[])remap.set(norm(n.from),n.to);
    for(const r of data?.query?.redirects||[])remap.set(norm(r.from),r.to);
    const pages=data?.query?.pages||[];
    for(const item of batch){
      let target=remap.get(norm(item.w.title))||item.w.title;
      target=remap.get(norm(target))||target;
      const page=pages.find(x=>norm(x.title)===norm(target))||pages.find(x=>norm(x.title)===norm(item.w.title));
      const row=rows.get(item.q.id);
      if(!page||page.missing){row.issues.push('wikipedia_page_unresolved');continue}
      pageById.set(item.q.id,{...page,host});
      row.sourceLabel=sourceLabelFor(page);
      row.wikimedia={host,pageTitle:page.title,qid:page.pageprops?.wikibase_item||null,introYearMention:new RegExp(`(^|\\D)${item.q.year}(\\D|$)`).test(page.extract||''),pageImage:page.pageimage||null};
      row.status='item_specific_reference';
    }
    await sleep(80);
  }
}

// Phase 2: load Wikidata entities and inspect explicit temporal claims.
const qids=[...new Set([...pageById.values()].map(p=>p.pageprops?.wikibase_item).filter(Boolean))];
const entities={};
for(const batch of chunk(qids,40)){
  const p=new URLSearchParams({action:'wbgetentities',format:'json',ids:batch.join('|'),props:'claims|labels|descriptions',languages:'es|en',languagefallback:'1',origin:'*'});
  const data=await jsonFetch(`https://www.wikidata.org/w/api.php?${p}`);Object.assign(entities,data.entities||{});await sleep(80);
}
const relatedIds=new Set();
for(const q of questions){
  if(q.editorialVerified)continue;const row=rows.get(q.id),qid=row.wikimedia?.qid,entity=qid&&entities[qid];if(!entity)continue;
  const temporal=[];let match=null;
  for(const prop of temporalPriority(q)){
    for(const claim of getClaims(entity,prop)){
      const value=timeValue(claim);if(!value)continue;const year=timeYear(value);temporal.push({property:prop,label:propertyNames[prop],year,precision:value.precision,exactDate:formatExactDate(value)});
      if(!match&&year===q.year)match={property:prop,label:propertyNames[prop],value,exactDate:formatExactDate(value)};
    }
  }
  row.evidence.temporalClaims=temporal;
  if(match){row.status='structured_corroborated';row.evidence.yearMatch={property:match.property,label:match.label,year:q.year,exactDate:match.exactDate||null}}
  else if(temporal.length){row.status='needs_review';row.issues.push('temporal_claims_do_not_match_expected_year')}
  for(const prop of relationPriority){const id=getClaims(entity,prop).map(claimEntityId).find(Boolean);if(id){relatedIds.add(id);row.evidence.related={property:prop,label:relationNames[prop],id};break}}
}
const relatedEntities={};
for(const batch of chunk([...relatedIds],50)){
  const p=new URLSearchParams({action:'wbgetentities',format:'json',ids:batch.join('|'),props:'labels',languages:'es|en',languagefallback:'1',origin:'*'});
  const data=await jsonFetch(`https://www.wikidata.org/w/api.php?${p}`);Object.assign(relatedEntities,data.entities||{});await sleep(80);
}
for(const q of questions){
  const row=rows.get(q.id);if(row.status!=='structured_corroborated')continue;
  const parts=[];const exact=row.evidence.yearMatch?.exactDate;
  if(exact)parts.push(`La fecha estructurada sitúa este hito el ${exact}.`);
  const rel=row.evidence.related,label=rel&&firstLabel(relatedEntities[rel.id]);
  if(label&&norm(label)!==norm(q.title)&&!norm(q.title).includes(norm(label))){parts.push(`El registro identifica ${rel.label==='país'||rel.label==='país de origen'||rel.label==='lugar'?'como '+rel.label+' a':'a'} ${label}${rel.label==='país'||rel.label==='país de origen'||rel.label==='lugar'?'':` como ${rel.label}`}.`)}
  const detail=clean(parts.join(' '));
  const existing=norm(`${q.title} ${q.prompt} ${q.fact||''} ${q.context||''}`);
  if(detail&&detail.length>=45&&!existing.includes(norm(detail)))row.detail=detail;
}

// Phase 3: inspect exact article lead images and retain only open-licensed, non-generic candidates.
const imageCandidates=[];
for(const q of questions){const page=pageById.get(q.id);if(!page?.pageimage)continue;const file=/^(File|Archivo):/i.test(page.pageimage)?page.pageimage:`File:${page.pageimage}`;imageCandidates.push({q,page,file,host:page.host})}
const imageGroups=new Map();for(const x of imageCandidates){const a=imageGroups.get(x.host)||[];a.push(x);imageGroups.set(x.host,a)}
const badFile=/\b(logo|logotipo|poster|p[oó]ster|cover|portada|car[aá]tula|icon|icono|flag|bandera|seal|sello|map|mapa|escudo)\b/i;
const allowedLicense=value=>{const x=clean(value).toLowerCase();if(/\b(nc|nd)\b|noncommercial|no derivatives/.test(x))return false;return /public domain|dominio p[uú]blico|\bpd\b|\bcc0\b|cc[- ]?by(?:[- ]sa)?\b/.test(x)};
for(const [host,items] of imageGroups){
  for(const batch of chunk(items,5)){
    const p=new URLSearchParams({action:'query',format:'json',formatversion:'2',prop:'imageinfo',iiprop:'url|mime|size|extmetadata',iiurlwidth:'1200',iiextmetadatalanguage:'es',iiextmetadatafilter:'LicenseShortName|LicenseUrl|Artist|Credit|ImageDescription',titles:batch.map(x=>x.file).join('|'),origin:'*'});
    const data=await jsonFetch(`https://${host}/w/api.php?${p}`);const pages=data?.query?.pages||[];
    for(const item of batch){
      const f=pages.find(x=>norm(x.title.replace(/^(File|Archivo):/i,''))===norm(item.file.replace(/^(File|Archivo):/i,'')));const info=f?.imageinfo?.[0],meta=info?.extmetadata||{};const row=rows.get(item.q.id);
      if(!info){continue}
      const license=clean(meta.LicenseShortName?.value),description=clean(meta.ImageDescription?.value),artist=clean(meta.Artist?.value||meta.Credit?.value||'');
      if(badFile.test(item.file)||badFile.test(description)){row.issues.push('lead_image_rejected_generic_asset');continue}
      if(!allowedLicense(license)){row.issues.push('lead_image_rejected_license');continue}
      if(Number(info.width||0)<640){row.issues.push('lead_image_rejected_resolution');continue}
      const src=info.thumburl||info.url;if(!/^https:\/\//.test(src||'')){continue}
      row.media={src,sourcePage:info.descriptionurl||`https://${host}/wiki/${encodeURIComponent(f.title.replace(/ /g,'_'))}`,artist:artist||'Autor indicado en la ficha del archivo',license,licenseUrl:clean(meta.LicenseUrl?.value)||null,description:description||`Imagen principal abierta asociada a ${item.page.title}`,fileTitle:f.title,selectionMethod:'exact_article_lead_open_license',articleTitle:item.page.title,width:info.width||null,height:info.height||null,mime:info.mime||null};
    }
    await sleep(120);
  }
}

// Manual rows keep their stronger v1.7 status and existing editorial content.
for(const q of questions){const row=rows.get(q.id);if(q.editorialVerified){row.status='manual_verified';row.sourceLabel=q.sourceLabel;row.evidence={manualSource:q.source};row.detail=null}}

const evidence=Object.fromEntries([...rows].map(([id,row])=>[id,row]));
const counts=[...rows.values()].reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});
const report={version:'1.8.0-beta.1',generatedAt:new Date().toISOString(),methodology:{manual_verified:'Explicit editorial review from editorial.js only.',structured_corroborated:'Expected year matches a relevant Wikidata time claim attached to the exact Wikipedia topic page. This is corroboration, not independent manual verification.',item_specific_reference:'Exact topic page resolved but no relevant structured year match was found.',needs_review:'Unresolved source or relevant structured dates did not match the game year.',media:'Only exact article lead images with explicit PD/CC0/CC BY/CC BY-SA metadata, adequate resolution and non-generic filename/description are accepted.'},totals:{questions:questions.length,...counts,details:[...rows.values()].filter(r=>r.detail).length,acceptedMedia:[...rows.values()].filter(r=>r.media).length,issues:[...rows.values()].filter(r=>r.issues.length).length},rows:[...rows.values()]};

const js=`/* QUÉ AÑO v1.8 — GENERATED factual evidence overlay.\n * Do not hand-edit: run tools/factual-enrichment-v18.mjs. Automated corroboration never sets editorialVerified.\n */\nconst QA_V18_EVIDENCE=${JSON.stringify(evidence,null,2)};\nfor(const q of QUESTIONS){\n  const e=QA_V18_EVIDENCE[q.id];\n  if(!e)continue;\n  q.v18Evidence=e;\n  if(e.sourceLabel)q.sourceLabel=e.sourceLabel;\n  if(e.detail&&!q.context)q.context=e.detail;\n  if(e.media)q.v18Media=e.media;\n}\nwindow.__QA_V18_EVIDENCE__={version:'1.8.0-beta.1',rows:QA_V18_EVIDENCE};\n`;
fs.writeFileSync(path.join(root,'js','editorial-verification-v18.js'),js);
const out=path.join(root,'reports');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'factual-verification-v18.json'),JSON.stringify(report,null,2)+'\n');

if(questions.length!==300||questions.some(q=>originalYears[q.id]!==q.year))throw new Error('Historical identity/year invariant failed');
console.log(JSON.stringify(report.totals,null,2));
