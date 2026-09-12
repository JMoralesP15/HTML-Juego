// v1.7 editorial provenance, factual-review and media-rights debt report.
// Nothing is promoted to "verified" by URL presence, heuristics or generated text.
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
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,'').toLowerCase()}catch{return ''}};
const pathname=u=>{try{return new URL(u).pathname||'/'}catch{return '/'}};
const genericLabel=q=>/referencia\s+(general|heredada)|fuente\s+general/i.test(clean(q.sourceLabel));
const rootOnly=u=>{try{const x=new URL(u);return x.pathname==='/'||x.pathname===''}catch{return true}};
const sourceSpecificity=q=>{
  if(!q.source)return 'missing';
  if(genericLabel(q)||rootOnly(q.source))return 'homepage_or_generic';
  const parts=pathname(q.source).split('/').filter(Boolean);
  return parts.length>=2?'item_specific':'topic_specific';
};
const authorityFor=u=>{
  const h=host(u);
  if(!h)return 'missing';
  if(/(^|\.)wikipedia\.org$/.test(h))return 'general_reference';
  if(/\.gov$|\.gov\.[a-z]{2}$|\.gob\.cl$|(^|\.)cern\.ch$|(^|\.)bcn\.cl$|(^|\.)loc\.gov$|(^|\.)si\.edu$|(^|\.)nasa\.gov$|(^|\.)jpl\.nasa\.gov$|(^|\.)jfklibrary\.org$|(^|\.)moma\.org$|(^|\.)nms\.ac\.uk$|(^|\.)nobelprize\.org$/.test(h))return 'institutional_or_archive';
  if(/(^|\.)(apple|ibm|playstation|nintendo|thebeatles)\.com$|(^|\.)nintendo\.co\.[a-z]{2}$/.test(h))return 'official_entity';
  return 'unclassified';
};
const autoSyntheticFiller=q=>Boolean(q.v12GeneratedImage||q.v14GeneratedFallback||String(q.image||'').startsWith('data:image/svg+xml'));
const legacyGeneratedIllustration=q=>Boolean(q.image)&&!autoSyntheticFiller(q)&&q.imageType==='illustration'&&/generad[ao]|ilustraci[oó]n original/i.test(clean(q.imageCredit));
const documentaryImage=q=>Boolean(q.image)&&!autoSyntheticFiller(q)&&q.imageType==='documentary';
const explicitLearning=q=>Boolean(clean(q.context)||clean(q.fact)||clean(q.significance));
const openLicense=value=>/\bcc0\b|public domain|dominio p[uú]blico|\bcc[- ]?by(?:[- ]sa)?\b/i.test(clean(value));
const factualReviewState=q=>q.editorialVerified?'verified':sourceSpecificity(q)==='item_specific'||sourceSpecificity(q)==='topic_specific'?'source_specific_needs_human_check':q.source?'generic_needs_replacement':'missing_source';
const imageState=q=>{
  if(!q.image)return 'none';
  if(autoSyntheticFiller(q))return 'forbidden_synthetic_filler';
  if(documentaryImage(q))return clean(q.imageSource)&&clean(q.imageCredit)&&clean(q.imageAlt)?'documentary_with_provenance':'documentary_metadata_incomplete';
  if(legacyGeneratedIllustration(q))return 'project_generated_illustration';
  return 'other_asset_needs_review';
};
const rows=questions.map(q=>({
  id:q.id,title:q.title,year:q.year,category:q.category,region:q.region||null,
  factual:{
    state:factualReviewState(q),editorialVerified:Boolean(q.editorialVerified),
    claimScope:{year:true,fact:Boolean(clean(q.fact)),context:Boolean(clean(q.context)),significance:Boolean(clean(q.significance))},
    source:{url:clean(q.source)||null,label:clean(q.sourceLabel)||null,host:host(q.source)||null,authority:authorityFor(q.source),specificity:sourceSpecificity(q)}
  },
  learning:{fact:Boolean(clean(q.fact)),context:Boolean(clean(q.context)),significance:Boolean(clean(q.significance)),explicitLearning:explicitLearning(q)},
  media:{
    state:imageState(q),present:Boolean(q.image),type:q.imageType||null,documentary:documentaryImage(q),legacyGeneratedIllustration:legacyGeneratedIllustration(q),autoSyntheticFiller:autoSyntheticFiller(q),
    altPresent:Boolean(clean(q.imageAlt)),credit:clean(q.imageCredit)||null,source:clean(q.imageSource)||null,license:clean(q.imageLicense)||null,licenseKnown:Boolean(clean(q.imageLicense)),openLicense:openLicense(q.imageLicense)
  },
  derived:{connection:Boolean(q.v14Context?.connection),extendedContext:Boolean(q.extendedContext)},
  culture:{tier:q.cultureTier||null,score:Number.isFinite(q.cultureScore)?q.cultureScore:null}
}));
const countBy=fn=>rows.reduce((a,r)=>{const k=fn(r);a[k]=(a[k]||0)+1;return a},{});
const priorities={
  p0_missing_source:rows.filter(r=>r.factual.state==='missing_source').map(r=>r.id),
  p1_generic_source:rows.filter(r=>r.factual.state==='generic_needs_replacement').map(r=>r.id),
  p2_specific_source_unverified:rows.filter(r=>r.factual.state==='source_specific_needs_human_check').map(r=>r.id),
  p3_verified:rows.filter(r=>r.factual.state==='verified').map(r=>r.id),
  media_documentary_metadata_incomplete:rows.filter(r=>r.media.state==='documentary_metadata_incomplete').map(r=>r.id),
  media_other_asset_review:rows.filter(r=>r.media.state==='other_asset_needs_review').map(r=>r.id)
};
const regions=countBy(r=>r.region||'Sin región');const sortedRegions=Object.entries(regions).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'es'));const shares=sortedRegions.map(([,n])=>n/rows.length);const hhi=shares.reduce((s,p)=>s+p*p,0);
const report={
  version:'1.7-editorial-provenance-2',
  methodology:{
    verification:'Only explicit editorialVerified counts as factual verification. A URL, source authority class, culture score or derived context never upgrades verification.',
    specificity:'Generic labels/homepages are triaged separately from topic/item URLs. Specificity describes addressability, not truth.',
    authority:'Authority classes are conservative domain buckets for review priority, not automatic credibility scores.',
    media:'Documentary, project-generated illustration and forbidden synthetic filler are distinct. Image absence is valid. Open-license status requires explicit license metadata.',
    geography:'Concentration is descriptive, not a normative quota or proof of bias.'
  },
  totals:{
    questions:rows.length,verified:priorities.p3_verified.length,specificSourceNeedsReview:priorities.p2_specific_source_unverified.length,genericSourceNeedsReplacement:priorities.p1_generic_source.length,missingSource:priorities.p0_missing_source.length
  },
  sourceProfile:{authority:countBy(r=>r.factual.source.authority),specificity:countBy(r=>r.factual.source.specificity)},
  coverage:{
    source:rows.filter(r=>r.factual.source.url).length,sourceItemSpecific:rows.filter(r=>r.factual.source.specificity==='item_specific').length,sourceTopicSpecific:rows.filter(r=>r.factual.source.specificity==='topic_specific').length,
    explicitLearningText:rows.filter(r=>r.learning.explicitLearning).length,fact:rows.filter(r=>r.learning.fact).length,context:rows.filter(r=>r.learning.context).length,significance:rows.filter(r=>r.learning.significance).length,
    images:rows.filter(r=>r.media.present).length,documentaryImages:rows.filter(r=>r.media.documentary).length,projectGeneratedIllustrations:rows.filter(r=>r.media.legacyGeneratedIllustration).length,autoSyntheticFiller:rows.filter(r=>r.media.autoSyntheticFiller).length,
    imagesWithCredit:rows.filter(r=>r.media.present&&r.media.credit).length,imagesWithSource:rows.filter(r=>r.media.present&&r.media.source).length,imagesWithKnownLicense:rows.filter(r=>r.media.present&&r.media.licenseKnown).length,imagesWithOpenLicense:rows.filter(r=>r.media.present&&r.media.openLicense).length,
    explicitExtendedContext:rows.filter(r=>r.derived.extendedContext).length,derivedConnections:rows.filter(r=>r.derived.connection).length
  },
  mediaStates:countBy(r=>r.media.state),
  geography:{top4:sortedRegions.slice(0,4),top4Share:sortedRegions.slice(0,4).reduce((s,[,n])=>s+n,0)/rows.length,hhi:Number(hhi.toFixed(4)),effectiveRegionCount:Number((1/hhi).toFixed(2))},
  priorities,rows
};
const documentaryIncomplete=rows.filter(r=>r.media.documentary&&(!r.media.altPresent||!r.media.credit||!r.media.source)).length;
const out=path.join(root,'reports');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'editorial-quality-v17.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({version:report.version,totals:report.totals,sourceProfile:report.sourceProfile,coverage:report.coverage,mediaStates:report.mediaStates,geography:report.geography,priorityCounts:Object.fromEntries(Object.entries(priorities).map(([k,v])=>[k,v.length]))},null,2));
if(report.totals.questions!==300||report.totals.missingSource>0||report.coverage.autoSyntheticFiller>0||report.coverage.explicitLearningText<300||documentaryIncomplete>0)process.exitCode=1;
