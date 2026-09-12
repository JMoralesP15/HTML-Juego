/* QUÉ AÑO v1.7 — compatibilidad de contexto Atlas sin mutación editorial automática.
 * Históricamente v1.2 generaba láminas y extendedContext para alcanzar cuotas de cobertura.
 * Desde v1.7 esas funciones permanecen como helpers de compatibilidad, pero NO se escriben
 * automáticamente sobre QUESTIONS. Ausencia de imagen/contexto derivado es preferible a
 * presentar material sintético como si fuera curaduría verificada.
 */

const QA_V12_CONTENT_VERSION='1.7-nonmutating-1';

function qaXmlEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))}
function qaV12ArchiveNumber(q){const m=String(q?.id||'').match(/\d+/g);return m?.length?m.join('').slice(-4):String(q?.id||'AR').replace(/[^a-z0-9]/gi,'').slice(0,4).toUpperCase()}
function qaV12Palette(category){return ({'Tecnología':['#66c7d9','#16313a'],'Historia':['#e1b65f','#332715'],'Ciencia':['#72c5ad','#18332c'],'Cine':['#c7a9e8','#30233d'],'Música':['#e8a7c6','#39242f'],'Videojuegos':['#a9cf78','#25351a'],'Chile':['#e4958f','#3a2321'],'Cultura':['#dcad78','#38291b']})[category]||['#9db0c3','#1d2732']}
function qaV12Hash(value){let h=2166136261;for(const c of String(value??'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function qaV12VisualFamily(q){return ['orbital','timeline','matrix','signal','cartographic'][qaV12Hash(q.id)%5]}
function qaV12Motif(family,accent,deep){
  if(family==='timeline')return `<g opacity=".34"><path d="M760 120V660" stroke="${accent}" stroke-width="3"/><circle cx="760" cy="180" r="13" fill="${accent}"/><circle cx="760" cy="330" r="13" fill="${accent}"/><circle cx="760" cy="500" r="13" fill="${accent}"/></g>`;
  if(family==='matrix')return `<g fill="none" stroke="${accent}" opacity=".27"><path d="M748 120H1120V590H748Z"/><path d="M810 120V590M872 120V590M934 120V590M996 120V590M1058 120V590M748 198H1120M748 276H1120M748 354H1120M748 432H1120M748 510H1120"/></g>`;
  if(family==='signal')return `<g fill="none" stroke="${accent}"><path d="M735 365 C780 210 825 520 870 365 S960 210 1005 365 S1095 520 1140 365" stroke-width="4" opacity=".48"/></g>`;
  if(family==='cartographic')return `<g fill="none" stroke="${accent}" opacity=".3"><path d="M760 180 L850 125 L955 168 L1080 135 L1135 240 L1094 355 L1140 455 L1030 565 L900 525 L795 580 L730 470 L780 355 Z"/><circle cx="955" cy="354" r="62"/></g>`;
  return `<g fill="none" stroke="${accent}" opacity=".22"><circle cx="920" cy="330" r="230"/><circle cx="920" cy="330" r="155"/><circle cx="920" cy="330" r="80"/></g>`;
}

/* Helper histórico conservado para reproducibilidad. No se asigna a ninguna pregunta. */
function qaV12Plate(q){
  const [accent,deep]=qaV12Palette(q.category),family=qaV12VisualFamily(q),title=qaXmlEscape(q.title),category=qaXmlEscape(q.category),region=qaXmlEscape(q.region||'Global'),num=qaXmlEscape(qaV12ArchiveNumber(q)),motif=qaV12Motif(family,accent,deep);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Lámina editorial de ${title}"><rect width="1200" height="800" fill="#0b1016"/><rect x="40" y="40" width="1120" height="720" fill="#101821" stroke="#303a46" stroke-width="2"/>${motif}<text x="78" y="112" fill="${accent}" font-family="Arial,Helvetica,sans-serif" font-size="28">ARCHIVO TEMPORAL · #${num}</text><text x="78" y="244" fill="#f2efe7" font-family="Arial,Helvetica,sans-serif" font-size="74" font-weight="700">${title.length>25?title.slice(0,25)+'…':title}</text><text x="78" y="308" fill="#9da7b3" font-family="Arial,Helvetica,sans-serif" font-size="28">${category}</text><text x="78" y="680" fill="#f2efe7" font-family="Arial,Helvetica,sans-serif" font-size="32">${region}</text><text x="1080" y="708" text-anchor="end" fill="${accent}" font-family="Arial,Helvetica,sans-serif" font-size="96" font-weight="700">${q.year}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}

function qaV12Neighbors(q){
  const pool=QUESTIONS.filter(x=>x.id!==q.id&&x.category===q.category).sort((a,b)=>a.year-b.year||a.id.localeCompare(b.id));
  let before=null,after=null;for(const x of pool){if(x.year<=q.year)before=x;else{after=x;break}}return {before,after};
}
function qaV12TemporalCopy(q){
  const {before,after}=qaV12Neighbors(q),parts=[];
  if(before)parts.push(`En el atlas queda después de ${before.title} (${before.year})`);
  if(after)parts.push(`${before?'y ':''}antes de ${after.title} (${after.year})`);
  if(parts.length)return parts.join(' ')+'.';
  return `Dentro del archivo se ubica en la década de ${Math.floor(q.year/10)*10}.`;
}

/* Contexto derivado bajo demanda. El campo method deja explícito que no equivale a verificación factual. */
function qaV12BuildContext(q){
  return {
    what:q.context||q.fact||'',
    why:q.significance||'',
    locate:qaV12TemporalCopy(q),
    sourceLabel:q.sourceLabel||'',
    source:q.source||'',
    reviewNeeded:!q.editorialVerified,
    method:'derivado bajo demanda desde contenido existente y relaciones cronológicas; no verificado editorialmente'
  };
}

const QA_V12_COVERAGE={
  images:QUESTIONS.filter(q=>q.image).length,
  documentaryImages:QUESTIONS.filter(q=>q.image&&q.imageType==='documentary').length,
  extendedContext:QUESTIONS.filter(q=>q.extendedContext).length,
  explicitLearningText:QUESTIONS.filter(q=>q.context||q.fact||q.significance).length,
  sources:QUESTIONS.filter(q=>q.source).length,
  generatedImages:0,
  reviewNeeded:QUESTIONS.filter(q=>!q.editorialVerified).length,
  mode:'non_mutating'
};
