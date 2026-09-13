/* QUÉ AÑO v1.5 — simplificación y claridad.
 * v1.7: las decoraciones visuales usan el contrato de render compartido.
 * v1.8.5: SCORING_TIMER pertenece a Atlas; esta capa ya no redefine el reloj.
 */
(function(){
  'use strict';

  const VERSION='1.5.0-beta.1';

  function currentQuestion(){
    try{if(typeof round==='undefined'||!round?.questionIds)return null;return QUESTION_BY_ID.get(round.questionIds[round.index])||null}catch{return null}
  }
  function currentAnswer(){
    try{return round?.phase==='answer'?round.answers?.[round.index]||round.answers?.at?.(-1)||null:null}catch{return null}
  }
  function track(name,props={}){try{window.qyaAnalytics?.track?.(name,{app_version:VERSION,...props})}catch{}}
  function resultDistance(a){
    if(!a)return '';
    if(a.skipped)return 'Fecha revelada para repasar';
    if(a.error===0)return 'Respuesta exacta';
    const unit=a.error===1?'año':'años';
    return `${a.error} ${unit} ${a.guess<a.actual?'antes':'después'}`;
  }
  function setTextIfChanged(el,text){if(el&&el.textContent!==text)el.textContent=text}
  function setAttrIfChanged(el,name,value){if(el&&el.getAttribute(name)!==value)el.setAttribute(name,value)}
  function updateConfirmCTA(){
    const b=document.querySelector('.atlas-v12.is-question #primaryAction');
    if(b&&round?.phase==='question'){
      const text=`Confirmar ${round.guess}`;
      setTextIfChanged(b,text);setAttrIfChanged(b,'aria-label',`Confirmar respuesta: ${round.guess}`);
    }
  }

  /* Telemetría explícita de las acciones de v1.5. El dominio timer/scoring no se redefine aquí. */
  const baseCommitAnswer=commitAnswer;
  commitAnswer=function(skipped=false,options={}){
    const q=currentQuestion(),before=qaTimerSnapshot();
    const out=baseCommitAnswer(skipped,options);const a=currentAnswer();
    track(skipped?'answer_skipped':'answer_confirmed',{question_id:q?.id||null,estimated_year:a?.guess??null,response_ms:a?.elapsedMs??before.elapsedMs??null,timed_out:Boolean(a?.timedOut)});
    return out;
  };

  const baseNextQuestion=nextQuestion;
  nextQuestion=function(){const q=currentQuestion();track('next_question',{question_id:q?.id||null,question_position:(round?.index??0)+1});return baseNextQuestion()};

  /* CTA sincronizado también cuando ±1/±10 llama setYear sin disparar input. */
  const baseSetYear=setYear;
  setYear=function(value,opts={}){const out=baseSetYear(value,opts);requestAnimationFrame(updateConfirmCTA);return out};

  /* Ambiente deja de competir en header y se administra desde Ajustes. */
  const baseOpenSettings=openSettings;
  openSettings=function(){
    baseOpenSettings();
    const host=document.getElementById('dialogContent');if(!host||host.querySelector('#v15AmbientSetting'))return;
    const ambient=window.__QA_V14__?.ambient;
    const row=document.createElement('div');row.className='settings-row v15-ambient-setting';
    const copy=document.createElement('div'),b=document.createElement('b'),small=document.createElement('small');b.textContent='Ambiente musical';small.textContent='Capa generativa opcional. Nunca se reproduce sin una acción tuya.';copy.append(b,small);
    const button=document.createElement('button');button.type='button';button.id='v15AmbientSetting';button.className='secondary';button.textContent=ambient?.enabled?'Desactivar':'Activar';button.setAttribute('aria-pressed',String(Boolean(ambient?.enabled)));
    row.append(copy,button);host.querySelector('.settings-row')?.after(row);
    const note=host.querySelector('.source-note');if(note)note.textContent='QUÉ AÑO 1.7 beta · 300 hitos. Juego, fallback visual y sonidos funcionales siguen disponibles offline.';
  };

  function setChrome(inGame){
    const should=Boolean(inGame);if(document.body.classList.contains('v15-in-game')!==should)document.body.classList.toggle('v15-in-game',should);
  }

  function simplifyHeader(){
    const session=document.querySelector('.atlas-header-session');if(!session)return;
    let span=session.querySelector('.v15-progress-text');
    if(!span){span=document.createElement('span');span.className='v15-progress-text';session.append(span)}
    setTextIfChanged(span,`${(round?.index??0)+1} / ${round?.questionIds?.length||5}`);
  }

  function simplifyQuestion(q){
    const surface=document.querySelector('.atlas-v12.is-question');if(!surface||!q)return;
    simplifyHeader();
    const fig=surface.querySelector('.atlas-question-image');
    if(fig){
      const useful=Boolean(q.imageType==='documentary'&&!q.v12GeneratedImage&&!q.v14GeneratedFallback);
      if(fig.classList.contains('v15-documentary')!==useful)fig.classList.toggle('v15-documentary',useful);
    }
    updateConfirmCTA();
  }

  function simplifyFeedback(q,a){
    const surface=document.querySelector('.atlas-v12.is-answered');if(!surface||!q||!a)return;
    simplifyHeader();
    const reveal=surface.querySelector('.atlas-reveal');
    if(reveal&&!reveal.querySelector('.v15-result-hero')){
      const hero=document.createElement('div');hero.className='v15-result-hero';
      const years=document.createElement('div');years.className='v15-result-years';
      if(a.skipped)years.innerHTML=`<span class="actual">${a.actual}</span>`;else years.innerHTML=`<span>${a.guess}</span><span class="arrow" aria-hidden="true">→</span><span class="actual">${a.actual}</span>`;
      const distance=document.createElement('p');distance.className='v15-result-distance';distance.textContent=resultDistance(a);
      const note=document.createElement('p');note.className='v15-result-note';note.textContent=a.timedOut?'Se agotaron los 15 segundos y registramos la estimación que estaba seleccionada.':a.skipped?'Queda guardada para repaso.':'Tu ubicación temporal queda registrada para el repaso.';
      hero.append(years,distance,note);reveal.prepend(hero);
    }

    const learn=surface.querySelector('.atlas-learn');
    if(learn&&!learn.querySelector('.v15-essential')){
      const ext=typeof qaExtendedContext==='function'?qaExtendedContext(q):(q.extendedContext||{});
      const essential=document.createElement('div');essential.className='v15-essential';
      const fact=document.createElement('p');fact.textContent=ext.what||q.fact||`${q.title}: ${q.year}.`;essential.append(fact);
      if(ext.locate){const locate=document.createElement('p');locate.textContent=ext.locate;essential.append(locate)}
      const doc=learn.querySelector('.atlas-document');
      if(doc){doc.classList.add('v15-collapsed-context');const button=document.createElement('button');button.type='button';button.className='v15-context-button';button.dataset.v15Action='context-toggle';button.setAttribute('aria-expanded','false');button.textContent='Ver contexto e imagen';doc.before(essential,button)}
      else learn.querySelector('.atlas-learn-head')?.after(essential);
    }
    const primary=surface.querySelector('#primaryAction');if(primary)setTextIfChanged(primary,round.index===round.questionIds.length-1?'Ver resultados':'Siguiente');
  }

  function inspect(){
    const surface=document.querySelector('#view .atlas-v12');setChrome(Boolean(surface));if(!surface)return;
    const q=currentQuestion();if(!q)return;
    if(round?.phase==='question')simplifyQuestion(q);else if(round?.phase==='answer')simplifyFeedback(q,currentAnswer());
  }

  document.addEventListener('input',e=>{if(e.target?.id==='yearInput'||e.target?.id==='yearSlider')requestAnimationFrame(updateConfirmCTA)},true);

  document.addEventListener('click',e=>{
    const ambient=e.target.closest?.('#v15AmbientSetting');
    if(ambient){const engine=window.__QA_V14__?.ambient;if(engine){engine.toggle();setTextIfChanged(ambient,engine.enabled?'Desactivar':'Activar');setAttrIfChanged(ambient,'aria-pressed',String(engine.enabled))}return}
    const toggle=e.target.closest?.('[data-v15-action="context-toggle"]');if(!toggle)return;
    const doc=toggle.nextElementSibling?.classList?.contains('atlas-document')?toggle.nextElementSibling:document.querySelector('.atlas-document');if(!doc)return;
    const open=!doc.classList.contains('v15-context-open');doc.classList.toggle('v15-context-open',open);doc.classList.toggle('v15-collapsed-context',!open);setAttrIfChanged(toggle,'aria-expanded',String(open));setTextIfChanged(toggle,open?'Ocultar contexto':'Ver contexto e imagen');
    if(open){doc.querySelector('.v13-context-extra')?.removeAttribute('hidden');track('context_expanded',{question_id:currentQuestion()?.id||null})}
  },true);

  window.__QYA_RUNTIME__?.onRender(inspect);
  inspect();

  window.__QA_V15__={version:VERSION,inspect,remaining:()=>qaTimerComputeRemaining(),timerDeadline:()=>qaTimer?.deadline||null};
})();