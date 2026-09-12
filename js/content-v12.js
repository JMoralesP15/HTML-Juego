/* QUÉ AÑO v1.2 — contenido contextual seguro y láminas editoriales offline.
   No cambia IDs, años ni calendario. Enriquece únicamente la capa de lectura posterior a la respuesta. */

const QA_V12_CONTENT_VERSION='1.2-context-1';
const QA_V12_IMAGE_TARGET=180;
const QA_V12_CONTEXT_TARGET=220;

function qaXmlEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))}
function qaV12ArchiveNumber(q){const m=String(q?.id||'').match(/\d+/g);return m?.length?m.join('').slice(-4):String(q?.id||'AR').replace(/[^a-z0-9]/gi,'').slice(0,4).toUpperCase()}
function qaV12Palette(category){return ({'Tecnología':['#66c7d9','#16313a'],'Historia':['#e1b65f','#332715'],'Ciencia':['#72c5ad','#18332c'],'Cine':['#c7a9e8','#30233d'],'Música':['#e8a7c6','#39242f'],'Videojuegos':['#a9cf78','#25351a'],'Chile':['#e4958f','#3a2321'],'Cultura':['#dcad78','#38291b']})[category]||['#9db0c3','#1d2732']}
function qaV12Plate(q){
  const [accent,deep]=qaV12Palette(q.category),title=qaXmlEscape(q.title),category=qaXmlEscape(q.category),region=qaXmlEscape(q.region||'Global'),sub=qaXmlEscape(q.subcategory||q.kind||''),num=qaXmlEscape(qaV12ArchiveNumber(q));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Lámina editorial de ${title}"><rect width="1200" height="800" fill="#0b1016"/><rect x="40" y="40" width="1120" height="720" fill="#101821" stroke="#303a46" stroke-width="2"/><path d="M40 180H1160M40 620H1160" stroke="#303a46" stroke-width="2"/><path d="M730 40V760" stroke="${accent}" stroke-width="1" opacity=".55"/><g fill="none" stroke="${accent}" opacity=".22"><circle cx="920" cy="330" r="230"/><circle cx="920" cy="330" r="155"/><circle cx="920" cy="330" r="80"/><path d="M690 330H1150M920 100V560"/></g><text x="78" y="112" fill="${accent}" font-family="Arial,Helvetica,sans-serif" font-size="28" letter-spacing="5">ARCHIVO TEMPORAL · #${num}</text><text x="78" y="244" fill="#f2efe7" font-family="Arial,Helvetica,sans-serif" font-size="74" font-weight="700">${title.length>25?title.slice(0,25)+'…':title}</text><text x="78" y="308" fill="#9da7b3" font-family="Arial,Helvetica,sans-serif" font-size="28">${category} · ${sub}</text><text x="78" y="680" fill="#f2efe7" font-family="Arial,Helvetica,sans-serif" font-size="32">${region}</text><text x="1080" y="708" text-anchor="end" fill="${accent}" font-family="Arial,Helvetica,sans-serif" font-size="96" font-weight="700">${q.year}</text><rect x="740" y="608" width="370" height="6" fill="${accent}"/><rect x="740" y="646" width="250" height="2" fill="${deep}" stroke="${accent}" opacity=".65"/></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}

const QA_V12_BY_ID=new Map(QUESTIONS.map(q=>[q.id,q]));
function qaV12Neighbors(q){
  const pool=QUESTIONS.filter(x=>x.id!==q.id&&x.category===q.category).sort((a,b)=>a.year-b.year||a.id.localeCompare(b.id));
  let before=null,after=null;
  for(const x of pool){if(x.year<=q.year)before=x;else{after=x;break}}
  return {before,after};
}
function qaV12TemporalCopy(q){
  const {before,after}=qaV12Neighbors(q),parts=[];
  if(before)parts.push(`En el atlas queda después de ${before.title} (${before.year})`);
  if(after)parts.push(`${before?'y ':''}antes de ${after.title} (${after.year})`);
  if(parts.length)return parts.join(' ')+'.';
  return `Dentro del archivo se ubica en la década de ${Math.floor(q.year/10)*10}, en ${q.region||'un contexto global'}, dentro de ${q.subcategory||q.category}.`;
}
function qaV12BuildContext(q){
  const what=q.context||q.fact||`El archivo sitúa ${q.title} en ${q.year}.`;
  const why=q.significance||`Esta ficha se clasifica en ${q.subcategory||q.category}; esa clasificación permite compararla con otros hitos de ${q.category.toLowerCase()} sin introducir hechos que no estén respaldados por el banco.`;
  const locate=qaV12TemporalCopy(q);
  return {what,why,locate,sourceLabel:q.sourceLabel||'',source:q.source||'',reviewNeeded:!q.editorialVerified,method:q.editorialVerified?'editorial-verificado':'hecho-fuente + relación cronológica del banco'};
}

let qaV12ImageCount=QUESTIONS.filter(q=>q.image).length;
for(const q of QUESTIONS){
  if(!q.image&&qaV12ImageCount<QA_V12_IMAGE_TARGET){
    q.image=qaV12Plate(q);
    q.imageAlt=`Lámina editorial del archivo para ${q.title}, con metadatos de ${q.region||'su región'} y ${q.category}.`;
    q.imageCredit='Composición editorial original y offline para QUÉ AÑO v1.2';
    q.imageSource=q.source||'';
    q.imageLicense='Composición original del proyecto; hechos referenciados por la fuente de la pregunta';
    q.imageType='editorial';
    q.imageRole='context';
    q.v12GeneratedImage=true;
    qaV12ImageCount++;
  }
}

let qaV12ContextCount=0;
for(const q of QUESTIONS){
  if(qaV12ContextCount>=QA_V12_CONTEXT_TARGET)break;
  q.extendedContext=qaV12BuildContext(q);
  q.extendedContextVersion=QA_V12_CONTENT_VERSION;
  qaV12ContextCount++;
}

const QA_V12_COVERAGE={images:QUESTIONS.filter(q=>q.image).length,extendedContext:QUESTIONS.filter(q=>q.extendedContext).length,generatedImages:QUESTIONS.filter(q=>q.v12GeneratedImage).length,reviewNeeded:QUESTIONS.filter(q=>q.extendedContext?.reviewNeeded).length};
