// v1.7 actionable editorial-review backlog.
// This produces next-review actions only. It does not verify facts, licenses or images.
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
const sourceSpecificity=q=>{
  if(!q.source)return 'missing';
  try{const u=new URL(q.source),label=clean(q.sourceLabel);if(/referencia\s+(general|heredada)|fuente\s+general/i.test(label)||u.pathname==='/'||u.pathname==='')return 'generic';return u.pathname.split('/').filter(Boolean).length>=2?'specific':'topic'}catch{return 'missing'}
};
const factualPriority=q=>q.editorialVerified?'P3_VERIFIED':sourceSpecificity(q)==='missing'?'P0_MISSING_SOURCE':sourceSpecificity(q)==='generic'?'P1_REPLACE_GENERIC':'P2_CHECK_SPECIFIC';
const sourcePlan=q=>{
  const region=clean(q.region),cat=q.category;
  if(cat==='Chile'||/Chile/i.test(region))return {family:['BCN / institución pública específica','Biblioteca Nacional / Memoria Chilena / archivo chileno','fuente oficial temática'],reason:'Priorizar una institución chilena que documente el hito concreto.'};
  if(cat==='Ciencia')return {family:['organismo científico / universidad / Nobel','NASA/JPL/CERN cuando corresponda','fuente académica o museo científico autoritativo'],reason:'La fuente debe corresponder al descubrimiento, misión o publicación concreta.'};
  if(cat==='Historia')return {family:['archivo o biblioteca nacional','institución pública / organismo internacional','museo o fuente secundaria histórica autoritativa'],reason:'Priorizar documento institucional o archivo cercano al acontecimiento.'};
  if(cat==='Tecnología')return {family:['fabricante / archivo corporativo oficial','museo de tecnología / Computer History Museum','institución secundaria autoritativa'],reason:'El lanzamiento o adopción debe documentarse con una fuente específica.'};
  if(cat==='Cine')return {family:['filmoteca / BFI / Academy / museo cinematográfico','estudio o distribuidor oficial cuando documente estreno','fuente cinematográfica autoritativa'],reason:'Distinguir estreno, festival y lanzamiento comercial.'};
  if(cat==='Música')return {family:['artista / sello / archivo oficial','Grammy / Library of Congress / museo musical','fuente discográfica autoritativa'],reason:'Distinguir publicación, grabación y éxito posterior.'};
  if(cat==='Videojuegos')return {family:['desarrollador / publisher / fabricante oficial','museo o archivo de videojuegos','fuente especializada autoritativa'],reason:'Distinguir lanzamiento regional, plataforma y versión.'};
  return {family:['museo / biblioteca / archivo nacional','Smithsonian / Library of Congress / Europeana según región','institución cultural autoritativa'],reason:'La institución temática y regional debe corresponder al objeto cultural.'};
};
const imagePlan=q=>{
  const present=Boolean(q.image),documentary=present&&q.imageType==='documentary',projectIllustration=present&&q.imageType==='illustration'&&/generad[ao]|ilustraci[oó]n original/i.test(clean(q.imageCredit));
  if(documentary)return {priority:'P1_VERIFY_RIGHTS',action:'Conservar relevancia documental y revisar rights/licencia del objeto.',providers:['fuente original del asset','Wikimedia Commons si existe copia abierta equivalente'],absenceAcceptable:false};
  if(projectIllustration)return {priority:'P2_OPTIONAL_REPLACE',action:'Mantener rotulada como ilustración o reemplazar sólo si aparece un documento abierto claramente superior.',providers:['Wikimedia Commons','archivo/museo institucional','Smithsonian Open Access / LoC / Europeana según hito'],absenceAcceptable:true};
  return {priority:'P3_OPTIONAL_OPEN_MEDIA',action:'No añadir imagen por cuota. Buscar sólo si aporta evidencia o comprensión.',providers:['Wikimedia Commons','archivo/museo institucional','Smithsonian Open Access / LoC / Europeana según hito'],absenceAcceptable:true};
};
const nextAction=q=>{
  const p=factualPriority(q);if(p==='P0_MISSING_SOURCE')return 'Encontrar una fuente específica que respalde primero el año/fecha.';if(p==='P1_REPLACE_GENERIC')return 'Sustituir la referencia general por una fuente específica y luego revisar año, fact y contexto.';if(p==='P2_CHECK_SPECIFIC')return 'Abrir la fuente específica y comprobar que soporte el año/fecha y el alcance del texto.';return 'Revisar que la evidencia ya verificada siga siendo coherente; no degradar sin nueva evidencia.';
};
const rows=questions.map(q=>{const source=sourcePlan(q),image=imagePlan(q);return {
  id:q.id,title:q.title,year:q.year,category:q.category,region:q.region||null,
  factualPriority:factualPriority(q),currentSourceSpecificity:sourceSpecificity(q),editorialVerified:Boolean(q.editorialVerified),
  nextAction:nextAction(q),providerFamily:source.family,providerRationale:source.reason,
  suggestedSearchQuery:[q.title,q.year,q.region,q.category].filter(Boolean).join(' '),
  claimsToCheck:{year:true,fact:Boolean(clean(q.fact)),context:Boolean(clean(q.context)),significance:Boolean(clean(q.significance))},
  imagePriority:image.priority,imageNextAction:image.action,imageProviderOrder:image.providers,imageAbsenceAcceptable:image.absenceAcceptable,
  imageCurrent:{present:Boolean(q.image),type:q.imageType||null,creditPresent:Boolean(clean(q.imageCredit)),sourcePresent:Boolean(clean(q.imageSource)),licensePresent:Boolean(clean(q.imageLicense))}
}});
const countBy=key=>rows.reduce((acc,r)=>(acc[r[key]]=(acc[r[key]]||0)+1,acc),{});
const report={version:'1.7-editorial-backlog-1',methodology:{status:'Planning artifact only; no row changes editorialVerified or asserts a source/license was checked.',query:'Queries are deterministic search prompts, not citations.',providers:'Provider families are routing suggestions by content type/region, not claims of availability.'},total:rows.length,priorities:countBy('factualPriority'),imagePriorities:countBy('imagePriority'),rows};
const out=path.join(root,'reports');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'editorial-review-backlog-v17.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({version:report.version,total:report.total,priorities:report.priorities,imagePriorities:report.imagePriorities},null,2));
if(report.total!==300||rows.some(r=>!r.nextAction||!r.providerFamily.length||!r.suggestedSearchQuery||!r.imageProviderOrder.length))process.exitCode=1;
