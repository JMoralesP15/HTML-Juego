/* QUÉ AÑO — product iteration v1.3 preview.
 * Real product changes only: mobile hierarchy, progressive historical feedback,
 * collection sets and a learning-oriented review loop. No calendar/year mutations.
 */
(function(){
  'use strict';

  const V13_SETS=[
    {id:'chile',title:'Chile contemporáneo',note:'Hitos para construir una línea temporal local antes de compararla con el resto del mundo.',filter:q=>q.category==='Chile'},
    {id:'science-tech',title:'Ciencia y tecnología',note:'Descubrimientos, dispositivos e infraestructura que cambiaron lo que era posible.',filter:q=>['Ciencia','Tecnología'].includes(q.category)},
    {id:'screen-sound',title:'Pantallas y sonido',note:'Cine, música y videojuegos leídos como una misma historia cultural.',filter:q=>['Cine','Música','Videojuegos'].includes(q.category)},
    {id:'culture-history',title:'Cultura e historia',note:'Procesos políticos, sociales y culturales para conectar acontecimientos con su época.',filter:q=>['Historia','Cultura'].includes(q.category)},
    {id:'late-century',title:'Fin de siglo · 1970–1999',note:'Tres décadas densas para entrenar referencias temporales cercanas entre sí.',filter:q=>q.year>=1970&&q.year<=1999},
    {id:'new-millennium',title:'Nuevo milenio · 2000–2026',note:'Hitos recientes donde la memoria autobiográfica puede ayudar o engañar.',filter:q=>q.year>=2000}
  ];

  const median=values=>{if(!values.length)return null;const a=[...values].sort((x,y)=>x-y),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2};
  const fmtGain=n=>Number.isFinite(n)?`${n>=0?'+':''}${n.toLocaleString('es-CL',{maximumFractionDigits:1})}`:'—';

  function qaV13LearningGain(s=getState()){
    const byId=new Map();
    const runs=[...(s.sessions||[]),...(s.reviewSessions||[]),...(s.practiceSessions||[])].filter(r=>r&&Array.isArray(r.answers)&&typeof r.date==='string').sort((a,b)=>a.date.localeCompare(b.date));
    for(const run of runs){
      for(const a of run.answers){
        if(!a||a.skipped||!Number.isFinite(Number(a.error)))continue;
        if(!byId.has(a.id))byId.set(a.id,new Map());
        byId.get(a.id).set(run.date,Number(a.error));
      }
    }
    const gains=[];
    for(const dates of byId.values()){
      const attempts=[...dates.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([,error])=>error);
      for(let i=1;i<attempts.length;i++)gains.push(attempts[i-1]-attempts[i]);
    }
    return {pairs:gains.length,mean:gains.length?gains.reduce((a,b)=>a+b,0)/gains.length:null,median:median(gains),improvedRate:gains.length?gains.filter(g=>g>0).length/gains.length:null};
  }

  function qaV13Track(name,props={}){
    try{window.qyaAnalytics?.track?.(name,{app_surface:'product_v13',...props})}catch{}
  }

  function qaV13DecorateFeedback(root=document){
    const feedback=root.querySelector?.('.atlas-feedback');
    if(!feedback||feedback.dataset.v13Feedback==='true')return;
    feedback.dataset.v13Feedback='true';

    const sequence=document.createElement('div');
    sequence.className='v13-feedback-sequence';
    sequence.setAttribute('aria-label','Secuencia del feedback');
    sequence.innerHTML='<span>1 · estimaste</span><i aria-hidden="true">→</i><span>2 · revelaste</span><i aria-hidden="true">→</i><span>3 · ubicaste</span><i aria-hidden="true">→</i><strong>4 · comprende</strong>';
    feedback.prepend(sequence);

    const copy=feedback.querySelector('.atlas-document-copy');
    if(!copy||copy.dataset.v13Context==='true')return;
    copy.dataset.v13Context='true';
    const sections=[...copy.querySelectorAll(':scope > section')];
    if(sections.length<2)return;

    const extra=document.createElement('div');
    extra.className='v13-context-extra';
    extra.id=`v13Context-${Math.random().toString(36).slice(2,8)}`;
    extra.hidden=true;
    sections.slice(1).forEach(section=>extra.append(section));

    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='secondary v13-context-toggle';
    toggle.dataset.v13Action='context-toggle';
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-controls',extra.id);
    toggle.innerHTML='<span>Profundizar contexto</span><small>Por qué importa + ubicación temporal</small>';

    const footer=copy.querySelector(':scope > footer');
    copy.insertBefore(toggle,footer||null);
    copy.insertBefore(extra,footer||null);
  }

  function qaV13DecorateReview(root=document){
    const section=root.querySelector?.('.review-section');
    if(!section||section.querySelector('.v13-learning-panel'))return;
    const s=getState(),due=eligibleReviews(s).filter(x=>x.dueIn<=0),weak=weakestCategory(s),gain=qaV13LearningGain(s);
    const recommendation=due.length?`${due.length} ${due.length===1?'fecha está':'fechas están'} listas para recuperar`:weak?`${weak} es hoy tu categoría más frágil`:'Todavía falta historial para detectar un punto débil';
    const gainCopy=gain.pairs?`En ${gain.pairs} comparaciones entre días, tu error cambió en promedio ${fmtGain(gain.mean)} años; mejoraste en ${Math.round(gain.improvedRate*100)}% de ellas.`:'El indicador de aprendizaje aparecerá cuando una misma fecha tenga respuestas en días distintos.';
    const panel=document.createElement('section');
    panel.className='v13-learning-panel';
    panel.innerHTML=`<div><span class="eyebrow">SIGUIENTE SESIÓN</span><h2>${esc(recommendation)}</h2><p>${esc(gainCopy)}</p></div><div class="v13-learning-metric"><small>LEARNING GAIN</small><strong>${gain.pairs?fmtGain(gain.mean):'—'}</strong><span>${gain.pairs?'años de error':'sin pares todavía'}</span></div><button class="primary" data-v13-action="smart-review">Entrenar ahora →</button>`;
    section.querySelector('.subnav')?.insertAdjacentElement('afterend',panel);
  }

  function qaV13SetProgress(def,s){
    const seen=discoveredIds(s),qs=QUESTIONS.filter(def.filter),known=qs.filter(q=>seen.has(q.id)),mastered=known.filter(q=>mastery(s.questionStats[q.id]).key==='mastered');
    return {qs,known,mastered,discovery:qs.length?Math.round(known.length/qs.length*100):0,mastery:known.length?Math.round(mastered.length/known.length*100):0};
  }

  function qaV13CollectionNav(){
    const current=collectionNav();
    return current.replace('</div>','<button class="active" data-v13-action="collection-sets" aria-pressed="true">Sets</button></div>');
  }

  function qaV13RenderCollectionSets(){
    const s=getState(),seen=discoveredIds(s),mastered=Object.values(s.questionStats).filter(x=>mastery(x).key==='mastered').length,gain=qaV13LearningGain(s);
    collectionState.mode='v13sets';
    const cards=V13_SETS.map(def=>{
      const p=qaV13SetProgress(def,s),remaining=p.known.filter(q=>mastery(s.questionStats[q.id]).key!=='mastered').length;
      return `<article class="v13-set-card"><div class="v13-set-kicker"><span>${p.known.length}/${p.qs.length} descubiertas</span><strong>${p.discovery}%</strong></div><h2>${esc(def.title)}</h2><p>${esc(def.note)}</p><div class="v13-dual-progress"><div><span>Archivo</span><div class="progress-track"><i style="width:${p.discovery}%"></i></div></div><div><span>Dominio · ${p.mastery}%</span><div class="progress-track mastery"><i style="width:${p.mastery}%"></i></div></div></div><footer><small>${p.mastered.length} consolidadas · ${remaining} por reforzar</small><button class="secondary" data-v13-action="practice-set" data-set="${def.id}" ${p.known.length?'':'disabled'}>Practicar set</button></footer></article>`;
    }).join('');
    setView(`<section class="section-scroll v13-collection-sets"><header class="section-head"><div><span class="eyebrow">TU ARCHIVO</span><h1>Colección</h1><p>${seen.size}/${QUESTIONS.length} descubiertas · ${mastered} consolidadas</p></div><div class="v13-collection-signal"><small>APRENDIZAJE ENTRE DÍAS</small><strong>${gain.pairs?fmtGain(gain.mean):'—'}</strong><span>${gain.pairs?`${gain.pairs} comparaciones`:'aún sin pares'}</span></div></header>${qaV13CollectionNav()}<div class="v13-set-intro"><div><span class="eyebrow">SETS DE ARCHIVO</span><h2>La colección también se juega.</h2></div><p>Los sets agrupan fechas para que descubrir no sea el final: completa un archivo, detecta lo que aún confundes y vuelve a entrenarlo.</p></div><div class="v13-set-grid">${cards}</div></section>`);
    qaV13Track('collection_sets_opened',{sets_count:V13_SETS.length,discovered_count:seen.size,mastered_count:mastered});
  }

  function qaV13PracticeSet(id){
    const def=V13_SETS.find(x=>x.id===id);if(!def)return;
    const s=getState(),seen=discoveredIds(s),reserved=typeof reservedUpcomingIds==='function'?reservedUpcomingIds(7):new Set();
    const candidates=QUESTIONS.filter(def.filter).filter(q=>seen.has(q.id)&&!reserved.has(q.id)).sort((a,b)=>{
      const sa=s.questionStats[a.id]||{},sb=s.questionStats[b.id]||{};
      const pa=(sa.lastSkipped?100:0)+(Number(sa.lastError)||0)*2+(Number(sa.avgError)||0),pb=(sb.lastSkipped?100:0)+(Number(sb.lastError)||0)*2+(Number(sb.avgError)||0);
      return pb-pa;
    });
    const learning=candidates.filter(q=>mastery(s.questionStats[q.id]).key!=='mastered'),pool=(learning.length?learning:candidates).slice(0,5);
    if(!pool.length){toast('Descubre al menos una fecha de este set antes de entrenarlo.');return}
    qaV13Track('collection_set_practice_started',{set_id:id,questions_count:pool.length});
    startPractice('reinforce','Todas',5,pool.map(q=>q.id));
  }

  function qaV13SmartReview(){
    const s=getState(),due=eligibleReviews(s).filter(x=>x.dueIn<=0),weak=weakestCategory(s);
    if(due.length){qaV13Track('smart_review_started',{strategy:'due',questions_count:Math.min(5,due.length)});startPractice('due','Todas',5);return}
    if(weak){qaV13Track('smart_review_started',{strategy:'weakest',category:weak});startPractice('weakest','Todas',5);return}
    qaV13Track('smart_review_started',{strategy:'failed'});startPractice('failed','Todas',5);
  }

  function qaV13Decorate(root=document){
    qaV13DecorateFeedback(root);
    qaV13DecorateReview(root);
    const collection=root.querySelector?.('.section-scroll .section-head h1');
    if(collection?.textContent.trim()==='Colección'){
      const nav=root.querySelector('.subnav');
      if(nav&&!nav.querySelector('[data-v13-action="collection-sets"]'))nav.insertAdjacentHTML('beforeend','<button data-v13-action="collection-sets" aria-pressed="false">Sets</button>');
    }
  }

  const baseSetView=window.setView||setView;
  setView=function(html){const result=baseSetView(html);qaV13Decorate(document);return result};

  document.addEventListener('click',event=>{
    const target=event.target.closest?.('[data-v13-action]');if(!target||target.disabled)return;
    const action=target.dataset.v13Action;
    if(action==='context-toggle'){
      const extra=document.getElementById(target.getAttribute('aria-controls'));if(!extra)return;
      const open=target.getAttribute('aria-expanded')==='true';extra.hidden=open;target.setAttribute('aria-expanded',String(!open));target.querySelector('span').textContent=open?'Profundizar contexto':'Ocultar contexto ampliado';
      if(!open)qaV13Track('context_expanded',{source:'feedback_progressive'});
    }
    if(action==='collection-sets')qaV13RenderCollectionSets();
    if(action==='practice-set')qaV13PracticeSet(target.dataset.set);
    if(action==='smart-review')qaV13SmartReview();
  });

  qaV13Decorate(document);
  window.__QA_V13__=Object.freeze({learningGain:qaV13LearningGain,sets:V13_SETS.map(({id,title})=>({id,title})),renderCollectionSets:qaV13RenderCollectionSets});
})();