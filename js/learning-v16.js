/* QUÉ AÑO v1.6 — aprendizaje, resultado y cierre de sesión.
 * Capa de producto: no cambia IDs, años, calendario, scheduler ni persistencia.
 * v1.7: resumen/feedback se sincronizan por el contrato de render, no por MutationObserver ni wrapper de renderSummary.
 * v1.8.4: el feedback esencial usa narrativa natural; la taxonomía editorial queda fuera de la UI primaria.
 * v1.8.8: elimina metadiscurso editorial y evita repetir el aprendizaje en el contexto expandido.
 */
(function(){
  'use strict';

  const VERSION='1.6.0-beta.1';
  let lastFeedbackKey='',lastSummaryKey='';

  const clean=value=>String(value||'').replace(/\s+/g,' ').trim();
  const sentences=value=>clean(value).match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(clean).filter(Boolean)||[];
  const same=(a,b)=>clean(a).toLocaleLowerCase('es')===clean(b).toLocaleLowerCase('es');
  const firstSentence=value=>sentences(value)[0]||clean(value);
  const sourceName=value=>clean(value).replace(/\s*[·|-]\s*referencia general\s*$/i,'').replace(/\s*[·|-]\s*referencia heredada\s*$/i,'')||'Fuente';
  const setTextIfChanged=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};
  const sentence=value=>{const text=clean(value);return !text||/[.!?…]$/.test(text)?text:`${text}.`};
  const isEditorialMeta=value=>/^(la fecha concreta registrada|la misma ficha|la ficha (?:sitúa|ubica|registra)|preguntamos|la fecha que preguntamos|contenido complementario|la ubicación temporal)/i.test(clean(value));
  const meaningfulSentences=value=>sentences(value).filter(part=>!isEditorialMeta(part));
  const included=(value,collection)=>{const normalized=clean(value).toLocaleLowerCase('es');return !normalized||collection.some(item=>{const other=clean(item).toLocaleLowerCase('es');return other===normalized||other.includes(normalized)||normalized.includes(other)})};

  function currentQuestion(){
    try{if(typeof round==='undefined'||!round?.questionIds)return null;return displayQuestion(round.questionIds[round.index])||QUESTION_BY_ID.get(round.questionIds[round.index])||null}catch{return null}
  }
  function currentAnswer(){
    try{return round?.phase==='answer'?round.answers?.[round.index]||round.answers?.at?.(-1)||null:null}catch{return null}
  }
  function track(name,props={}){try{window.qyaAnalytics?.track?.(name,{app_version:VERSION,app_surface:'learning_v16',...props})}catch{}}

  function learningFor(q){
    if(!q)return {what:'',importance:'',memory:'',context:'',temporal:''};
    const fact=clean(q.fact),context=clean(q.context),significance=clean(q.significance);
    const contextSentences=meaningfulSentences(context),factSentences=meaningfulSentences(fact),significanceSentences=meaningfulSentences(significance);
    const what=contextSentences[0]||factSentences[0]||'';
    let importance=significanceSentences.join(' ');
    if(!importance&&contextSentences.length>1)importance=contextSentences.slice(1,3).join(' ');
    let memory='';
    const cleanFact=factSentences.join(' ');
    if(cleanFact&&!same(cleanFact,what))memory=cleanFact;
    if(!memory&&contextSentences.length>2)memory=contextSentences.at(-1);
    if(memory&&same(memory,importance))memory='';
    const ext=typeof qaExtendedContext==='function'?qaExtendedContext(q):(q.extendedContext||{});
    const temporal=meaningfulSentences(ext?.locate).join(' ');
    return {what,importance,memory,context:contextSentences.join(' '),temporal,source:clean(q.source),sourceLabel:sourceName(q.sourceLabel)};
  }

  function learningBlocks(q){
    const l=learningFor(q),rows=[];
    if(l.what)rows.push(['what',l.what]);
    if(l.importance&&!same(l.importance,l.what))rows.push(['importance',l.importance]);
    if(l.memory&&!same(l.memory,l.what)&&!same(l.memory,l.importance))rows.push(['memory',l.memory]);
    return rows.slice(0,3);
  }

  function learningNarrative(q){
    const values=learningBlocks(q).map(([,value])=>sentence(value)).filter(Boolean),paragraphs=[];
    if(values.length)paragraphs.push(values.slice(0,2).join(' '));
    if(values.length>2)paragraphs.push(values[2]);
    return paragraphs;
  }

  function makeLearningCard(q){
    const card=document.createElement('section');card.className='v16-learning-card';card.setAttribute('aria-label','Aprendizaje esencial');
    const head=document.createElement('div');head.className='v16-learning-head';head.innerHTML='<span class="eyebrow">APRENDIZAJE ESENCIAL</span>';card.append(head);
    for(const value of learningNarrative(q)){
      const p=document.createElement('p');p.className='v16-learning-narrative';p.textContent=value;card.append(p);
    }
    return card;
  }

  function rebuildDeepContext(doc,q){
    if(!doc||!q)return false;
    const l=learningFor(q),copy=doc.querySelector('.atlas-document-copy');
    if(q.v12GeneratedImage||q.v14GeneratedFallback){
      const fig=doc.querySelector('.atlas-document-image');if(fig)fig.remove();doc.classList.remove('has-image');doc.classList.add('no-image');
    }
    if(!copy)return false;
    const essential=learningBlocks(q).map(([,value])=>value),parts=[];
    const contextExtra=meaningfulSentences(l.context).filter(value=>!included(value,essential)).join(' ');
    if(contextExtra)parts.push(`<section><span>CONTEXTO</span><p>${esc(contextExtra)}</p></section>`);
    if(l.importance&&!included(l.importance,[...essential,contextExtra]))parts.push(`<section><span>POR QUÉ IMPORTA</span><p>${esc(l.importance)}</p></section>`);
    if(l.temporal&&!included(l.temporal,[...essential,contextExtra,l.importance]))parts.push(`<section class="v16-temporal-secondary"><span>UBICACIÓN TEMPORAL</span><p>${esc(l.temporal)}</p></section>`);
    const src=l.source&&safeURL(l.source)?`<a class="atlas-source" href="${esc(safeURL(l.source))}" target="_blank" rel="noopener noreferrer">Fuente · ${esc(l.sourceLabel)} ↗</a>`:'';
    copy.innerHTML=`${parts.join('')}${src?`<footer>${src}</footer>`:''}`;
    doc.querySelectorAll('.v14-editorial-note').forEach(x=>x.remove());
    return parts.length>0;
  }

  function decorateDifficulty(){
    const d=document.querySelector('.atlas-header-meta span:nth-child(2)');if(!d)return;
    d.title='Dificultad editorial estimada. No modifica el puntaje.';
    d.setAttribute('aria-label',`${d.textContent.trim()}. Dificultad editorial estimada; no modifica el puntaje.`);
  }

  function decorateFeedback(){
    const surface=document.querySelector('.atlas-v12.is-answered'),q=currentQuestion(),a=currentAnswer();if(!surface||!q||!a)return;
    const key=`${round?.uid||'run'}:${round?.index||0}:${q.id}`;
    decorateDifficulty();
    const learn=surface.querySelector('.atlas-learn');if(!learn)return;
    const legacyEssential=learn.querySelector('.v15-essential'),legacyToggle=learn.querySelector('.v15-context-button');
    if(legacyEssential&&!legacyEssential.hidden)legacyEssential.hidden=true;if(legacyToggle&&!legacyToggle.hidden)legacyToggle.hidden=true;

    let card=learn.querySelector('.v16-learning-card'),toggle=learn.querySelector('.v16-context-button');
    const doc=learn.querySelector('.atlas-document');
    if(!card){card=makeLearningCard(q);if(doc)doc.before(card);else learn.querySelector('.atlas-learn-head')?.after(card)}
    if(!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='v16-context-button';toggle.dataset.v16Action='context-toggle';toggle.setAttribute('aria-expanded','false');toggle.textContent='Profundizar';if(doc)doc.before(toggle);else card.after(toggle)}
    if(doc&&doc.dataset.v16Question!==q.id){
      doc.dataset.v16Question=q.id;doc.classList.add('v16-context');doc.classList.remove('v15-context-open');doc.classList.add('v15-collapsed-context');
      const hasDeepContext=rebuildDeepContext(doc,q);doc.hidden=!hasDeepContext;toggle.hidden=!hasDeepContext;
    }

    const note=surface.querySelector('.v15-result-note');setTextIfChanged(note,a.skipped?'Fecha revelada y guardada para repaso.':a.timedOut?'Se agotó el tiempo; registramos el año que estaba seleccionado.':'La fecha queda registrada para tu repaso.');
    const primary=surface.querySelector('#primaryAction');if(primary){setTextIfChanged(primary,round.index===round.questionIds.length-1?'Ver resultados →':'Siguiente →');const label=round.index===round.questionIds.length-1?'Ver resultados':'Ir a la siguiente pregunta';if(primary.getAttribute('aria-label')!==label)primary.setAttribute('aria-label',label)}
    if(lastFeedbackKey!==key){lastFeedbackKey=key;track('learning_context_seen',{question_id:q.id,question_position:(round?.index??0)+1,learning_blocks:learningBlocks(q).length})}
  }

  function reviewCandidates(s){
    return (s?.answers||[]).filter(a=>a.skipped||Number(a.error)>5).sort((a,b)=>(b.skipped?1:0)-(a.skipped?1:0)||(Number(b.error)||0)-(Number(a.error)||0));
  }
  function learningCue(q){const l=learningFor(q);return firstSentence(l.importance||l.memory||l.what||q.fact||q.context)}

  function decorateSummary(s=lastSummary){
    const root=document.querySelector('.summary-v11');if(!root||!s)return;
    const expected=s.answers?.length||0,key=`${s.uid||s.date}:${s.total}:${expected}`;
    const alreadyComplete=root.querySelectorAll('.v16-learned-item').length===expected&&!!root.querySelector('.v16-review-next');
    if(alreadyComplete&&lastSummaryKey===key)return;

    const h=root.querySelector('.summary-head h1');if(h&&s.mode==='daily')h.textContent='Archivo de hoy completo';
    const signature=root.querySelector('.answer-signature.archive-signature,.answer-signature');
    const roundSection=root.querySelector('.summary-round')||signature?.parentElement;
    if(!roundSection)return;

    const items=s.answers.map((a,i)=>{const q=displayQuestion(a.id)||QUESTION_BY_ID.get(a.id),cue=q?learningCue(q):'';return `<button class="v16-learned-item" data-action="detail" data-id="${esc(a.id)}"><span class="v16-learned-index">${String(i+1).padStart(2,'0')}</span><span><b>${esc(q?.title||a.title)} · ${a.actual}</b><small>${esc(cue||'Hito guardado en tu archivo.')}</small></span><strong>${a.skipped?'Repasar':a.error===0?'Exacta':`${a.error} ${a.error===1?'año':'años'}`}</strong></button>`}).join('');
    roundSection.innerHTML=`<div class="summary-section-title"><div><span class="eyebrow">QUÉ APRENDISTE HOY</span><h2>Cinco fechas, cinco ideas para recordar</h2></div><span class="summary-section-hint">Toca un hito para abrir su ficha</span></div><div class="v16-learned-list">${items}</div>`;

    root.querySelector('.v16-review-next')?.remove();
    const candidates=reviewCandidates(s),next=document.createElement('section');next.className='v16-review-next';
    const names=candidates.slice(0,2).map(a=>displayQuestion(a.id)?.title||a.title);
    next.innerHTML=`<div><span class="eyebrow">PARA TU PRÓXIMO REPASO</span><h2>${names.length?`Conviene volver a ${esc(names.join(names.length===2?' y ':''))}`:'No hay una fecha urgente para recuperar'}</h2><p>${names.length?'Seleccionamos las mayores desviaciones u omisiones de esta sesión.':'Tus cinco respuestas quedaron dentro de un rango que no exige recuperación inmediata.'}</p></div><div class="v16-review-actions"></div>`;
    const footer=root.querySelector('.summary-footer'),actions=next.querySelector('.v16-review-actions'),primary=footer?.querySelector('.summary-primary');if(primary&&actions)actions.append(primary);
    footer?.before(next);
    if(footer)footer.classList.add('v16-summary-footer');

    lastSummaryKey=key;root.dataset.v16='1';
    track('summary_learning_seen',{mode:s.mode,questions_count:expected,review_candidates:candidates.length});
  }

  const baseOpenDetail=openDetail;
  openDetail=function(id){
    const q=displayQuestion(id);if(!q)return;
    const s=getState(),seen=discoveredIds(s).has(id),revealedInOrder=s.timelineDraft?.answered&&s.timelineDraft.ids.includes(id),answeredNow=round?.phase==='answer'&&round.questionIds[round.index]===id;if(!seen&&!revealedInOrder&&!answeredNow)return;
    const l=learningFor(q),st=s.questionStats[id],src=l.source&&safeURL(l.source),photo=safeAsset(q.image),usePhoto=photo&&!q.v12GeneratedImage&&!q.v14GeneratedFallback;
    const blocks=[];if(l.context)blocks.push(`<section><b>Contexto</b><p>${esc(l.context)}</p></section>`);if(l.importance&&!same(l.importance,l.context))blocks.push(`<section><b>Por qué importa</b><p>${esc(l.importance)}</p></section>`);if(q.fact&&!same(q.fact,l.context))blocks.push(`<section><b>Dato de la fecha</b><p>${esc(q.fact)}</p></section>`);
    openDialog(q.title,`<div class="v16-detail-head"><strong class="feedback-year">${q.year}</strong><span class="pill cat">${esc(q.category)}</span></div><div class="v16-detail-body">${blocks.join('')}</div>${usePhoto?`<figure class="v16-detail-image"><img src="${photo}" alt="${esc(q.imageAlt)}"><figcaption>${esc(q.imageCredit||'Imagen de apoyo')}${q.imageLicense?` · ${esc(q.imageLicense)}`:''}</figcaption></figure>`:''}${src?`<p class="source-note">Fuente · <a href="${esc(src)}" target="_blank" rel="noopener noreferrer">${esc(l.sourceLabel)}</a></p>`:''}${st?`<div class="metric-row v16-detail-metrics"><div class="metric"><b>${st.attempts}</b><span>intentos</span></div><div class="metric"><b>${fmt(st.avgError)}</b><span>error medio</span></div><div class="metric"><b>${fmt(st.bestError,0)}</b><span>mejor error</span></div></div>`:''}`);
    track('detail_opened',{question_id:q.id,source:'v16_detail'});
  };

  function decorateQuestion(){
    const surface=document.querySelector('.atlas-v12.is-question');if(!surface)return;decorateDifficulty();
  }
  function inspect(){
    if(document.querySelector('.atlas-v12.is-question'))decorateQuestion();
    if(document.querySelector('.atlas-v12.is-answered'))decorateFeedback();
    if(document.querySelector('.summary-v11'))decorateSummary(lastSummary);
  }

  document.addEventListener('click',e=>{
    const toggle=e.target.closest?.('[data-v16-action="context-toggle"]');if(!toggle)return;
    const surface=toggle.closest('.atlas-v12.is-answered'),doc=surface?.querySelector('.atlas-document');if(!doc)return;
    const open=toggle.getAttribute('aria-expanded')==='true';
    toggle.setAttribute('aria-expanded',String(!open));toggle.textContent=open?'Profundizar':'Ocultar contexto';
    doc.classList.toggle('v15-collapsed-context',open);doc.classList.toggle('v15-context-open',!open);
    if(!open)track('context_expanded',{question_id:currentQuestion()?.id||null,source:'v16_progressive'});
  },true);

  window.__QYA_RUNTIME__?.onRender(inspect);
  inspect();
  window.__QA_V16__=Object.freeze({version:VERSION,learningFor,learningBlocks,learningNarrative,decorateSummary,inspect});
})();
