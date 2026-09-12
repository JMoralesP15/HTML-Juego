// QUÉ AÑO v1.8 — static quality gate for generated factual evidence and media.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sandbox={console,Date,Map,Set,Math,JSON,Intl,URL,encodeURIComponent};sandbox.window=sandbox;
const ctx=vm.createContext(sandbox);
for(const name of ['content','editorial','editorial-verification-v18'])vm.runInContext(fs.readFileSync(path.join(root,'js',`${name}.js`),'utf8'),ctx,{filename:`${name}.js`});
const questions=vm.runInContext('QUESTIONS',ctx),evidence=vm.runInContext('QA_V18_EVIDENCE',ctx);
const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const openLicense=v=>{const x=clean(v).toLowerCase();return !/\b(nc|nd)\b|noncommercial|no derivatives/.test(x)&&/public domain|dominio p[uú]blico|\bpd\b|\bcc0\b|cc[- ]?by(?:[- ]sa)?\b/.test(x)};
const genericText=/marc[oó] un antes y un despu[eé]s|fue muy importante|acontecimiento importante|hito importante|tuvo un gran impacto/i;
const ids=new Set(questions.map(q=>q.id));
const rows=questions.map(q=>({q,e:evidence[q.id]}));
const missingEvidence=rows.filter(x=>!x.e).map(x=>x.q.id);
const extraEvidence=Object.keys(evidence).filter(id=>!ids.has(id));
const yearMismatches=rows.filter(x=>x.e&&x.e.year!==x.q.year).map(x=>({id:x.q.id,game:x.q.year,evidence:x.e.year}));
const autoPromotions=rows.filter(x=>x.q.editorialVerified&&x.e?.status!=='manual_verified').map(x=>x.q.id);
const manualLost=rows.filter(x=>x.e?.manualVerified&&x.e.status!=='manual_verified').map(x=>x.q.id);
const genericLabels=rows.filter(x=>/referencia\s+(general|heredada)|fuente\s+general/i.test(clean(x.e?.sourceLabel))).map(x=>x.q.id);
const invalidDetails=[];
for(const {q,e} of rows){if(!e?.detail)continue;const d=clean(e.detail),base=norm(`${q.title} ${q.prompt} ${q.fact||''}`);if(d.length<45||d.length>420||genericText.test(d)||base.includes(norm(d)))invalidDetails.push({id:q.id,detail:d})}
const mediaRows=rows.filter(x=>x.e?.media);
const invalidMedia=mediaRows.filter(({e})=>{const m=e.media;return !/^https:\/\//.test(m.src||'')||!/^https:\/\//.test(m.sourcePage||'')||!clean(m.artist)||!clean(m.license)||!openLicense(m.license)||!clean(m.description)||m.selectionMethod!=='exact_article_lead_open_license'}).map(x=>x.q.id);
const suspiciousMedia=mediaRows.filter(({e})=>/\b(logo|logotipo|poster|p[oó]ster|cover|portada|car[aá]tula|icon|icono|flag|bandera|seal|map|mapa|escudo)\b/i.test(`${e.media.fileTitle||''} ${e.media.description||''}`)).map(x=>x.q.id);
const temporalContradictionMisclassified=rows.filter(x=>x.e?.issues?.includes('temporal_claims_do_not_match_expected_year')&&x.e.status!=='needs_review').map(x=>x.q.id);
const statusCounts=rows.reduce((a,x)=>(a[x.e?.status||'missing']=(a[x.e?.status||'missing']||0)+1,a),{});
const categoryStatus={};for(const {q,e} of rows){const c=categoryStatus[q.category]||(categoryStatus[q.category]={});c[e?.status||'missing']=(c[e?.status||'missing']||0)+1}
const report={version:'1.8.0-beta.1',methodology:'Static semantic gate. Corroboration is not manual verification; image absence is valid.',totals:{questions:questions.length,...statusCounts,details:rows.filter(x=>x.e?.detail).length,media:mediaRows.length,genericLabels:genericLabels.length},categoryStatus,issues:{missingEvidence,extraEvidence,yearMismatches,autoPromotions,manualLost,genericLabels,invalidDetails,invalidMedia,suspiciousMedia,temporalContradictionMisclassified},pass:{questionCount:questions.length===300,evidenceCoverage:missingEvidence.length===0&&extraEvidence.length===0,yearInvariant:yearMismatches.length===0,noAutomaticVerification:autoPromotions.length===0&&manualLost.length===0,specificLabels:genericLabels.length===0,valuableDetails:invalidDetails.length===0,mediaRightsAndProvenance:invalidMedia.length===0&&suspiciousMedia.length===0,contradictionsQuarantined:temporalContradictionMisclassified.length===0}};
report.pass.all=Object.values(report.pass).every(Boolean);
fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports','factual-quality-v18.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({totals:report.totals,pass:report.pass,issueCounts:Object.fromEntries(Object.entries(report.issues).map(([k,v])=>[k,v.length]))},null,2));
if(!report.pass.all)process.exitCode=1;
