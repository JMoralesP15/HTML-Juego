// v1.7 editorial provenance and review-debt report.
// This report classifies evidence quality. It never upgrades a fact to "verified" by inference.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sandbox={console,Date,Map,Set,Math,JSON,Intl,URL,encodeURIComponent};sandbox.window=sandbox;
const context=vm.createContext(sandbox);
for(const name of ['content','editorial','content-v12','curation-v14'])vm.runInContext(fs.readFileSync(path.join(root,'js',`${name}.js`),'utf8'),context,{filename:`${name}.js`});
const questions=vm.runInContext('QUESTIONS',context);
const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch{return ''}};
const genericLabel=q=>/referencia\s+(general|heredada)|fuente\s+general/i.test(clean(q.sourceLabel));
const rootOnly=u=>{try{const x=new URL(u);return x.pathname==='/'||x.pathname==='' }catch{return true}};
const sourceSpecific=q=>Boolean(q.source)&&!genericLabel(q)&&!rootOnly(q.source);
const generatedImage=q=>Boolean(q.v12GeneratedImage||q.v14GeneratedFallback||String(q.image||'').startsWith('data:image/svg+xml'));
const documentaryImage=q=>Boolean(q.image)&&!generatedImage(q)&&q.imageType==='documentary';
const explicitLearning=q=>Boolean(clean(q.context)||clean(q.fact)||clean(q.significance));
const reviewState=q=>q.editorialVerified?'verified':sourceSpecific(q)?'sourced_needs_review':q.source?'generic_needs_review':'missing_source';
const rows=questions.map(q=>({
  id:q.id,title:q.title,year:q.year,category:q.category,region:q.region||null,
  reviewState:reviewState(q),editorialVerified:Boolean(q.editorialVerified),
  source:{present:Boolean(q.source),specific:sourceSpecific(q),label:clean(q.sourceLabel)||null,host:host(q.source)||null},
  text:{fact:Boolean(clean(q.fact)),context:Boolean(clean(q.context)),significance:Boolean(clean(q.significance)),explicitLearning:explicitLearning(q)},
  image:{present:Boolean(q.image),documentary:documentaryImage(q),generated:generatedImage(q),type:q.imageType||null},
  derived:{connection:Boolean(q.v14Context?.connection),extendedContext:Boolean(q.extendedContext)},
  culture:{tier:q.cultureTier||null,score:Number.isFinite(q.cultureScore)?q.cultureScore:null}
}));
const countBy=(key)=>rows.reduce((a,r)=>{const k=key(r);a[k]=(a[k]||0)+1;return a},{});
const priorities={
  p0_missing_source:rows.filter(r=>r.reviewState==='missing_source').map(r=>r.id),
  p1_generic_source_unverified:rows.filter(r=>r.reviewState==='generic_needs_review').map(r=>r.id),
  p2_specific_source_unverified:rows.filter(r=>r.reviewState==='sourced_needs_review').map(r=>r.id),
  p3_verified:rows.filter(r=>r.reviewState==='verified').map(r=>r.id)
};
const regions=countBy(r=>r.region||'Sin región');const sortedRegions=Object.entries(regions).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'es'));const shares=sortedRegions.map(([,n])=>n/rows.length);const hhi=shares.reduce((s,p)=>s+p*p,0);
const report={
  version:'1.7-editorial-provenance-1',
  methodology:{
    verification:'Only the explicit editorialVerified field counts as verified. URL presence, heuristics, cultural score and generated context never promote verification.',
    genericSource:'A source is generic when its label declares a general/inherited reference or its URL is only a site root. This is triage, not a credibility judgment.',
    image:'Documentary means an existing non-generated asset explicitly typed documentary. Absence of an image is acceptable and preferable to synthetic filler.',
    geography:'Concentration is descriptive, not a normative quota or proof of bias.'
  },
  totals:{questions:rows.length,verified:priorities.p3_verified.length,specificSourceNeedsReview:priorities.p2_specific_source_unverified.length,genericSourceNeedsReview:priorities.p1_generic_source_unverified.length,missingSource:priorities.p0_missing_source.length},
  coverage:{
    source:rows.filter(r=>r.source.present).length,
    sourceSpecific:rows.filter(r=>r.source.specific).length,
    explicitLearningText:rows.filter(r=>r.text.explicitLearning).length,
    fact:rows.filter(r=>r.text.fact).length,context:rows.filter(r=>r.text.context).length,significance:rows.filter(r=>r.text.significance).length,
    images:rows.filter(r=>r.image.present).length,documentaryImages:rows.filter(r=>r.image.documentary).length,generatedImages:rows.filter(r=>r.image.generated).length,
    explicitExtendedContext:rows.filter(r=>r.derived.extendedContext).length,derivedConnections:rows.filter(r=>r.derived.connection).length
  },
  geography:{top4:sortedRegions.slice(0,4),top4Share:sortedRegions.slice(0,4).reduce((s,[,n])=>s+n,0)/rows.length,hhi:Number(hhi.toFixed(4)),effectiveRegionCount:Number((1/hhi).toFixed(2))},
  priorities,
  rows
};
const out=path.join(root,'reports');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'editorial-quality-v17.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({version:report.version,totals:report.totals,coverage:report.coverage,geography:report.geography,priorityCounts:Object.fromEntries(Object.entries(priorities).map(([k,v])=>[k,v.length]))},null,2));
if(report.totals.questions!==300||report.totals.missingSource>0||report.coverage.generatedImages>0||report.coverage.explicitLearningText<300)process.exitCode=1;
