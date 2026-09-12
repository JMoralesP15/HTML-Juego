/* QUÉ AÑO v1.2 — contenido contextual seguro y láminas editoriales offline.
   No cambia IDs, años ni calendario. Enriquece únicamente la capa de lectura posterior a la respuesta. */

const QA_V12_CONTENT_VERSION='1.2-context-3';
const QA_V12_IMAGE_TARGET=180;
const QA_V12_CONTEXT_TARGET=220;

function qaXmlEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))}
function qaV12ArchiveNumber(q){const m=String(q?.id||'').match(/\d+/g);return m?.length?m.join('').slice(-4):String(q?.id||'AR').replace(/[^a-z0-9]/gi,'').slice(0,4).toUpperCase()}
function qaV12Palette(category){return ({'Tecnología':['#66c7d9','#16313a'],'Historia':['#e1b65f','#332715'],'Ciencia':['#72c5ad','#18332c'],'Cine':['#c7a9e8','#30233d'],'Música':['#e8a7c6','#39242f'],'Videojuegos':['#a9cf78','#25351a'],'Chile':['#e4958f','#3a2321'],'Cultura':['#dcad78','#38291b']})[category]||['#9db0c3','#1d2732']}
function qaV12Hash(value){let h=2166136261;for(const c of String(value??'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function qaV12VisualFamily(q){return ['orbital','timeline','matrix','signal','cartographic'][qaV12Hash(q.id)%5]}
function qaV12Motif(family,accent,deep){
  if(family==='timeline')return `<g opacity=".34"><path d="M760 120V660" stroke="${accent}" stroke-width="3"/><circle cx="760" cy="180" r="13" fill="${accent}"/><circle cx="760" cy="330" r="13" fill="${accent}"/><circle cx="760" cy="500" r="13" fill="${accent}"/><path d="M785 180H1080M785 330H1010M785 500H1130" stroke="#f2efe7" stroke-width="2" opacity=".42"/><rect x="840" y="226" width="210" height="38" fill="${deep}" stroke="${accent}"/><rect x="880" y="376" width="170" height="38" fill="${deep}" stroke="${accent}"/><rect x="820" y="546" width="255" height="38" fill="${deep}" stroke="${accent}"/></g>`;
  if(family==='matrix')return `<g fill="none" stroke="${accent}" opacity=".27"><path d="M748 120H1120V590H748Z"/><path d="M810 120V590M872 120V590M934 120V590M996 120V590M1058 120V590M748 198H1120M748 276H1120M748 354H1120M748 432H1120M748 510H1120"/><rect x="810" y="198" width="124" height="156" fill="${accent}" opacity=".12"/><rect x="934" y="354" width="124" height="156" fill="${deep}" opacity=".7"/></g>`;
  if(family==='signal')return `<g fill="none" stroke="${accent}"><path d="M735 365 C780 210 825 520 870 365 S960 210 1005 365 S1095 520 1140 365" stroke-width="4" opacity=".48"/><path d="M735 365H1140" stroke-width="1" opacity=".22"/><path d="M780 150V590M900 150V590M1020 150V590M1140 150V590" stroke-width="1" opacity=".14"/></g><g fill="${accent}" opacity=".42"><circle cx="780" cy="365" r="8"/><circle cx="900" cy="365" r="8"/><circle cx="1020" cy="365" r="8"/></g>`;
  if(family==='cartographic')return `<g fill="none" stroke="${accent}" opacity=".3"><path d="M760 180 L850 125 L955 168 L1080 135 L1135 240 L1094 355 L1140 455 L1030 565 L900 525 L795 580 L730 470 L780 355 Z"/><path d="M760 180L955 168L1094 355L900 525L780 355L1080 135M795 580L1030 565M730 470L1140 455"/><circle cx="955" cy="354" r="62"/><circle cx="955" cy="354" r="14" fill="${accent}"/></g>`;
  return `<g fill="none" stroke="${accent}" opacity=".22"><circle cx="920" cy="330" r="230"/><circle cx="920" cy="330" r="155"/><circle cx="920" cy="330" r="80"/><path d="M690 330H1150M920 100V560"/><ellipse cx="920" cy="330" rx="230" ry="82" transform="rotate(-18 920 330)"/></g>`;
}
function qaV12Plate(q){
  const [accent,deep]=qaV12Palette(q.category),family=qaV12VisualFamily(q),title=qaXmlEscape(q.title),category=qaXmlEscape(q.category),region=qaXmlEscape(q.region||'Global'),sub=qaXmlEscape(q.subcategory||q.kind||''),num=qaXmlEscape(qaV12ArchiveNumber(q)),motif=qaV12Motif(family,accent,deep);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Lámina editorial de ${title}"><rect width="1200" height="800" fill="#0b1016"/><rect x="40" y="40" width="1120" height="720" fill="#101821" stroke="#303a46" stroke-width="2"/><path d="M40 180H1160M40 620H1160" stroke="#303a46" stroke-width="2"/><path d="M700 40V760" stroke="${accent}" stroke-width="1" opacity=".4"/>${motif}<text x="78" y="112" fill="${accent}" font-family="Arial,Helvetica,sans-serif" font-size="28" letter-spacing="5">ARCHIVO TEMPORAL · #${num}</text><text x="78" y="148" fill="#71808f" font-family="Arial,Helvetica,sans-serif" font-size="18" letter-spacing="3">FAMILIA VISUAL · ${family.toUpperCase()}</text><text x="78" y="244" fill="#f2efe7" font-family="Arial,Helvetica,sans-serif" font-size="74" font-weight="700">${title.length>25?title.slice(0,25)+'…':title}</text><text x="78" y="308" fill="#9da7b3" font-family="Arial,Helvetica,sans-serif" font-size="28">${category} · ${sub}</text><text x="78" y="680" fill="#f2efe7" font-family="Arial,Helvetica,sans-serif" font-size="32">${region}</text><text x="1080" y="708" text-anchor="end" fill="${accent}" font-family="Arial,Helvetica,sans-serif" font-size="96" font-weight="700">${q.year}</text><rect x="740" y="608" width="370" height="6" fill="${accent}"/><rect x="740" y="646" width="250" height="2" fill="${deep}" stroke="${accent}" opacity=".65"/></svg>`;
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
  const why=q.significance||'';
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
    q.v12VisualFamily=qaV12VisualFamily(q);
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

const QA_V12_VISUAL_FAMILIES=QUESTIONS.filter(q=>q.v12GeneratedImage).reduce((acc,q)=>{acc[q.v12VisualFamily]=(acc[q.v12VisualFamily]||0)+1;return acc},{});
const QA_V12_COVERAGE={images:QUESTIONS.filter(q=>q.image).length,extendedContext:QUESTIONS.filter(q=>q.extendedContext).length,generatedImages:QUESTIONS.filter(q=>q.v12GeneratedImage).length,reviewNeeded:QUESTIONS.filter(q=>q.extendedContext?.reviewNeeded).length,visualFamilies:QA_V12_VISUAL_FAMILIES};