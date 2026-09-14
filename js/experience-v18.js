/* QUÉ AÑO v1.8 — deterministic factual-media presentation.
 * Uses only the generated v1.8 manifest. Missing media is an acceptable state.
 */
(function(){
  'use strict';
  const VERSION='1.8.0-beta.1';

  for(const q of QUESTIONS){
    if(!q.v18Media)continue;
    if(q.imageType!=='documentary'){
      q.v18LegacyImage=q.image||null;
      q.image='';q.imageAlt='';q.imageCredit='';
    }
    q.imageType='documentary';q.imageRole='context';q.imageSource=q.v18Media.sourcePage||'';q.imageLicense=q.v18Media.license||'';
  }

  function currentQuestion(){try{return round?.questionIds?QUESTION_BY_ID.get(round.questionIds[round.index])||null:null}catch{return null}}
  function install(){
    const q=currentQuestion();if(!q?.v18Media)return;
    let phase='question';try{phase=round?.phase||phase}catch{}
    if(phase!=='answer')return;
    const doc=document.querySelector('.atlas-document');if(!doc)return;
    const media=q.v18Media;
    const host=q.humanApproved?doc.closest('.atlas-learn'):doc;
    let fig=host.querySelector('.atlas-document-image');
    if(!fig){fig=document.createElement('figure');fig.className='atlas-document-image';doc.prepend(fig)}
    if(q.humanApproved)host.querySelector('.atlas-learn-head')?.after(fig);
    if(fig.dataset.selection===media.src)return;
    fig.dataset.selection=media.src;
    doc.classList.remove('no-image');doc.classList.add('has-image');
    const img=document.createElement('img');img.src=media.src;img.alt=media.description||`Imagen documental relacionada con ${q.title}`;img.loading='lazy';img.referrerPolicy='no-referrer';
    const cap=document.createElement('figcaption');cap.className='v14-open-media-credit v18-curated-media-credit';
    const strong=document.createElement('strong');strong.textContent=q.humanApproved?'IMAGEN ELEGIDA POR REVISIÓN HUMANA':'IMAGEN ABIERTA · CURADA v1.8';
    const detail=document.createElement('span');detail.textContent=`${media.artist} · ${media.license}`;
    const source=document.createElement('a');source.href=media.sourcePage;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Procedencia y licencia ↗';
    if(q.humanApproved){const credits=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Créditos y procedencia';credits.append(summary,detail,source);cap.append(credits)}else cap.append(strong,detail,source);fig.replaceChildren(img,cap);fig.dataset.v18='1';
    img.addEventListener('error',()=>{img.remove();const notice=document.createElement('p');notice.textContent='La imagen elegida no pudo cargarse. Puedes abrir su procedencia.';fig.prepend(notice);doc.classList.remove('has-image');doc.classList.add('no-image')},{once:true});
  }

  window.__QYA_RUNTIME__?.onRender(install);install();
  window.__QA_V18_MEDIA__={version:VERSION,install};
})();

