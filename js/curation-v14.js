/* QUÉ AÑO v1.7 — clasificación cultural sin relleno editorial automático.
 * Conserva la rúbrica heurística de cultura general para compatibilidad, pero deja de
 * fabricar imágenes, extendedContext o frases de memoria para alcanzar cobertura.
 * No cambia IDs, años, scheduler ni calendario.
 */

const QA_V14_CURATION_VERSION='1.7-curation-nonmutating-1';
const QA_V14_TIER_LABELS={core:'Cultura general',context:'Contexto recomendado',niche:'Especialista'};

const QA_V14_CORE_PATTERNS=[
  /apollo 11|luna|muro de berl[ií]n|segunda guerra mundial|primera guerra mundial|11 de septiembre|chern[oó]bil|mandela|ca[ií]da de la uni[oó]n sovi[eé]tica|crisis de los misiles|sputnik/i,
  /adn|dna|penicilina|hubble|curiosity|relatividad|primer trasplante|clonaci[oó]n.*dolly|bos[oó]n de higgs|covid/i,
  /star wars|titanic|jurassic park|matrix|el padrino|the godfather|tibur[oó]n|jaws|toy story|par[aá]sitos|parasite/i,
  /sgt\.? pepper|dark side of the moon|nevermind|thriller|abbey road|revolver|bob dylan|beatles|michael jackson|nirvana/i,
  /tetris|super mario|game boy|playstation|minecraft|zelda|pok[eé]mon|world of warcraft|fortnite/i,
  /google|youtube|facebook|iphone|walkman|macintosh|windows 95|primer sitio web|internet|wikipedia|chatgpt/i,
  /plebiscito.*1988|mineros|valdivia.*1960|nobel.*neruda|gabriela mistral|retorno a la democracia|allende|pinochet|panamericanos.*2023/i
];
const QA_V14_CONTEXT_PATTERNS=[
  /intel 4004|linux|m-pesa|upi|bitcoin|instagram|ibm pc|ipod/i,
  /chungking express|400 golpes|battle of algiers|batalla de argel|portrait of a lady on fire|rrr/i,
  /homogenic|miseducation of lauryn hill|to pimp a butterfly|trans-europe express|constru[cç][aã]o|clube da esquina|dynamo|siempre es hoy/i,
  /dark souls|portal|journey|shadow of the colossus/i,
  /goodreads|google doodle|primer doodle|ted.*online/i
];
const QA_V14_NICHE_PATTERNS=[/in the aeroplane over the sea/i,/celeste|disco elysium|hades|baldur'?s gate 3|black myth.*wukong/i];

function qaV14Matches(q,patterns){const hay=`${q.id} ${q.title} ${q.prompt} ${q.subcategory||''}`;return patterns.some(re=>re.test(hay))}
function qaV14Clamp(n){return Math.max(0,Math.min(100,Math.round(n)))}
function qaV14CultureAssessment(q){
  const diffBase={facil:76,media:64,dificil:52}[q.difficulty]??60;
  const impact={Historia:7,Ciencia:6,Chile:5,Tecnología:4,Cultura:2,Cine:1,Música:0,Videojuegos:0}[q.category]??0;
  const globality=/Global|Europa|América Latina|Mundo/i.test(q.region||'')?3:0;
  const sourceBonus=q.source?2:0;
  let score=diffBase+impact+globality+sourceBonus,override=null;
  if(qaV14Matches(q,QA_V14_CORE_PATTERNS)){score=Math.max(score,78);override='Reconocimiento o impacto transversal alto.'}
  if(qaV14Matches(q,QA_V14_CONTEXT_PATTERNS)){score=Math.min(Math.max(score,54),68);override='Hito relevante, pero su reconocimiento depende más del contexto cultural o disciplinar.'}
  if(qaV14Matches(q,QA_V14_NICHE_PATTERNS)){score=Math.min(score,46);override='Influyente dentro de su campo, pero de reconocimiento general limitado.'}
  score=qaV14Clamp(score);
  const tier=score>=70?'core':score>=50?'context':'niche';
  const components={impact:qaV14Clamp(Math.round((impact+8)/15*30)),recognition:qaV14Clamp(Math.round((diffBase-45)/35*25)),persistence:tier==='core'?18:tier==='context'?14:10,learning:q.fact||q.context?13:8,clarity:(q.prompt||'').length<125?9:7};
  return {score,tier,label:QA_V14_TIER_LABELS[tier],reason:override||({core:'Hito de reconocimiento amplio o con alta persistencia cultural.',context:'Hito valioso que gana mucho cuando se entrega contexto.',niche:'Hito con mayor dependencia de conocimiento especializado o subcultural.'})[tier],components,method:'rúbrica heurística de priorización; no equivale a verificación factual ni a medición de usuarios'};
}

function qaV14Connection(q){
  const before=q.anchorBefore&&QUESTION_BY_ID.get(q.anchorBefore),after=q.anchorAfter&&QUESTION_BY_ID.get(q.anchorAfter);
  if(before&&after)return `${before.title} (${before.year}) ← ${q.title} (${q.year}) → ${after.title} (${after.year}).`;
  if(before)return `En el archivo aparece después de ${before.title} (${before.year}).`;
  if(after)return `En el archivo aparece antes de ${after.title} (${after.year}).`;
  return '';
}
function qaV14Enrichment(q){
  const ext=q.extendedContext||{},what=ext.what||q.context||q.fact||'',why=ext.why||q.significance||'',locate=ext.locate||'';
  const remember=q.fact&&q.fact!==what?q.fact:'',connection=qaV14Connection(q);
  return {what,why,locate,remember,connection,source:q.source||'',sourceLabel:q.sourceLabel||'',reviewNeeded:!q.editorialVerified,method:'reutilización no inventiva de campos existentes; conexiones sólo cuando existen anclas explícitas'};
}

for(const q of QUESTIONS){
  const culture=qaV14CultureAssessment(q);
  q.cultureScore=culture.score;q.cultureTier=culture.tier;q.cultureTierLabel=culture.label;q.cultureAssessment=culture;
  q.v14Context=qaV14Enrichment(q);
  q.v14MediaQuery=[q.title,q.category,q.region&&q.region!=='Global'?q.region:'',q.year].filter(Boolean).join(' ');
}

const QA_V14_CURATION_SUMMARY={
  version:QA_V14_CURATION_VERSION,total:QUESTIONS.length,
  tiers:QUESTIONS.reduce((acc,q)=>(acc[q.cultureTier]=(acc[q.cultureTier]||0)+1,acc),{}),
  categories:QUESTIONS.reduce((acc,q)=>{const c=acc[q.category]||(acc[q.category]={total:0,core:0,context:0,niche:0});c.total++;c[q.cultureTier]++;return acc},{}),
  coverage:{
    images:QUESTIONS.filter(q=>q.image).length,
    documentaryImages:QUESTIONS.filter(q=>q.image&&q.imageType==='documentary').length,
    explicitLearningText:QUESTIONS.filter(q=>q.context||q.fact||q.significance).length,
    explicitExtendedContext:QUESTIONS.filter(q=>q.extendedContext).length,
    sourced:QUESTIONS.filter(q=>q.source).length,
    derivedConnections:QUESTIONS.filter(q=>q.v14Context?.connection).length,
    generatedImageFallbacks:0,
    generatedContextFallbacks:0
  },
  candidates:QUESTIONS.filter(q=>q.cultureTier==='niche').map(q=>({id:q.id,title:q.title,year:q.year,category:q.category,score:q.cultureScore,reason:q.cultureAssessment.reason}))
};

window.__QA_V14_CURATION__={version:QA_V14_CURATION_VERSION,labels:QA_V14_TIER_LABELS,summary:QA_V14_CURATION_SUMMARY,assess:qaV14CultureAssessment};
