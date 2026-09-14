/* QUÉ AÑO v1.2 — ATLAS TEMPORAL.
   Identidad, temporizador, scoring temporal, feedback y accesibilidad.
   Capa aditiva: no altera IDs, años, calendario, scheduler ni repetición espaciada.
   v1.8.5: Atlas es el owner canónico de SCORING_TIMER. */

const QA_TIMER_DURATION_MS=15000;
const QA_TIMER_SCORING_VERSION=IS_HUMAN_TESTER?'precision-reading-v1':'timer-v1';
let qaTimer={key:null,interval:null,remainingMs:QA_TIMER_DURATION_MS,deadline:null,lastTickAt:null,paused:false,expired:false,announced5:false,lastSoundSecond:null};

/* Los SVG editoriales están embebidos en content-v12.js: siguen siendo offline. */
const qaBaseSafeAsset=safeAsset;
safeAsset=function(url){
  const local=qaBaseSafeAsset(url);if(local)return local;
  return typeof url==='string'&&url.startsWith('data:image/svg+xml;charset=utf-8,')&&url.length<30000?url:'';
};

/* Persistencia retrocompatible de los nuevos campos de tiempo. */
const qaBaseNormalizeAnswer=normalizeAnswer;
normalizeAnswer=function(a){
  const out=qaBaseNormalizeAnswer(a);if(!out)return null;
  const base=out.skipped?0:(Number.isFinite(Number(a?.basePoints))?Math.max(0,Math.round(Number(a.basePoints))):points(out.error));
  const bonus=out.skipped?0:(Number.isFinite(Number(a?.timeBonus))?Math.max(0,Math.round(Number(a.timeBonus))):0);
  out.basePoints=base;out.timeBonus=bonus;out.points=out.skipped?0:base+bonus;
  out.elapsedMs=a?.elapsedMs==null?null:Math.max(0,Math.min(QA_TIMER_DURATION_MS,Number(a.elapsedMs)||0));
  out.remainingMs=a?.remainingMs==null?null:Math.max(0,Math.min(QA_TIMER_DURATION_MS,Number(a.remainingMs)||0));
  out.timedOut=Boolean(a?.timedOut);out.scoringVersion=typeof a?.scoringVersion==='string'?a.scoringVersion:null;
  return out;
};
const qaBaseSessionFromAnswers=sessionFromAnswers;
sessionFromAnswers=function(date,answers,mode='daily',extra={}){
  const run=qaBaseSessionFromAnswers(date,answers,mode,extra),timed=answers.filter(a=>Number.isFinite(a.elapsedMs));
  run.avgElapsedMs=timed.length?mean(timed.map(a=>a.elapsedMs)):null;
  run.timeBonus=answers.reduce((sum,a)=>sum+(Number(a.timeBonus)||0),0);
  run.scoringVersion=answers.some(a=>a.scoringVersion===QA_TIMER_SCORING_VERSION)?QA_TIMER_SCORING_VERSION:(extra.scoringVersion||null);
  return run;
};

if(typeof auditQuestionBank==='function'){
  const qaBaseAuditQuestionBank=auditQuestionBank;
  auditQuestionBank=function(){const r=qaBaseAuditQuestionBank();r.images=QUESTIONS.filter(q=>q.image).length;r.extendedContext=QUESTIONS.filter(q=>q.extendedContext).length;r.v12=typeof QA_V12_COVERAGE!=='undefined'?QA_V12_COVERAGE:null;return r};
}

// Learning edition: render ownership stays in Atlas; no additional runtime layer.
let qaHumanReadyKey=null;
function qaHumanBegin(){
  if(!round||round.phase!=='question')return;
  qaHumanReadyKey=qaTimerKey();renderGame();focusYear();
}
function qaHumanLearning(q){
  const summary=q.approvedLearning?.summary||q.context||q.fact||'';
  const brief=summary.match(/^.*?[.!?](?:\s|$)/s)?.[0]?.trim()||summary;
  return {brief,rest:summary.slice(brief.length).trim(),expanded:q.approvedLearning?.expanded||q.significance||''};
}
function qaHumanRender(q){
  const answering=round.phase==='question',ready=qaHumanReadyKey===qaTimerKey(),a=round.answers[round.index];
  let body,footer;
  if(answering){
    body=`<header class="friendly-progress"><span>Pregunta ${round.index+1} de ${round.questionIds.length}</span>${ready?qaTimerHTML():'<span>Sin prisa para leer</span>'}</header><div class="friendly-question"><p class="friendly-topic">${esc(q.title)}</p><h1 id="questionTitle">${esc(q.prompt)}</h1></div>`;
    if(ready)body+=`<div class="friendly-controls"><label for="yearInput">Tu año</label><div class="friendly-year"><button data-action="adjust" data-step="-1" aria-label="Restar un año">−1</button><input id="yearInput" type="number" inputmode="numeric" min="${GLOBAL_MIN_YEAR}" max="${GLOBAL_MAX_YEAR}" value="${round.guess}" aria-label="Año de tu estimación"><button data-action="adjust" data-step="1" aria-label="Sumar un año">+1</button></div><input id="yearSlider" type="range" min="${GLOBAL_MIN_YEAR}" max="${GLOBAL_MAX_YEAR}" value="${round.guess}" aria-label="Navegar por los años"><div class="friendly-range"><span>${GLOBAL_MIN_YEAR}</span><span>${GLOBAL_MAX_YEAR}</span></div></div>`;
    footer=ready?'<button class="secondary" data-action="skip">No lo sé</button><button class="primary" id="primaryAction" data-action="answer">Confirmar año</button>':'<p>Al continuar tendrás 15 segundos para elegir un año.</p><button class="primary" id="primaryAction" data-action="begin-answer">Estoy listo →</button>';
  }else{
    qaTimerStop();const l=qaHumanLearning(q),m=q.v18Media;
    const src=m?.src&&(safeURL(m.src)||safeAsset(m.src)||(/^data:image\/(png|jpeg|webp);base64,/.test(m.src)?m.src:''));
    const provenance=m?.sourcePage?.indexOf('https://',8)>0?m.src:m?.sourcePage||m?.src;
    body=`<header class="friendly-progress"><span>${round.index+1} de ${round.questionIds.length}</span><span>${a.skipped?'Para recordar':a.error===0?'¡Exacto!':`El evento ocurrió ${a.error} ${a.error===1?'año':'años'} ${a.actual<a.guess?'antes':'después'} de tu estimación`}</span></header><div class="friendly-result"><strong>${q.year}</strong><h1 id="questionTitle">${esc(q.title)}</h1></div>${src?`<figure class="friendly-photo"><img data-human-media src="${esc(src)}" alt="${esc(m.description||q.title)}" referrerpolicy="no-referrer"><figcaption><details><summary>Créditos y procedencia</summary><p>${esc(m.artist||'Procedencia indicada por editorial')} · ${esc(m.license||'Sin declaración de licencia')}</p>${safeURL(provenance)?`<a href="${esc(safeURL(provenance))}" target="_blank" rel="noopener noreferrer">Abrir fuente de la imagen ↗</a>`:''}</details></figcaption></figure>`:''}<p class="friendly-idea">${esc(l.brief)}</p><details class="friendly-context"><summary>Aprender más</summary>${l.rest?`<p>${esc(l.rest)}</p>`:''}${l.expanded?`<p>${esc(l.expanded)}</p>`:''}${safeURL(q.source)?`<a href="${esc(safeURL(q.source))}" target="_blank" rel="noopener noreferrer">${esc(q.sourceLabel||'Fuente del evento')} ↗</a>`:''}</details>`;
    footer=`<button class="primary" id="primaryAction" data-action="next">${round.index===round.questionIds.length-1?'Ver lo aprendido':'Siguiente'} →</button>`;
  }
  setView(`<section class="surface friendly-game ${answering?'friendly-playing':'friendly-answered'}" aria-labelledby="questionTitle">${body}<footer class="friendly-footer">${footer}</footer></section>`);
  if(answering&&ready)qaTimerStart();else if(answering){qaTimerStop();$('questionTitle')?.setAttribute('tabindex','-1');$('questionTitle')?.focus();}
}
function qaHumanSummary(s){
  const rows=s.answers.map(a=>{const q=displayQuestion(a.id),l=qaHumanLearning(q);return `<li><strong>${a.actual} · ${esc(q.title)}</strong><p>${esc(l.brief)}</p></li>`}).join('');
  setView(`<section class="surface friendly-game friendly-summary"><span>Sesión completada</span><h1>Hoy aprendiste</h1><p>${s.answers.length} fechas para recordar. ${s.exact} respuestas exactas.</p><ol>${rows}</ol><details><summary>Ver mis resultados</summary><p>${fmt(s.total,0)} puntos · ${fmt(s.avg)} años de diferencia media.</p></details><footer class="friendly-footer"><button class="primary" data-action="choose-topics">Elegir otra ronda →</button><button class="secondary" data-view="coleccion">Mi colección</button></footer></section>`);
}

function qaTimerKey(){return round&&round.phase==='question'?`${round.uid}:${round.index}:${round.questionIds[round.index]}`:null}
function qaTimerClearInterval(){if(qaTimer.interval!==null){clearInterval(qaTimer.interval);qaTimer.interval=null}}
function qaTimerComputeRemaining(){
  if(!qaTimer.key)return QA_TIMER_DURATION_MS;
  if(Number.isFinite(qaTimer.deadline))return Math.max(0,qaTimer.deadline-Date.now());
  return Math.max(0,Math.min(QA_TIMER_DURATION_MS,Number(qaTimer.remainingMs)||0));
}
function qaTimerSnapshot(){const remainingMs=Math.max(0,Math.min(QA_TIMER_DURATION_MS,qaTimerComputeRemaining()));return {remainingMs,elapsedMs:QA_TIMER_DURATION_MS-remainingMs,seconds:Math.ceil(remainingMs/1000),key:qaTimer.key,paused:qaTimer.paused,expired:qaTimer.expired}}
function qaTimerPaint(){
  const snap=qaTimerSnapshot(),secondsEl=$('qaTimerSeconds'),progress=$('qaTimerProgress'),shell=$('qaTimerShell');
  if(secondsEl)secondsEl.textContent=String(snap.seconds).padStart(2,'0');
  if(progress)progress.style.strokeDashoffset=String(100-(snap.remainingMs/QA_TIMER_DURATION_MS)*100);
  if(shell){shell.setAttribute('aria-valuenow',String(Math.max(0,Math.ceil(snap.remainingMs/1000))));shell.dataset.urgent=snap.remainingMs<=3000?'true':'false'}
  if(snap.remainingMs<=5000&&!qaTimer.announced5&&snap.remainingMs>0){qaTimer.announced5=true;$('answerAnnouncement').textContent='Quedan 5 segundos.'}
  const soundSecond=Math.ceil(snap.remainingMs/1000);
  if(soundSecond<=3&&soundSecond>0&&soundSecond!==qaTimer.lastSoundSecond){qaTimer.lastSoundSecond=soundSecond;qaTimerTickSound()}
}
function qaTimerTickSound(){
  const p=getState().preferences;if(!p.sound||p.volume<=0)return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext=audioContext||new Audio();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});const o=audioContext.createOscillator(),g=audioContext.createGain(),t=audioContext.currentTime;o.type='sine';o.frequency.value=340;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(p.volume*.055,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.055);o.connect(g);g.connect(audioContext.destination);o.start(t);o.stop(t+.065)}catch{}
}
function qaTimerLoop(){
  if(!round||round.phase!=='question'||qaTimer.key!==qaTimerKey()){qaTimerStop(false);return}
  const left=qaTimerComputeRemaining();
  if(left<=0){qaTimer.remainingMs=0;qaTimer.deadline=Date.now()-1;qaTimer.lastTickAt=null;qaTimer.expired=true;qaTimerClearInterval();qaTimerPaint();$('answerAnnouncement').textContent='Tiempo agotado.';commitAnswer(false,{timedOut:true});return}
  qaTimerPaint();
}
function qaTimerStart(){
  const key=qaTimerKey();if(!key)return;
  if(qaTimer.key!==key){
    qaTimerClearInterval();
    qaTimer={key,interval:null,remainingMs:QA_TIMER_DURATION_MS,deadline:Date.now()+QA_TIMER_DURATION_MS,lastTickAt:null,paused:document.visibilityState!=='visible',expired:false,announced5:false,lastSoundSecond:null};
  }else if(!Number.isFinite(qaTimer.deadline)){
    qaTimer.deadline=Date.now()+Math.max(0,Number(qaTimer.remainingMs)||QA_TIMER_DURATION_MS);
  }
  qaTimer.paused=document.visibilityState!=='visible';
  qaTimerClearInterval();qaTimerPaint();
  if(!qaTimer.paused)qaTimer.interval=setInterval(qaTimerLoop,100);
}
function qaTimerPause(){
  if(!qaTimer?.key)return;
  qaTimer.paused=true;qaTimerClearInterval();qaTimerPaint();
}
function qaTimerResume(){
  if(!qaTimer?.key||qaTimer.expired||!round||round.phase!=='question')return;
  qaTimer.paused=false;qaTimerClearInterval();
  if(qaTimerComputeRemaining()<=0){qaTimerLoop();return}
  qaTimerPaint();qaTimer.interval=setInterval(qaTimerLoop,100);
}
function qaTimerStop(reset=true){
  const snap=qaTimerSnapshot();qaTimerClearInterval();
  if(reset)qaTimer={key:null,interval:null,remainingMs:QA_TIMER_DURATION_MS,deadline:null,lastTickAt:null,paused:false,expired:false,announced5:false,lastSoundSecond:null};
  else{qaTimer.remainingMs=snap.remainingMs;qaTimer.deadline=Date.now()+snap.remainingMs;qaTimer.lastTickAt=null;qaTimer.paused=true}
  return snap;
}
document.addEventListener('visibilitychange',()=>{if(IS_HUMAN_TESTER&&document.visibilityState!=='visible'&&round?.phase==='question'){qaHumanReadyKey=null;qaTimerStop();renderGame();return}if(document.visibilityState!=='visible')qaTimerPause();else qaTimerResume()});
window.__QA_TIMER__={
  snapshot:qaTimerSnapshot,
  pause:qaTimerPause,
  resume:qaTimerResume,
  expire(){if(!qaTimer.key)return;qaTimer.remainingMs=0;qaTimer.deadline=Date.now()-1;qaTimer.expired=false;qaTimerLoop()},
  setRemaining(ms){if(!qaTimer.key)return;const next=Math.max(0,Math.min(QA_TIMER_DURATION_MS,Number(ms)||0));qaTimer.remainingMs=next;qaTimer.deadline=Date.now()+next;qaTimer.expired=false;qaTimerPaint()}
};

const qaBaseShowView=showView;
showView=function(name,opts={}){qaHumanReadyKey=null;qaTimerStop();return qaBaseShowView(name,opts)};

function qaTimeBonus(basePoints,remainingMs){const factor=Math.max(0,Math.min(1,remainingMs/QA_TIMER_DURATION_MS));return Math.round(Math.min(basePoints*.30,300)*factor)}
function qaResultState(a){if(a.skipped)return 'revealed';if(a.error===0)return 'exact';if(a.error<=2)return 'near';if(a.error<=10)return 'medium';return 'far'}
function qaResultLabel(a){return ({revealed:'Fecha revelada',exact:'Exacta',near:'Casi alineado',medium:'Desfase',far:'Salto temporal'})[qaResultState(a)]}
function qaResultGlyph(a){
  const state=qaResultState(a),diff=a.skipped?0:a.error;
  if(state==='exact')return `<div class="atlas-sigil exact" aria-hidden="true"><i></i><i></i><b>◎</b></div>`;
  if(state==='revealed')return `<div class="atlas-sigil revealed" aria-hidden="true"><i></i><b>│</b></div>`;
  const gap=state==='near'?18:state==='medium'?42:76;
  return `<div class="atlas-sigil ${state}" style="--sigil-gap:${gap}%" aria-hidden="true"><i class="left"></i><span></span><i class="right"></i></div>`;
}
function qaExtendedContext(q){return q.extendedContext||{what:q.context||q.fact,why:q.significance||'',locate:'',reviewNeeded:!q.editorialVerified,source:q.source,sourceLabel:q.sourceLabel}}
function qaImageCaption(q){const type=q.imageType==='documentary'?'DOCUMENTO':q.imageType==='editorial'?'LÁMINA DE ARCHIVO':'IMAGEN DE APOYO';return `${type}${q.imageCredit?` · ${esc(q.imageCredit)}`:''}`}
function qaTimerHTML(){if(IS_HUMAN_TESTER)return `<div class="friendly-timer" id="qaTimerShell" role="progressbar" aria-label="Tiempo restante para responder" aria-valuemin="0" aria-valuemax="15" aria-valuenow="15"><b id="qaTimerSeconds">15</b><span>segundos</span></div>`;return `<div class="atlas-timer" id="qaTimerShell" role="progressbar" aria-label="Tiempo restante para responder" aria-valuemin="0" aria-valuemax="15" aria-valuenow="15"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="timer-track" cx="60" cy="60" r="54" pathLength="100"/><circle id="qaTimerProgress" class="timer-progress" cx="60" cy="60" r="54" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0"/></svg><div class="timer-readout"><b id="qaTimerSeconds">15</b><span>SEG</span></div></div>`}
function qaArchiveRuler(){
  const marks=[];for(let y=Math.ceil(GLOBAL_MIN_YEAR/10)*10;y<=Math.floor(GLOBAL_MAX_YEAR/10)*10;y+=10){const pos=((y-GLOBAL_MIN_YEAR)/(GLOBAL_MAX_YEAR-GLOBAL_MIN_YEAR))*100;marks.push(`<span style="--mark:${pos.toFixed(2)}%"><i></i><b>${y}</b></span>`)}
  return `<div class="atlas-ruler" aria-hidden="true">${marks.join('')}</div>`;
}
function qaQuestionImage(q,image){if(!image||q.imageRole==='context')return `<div class="atlas-ghost-plate" aria-hidden="true"><span>COORDENADA</span><b>${esc(q.region||'GLOBAL')}</b><i></i><small>${esc(q.subcategory||q.category)}</small></div>`;return `<figure class="atlas-question-image"><img src="${image}" alt="${esc(q.imageAlt)}" data-fallback><figcaption>${qaImageCaption(q)}</figcaption></figure>`}
function qaContextDocument(q,image){
  const ext=qaExtendedContext(q),img=image?`<figure class="atlas-document-image"><img src="${image}" alt="${esc(q.imageAlt)}" data-fallback><figcaption>${qaImageCaption(q)}${q.imageLicense?` · ${esc(q.imageLicense)}`:''}</figcaption></figure>`:'';
  const source=q.source&&safeURL(q.source)?`<a class="atlas-source" href="${esc(safeURL(q.source))}" target="_blank" rel="noopener noreferrer">${esc(q.sourceLabel||'Fuente')} ↗</a>`:'';
  return `<div class="atlas-document ${img?'has-image':'no-image'}">${img}<div class="atlas-document-copy"><section><span>QUÉ OCURRIÓ</span><p>${esc(ext.what||q.fact)}</p></section>${ext.why?`<section><span>POR QUÉ IMPORTA</span><p>${esc(ext.why)}</p></section>`:''}${ext.locate?`<section><span>EN EL MAPA DEL TIEMPO</span><p>${esc(ext.locate)}</p></section>`:''}<footer>${source}${ext.reviewNeeded?'<small>Referencia heredada · contexto estructural pendiente de revisión editorial.</small>':'<small>Contexto editorial verificado.</small>'}</footer></div></div>`;
}

function temporalScale(a){
  const state=qaResultState(a);
  if(state==='revealed')return `<div class="temporal-scale atlas-scale reveal-scale state-revealed" role="img" aria-label="Fecha revelada: ${a.actual}. Queda para repaso"><div class="atlas-scale-axis"><i class="actual" style="--pos:50%"><b>${a.actual}</b><small>AÑO REAL</small></i></div><div class="temporal-distance"><strong>Fecha revelada</strong><span>Queda para repaso</span></div></div>`;
  if(state==='exact')return `<div class="temporal-scale atlas-scale exact-scale state-exact" role="img" aria-label="Tu estimación ${a.guess} coincide con el año real"><div class="atlas-scale-axis"><i class="both" style="--pos:50%"><b>${a.actual}</b><small>ESTIMACIÓN = REAL</small></i></div><div class="temporal-distance"><strong>Sincronía temporal</strong><span>Mismo punto en el tiempo</span></div></div>`;
  const diff=Math.abs(a.guess-a.actual),guessFirst=a.guess<a.actual,spread=diff<=2?18:diff<=5?34:diff<=20?54:diff<=50?68:78,left=50-spread/2,right=50+spread/2,guessPos=(guessFirst?left:right).toFixed(1)+'%',actualPos=(guessFirst?right:left).toFixed(1)+'%';
  const legacy=diff<=2?'scale-near':diff<=5?'scale-close':diff<=20?'scale-medium':diff<=50?'scale-wide':'scale-decades';
  return `<div class="temporal-scale atlas-scale ${legacy} state-${state}" role="img" aria-label="Tu estimación ${a.guess}; año real ${a.actual}; diferencia ${diff} ${diff===1?'año':'años'}"><div class="atlas-scale-axis"><i class="guess" style="--pos:${guessPos}"><b>${a.guess}</b><small>TU ESTIMACIÓN</small></i><span class="distance-line" style="--left:${left}%;--width:${spread}%"><em>${diff} ${diff===1?'AÑO':'AÑOS'}</em></span><i class="actual" style="--pos:${actualPos}"><b>${a.actual}</b><small>AÑO REAL</small></i></div><div class="temporal-distance"><strong>${state==='near'?'Casi alineado':state==='medium'?'Desfase temporal':'Salto temporal'}</strong><span>${a.guess<a.actual?'Tu estimación quedó antes':'Tu estimación quedó después'}</span></div></div>`;
}

function renderGame(){
  if(!round)return;const q=displayQuestion(round.questionIds[round.index]);if(!q){toast('No se pudo recuperar esta pregunta.');return}
  if(IS_HUMAN_TESTER){qaHumanRender(q);return}
  document.documentElement.style.setProperty('--cat',CATEGORY_COLORS[q.category]||'#7acff2');
  const answered=round.phase==='answer',a=round.answers[round.index],image=safeAsset(q.image),daily=round.mode==='daily',roundLabel=`Pregunta ${round.index+1} de ${round.questionIds.length}`,label=daily?`DESAFÍO #${challengeNumber(parseDateKey(round.date))}`:round.mode==='review'?'REPASO':'PRÁCTICA';
  if(answered)qaTimerStop();
  const header=`<header class="game-header atlas-header"><div class="atlas-header-meta"><span>${esc(q.category)}</span><span>${esc(DIFFICULTY_LABELS[q.difficulty])}</span><span>ARCHIVO #${esc(archiveNumber(q))}</span></div><div class="atlas-header-session"><span>${roundLabel}</span><b>${label}</b></div>${archiveProgress(round,roundLabel)}</header>`;
  let content,footer;
  if(!answered){
    content=`<div class="archive-question-layout atlas-question-layout"><section class="archive-editorial atlas-editorial" aria-labelledby="questionTitle"><span class="archive-phase">01 · ESTIMA</span><div class="atlas-coordinate">${String(round.index+1).padStart(2,'0')} / ${String(round.questionIds.length).padStart(2,'0')} · ${esc(q.region||'GLOBAL')}</div><h1 id="questionTitle">${esc(q.title)}</h1><p class="prompt">${esc(q.prompt)}</p><div class="atlas-editorial-foot"><span>${esc(q.kind)}</span><span>${esc(q.subcategory||q.category)}</span></div></section><section class="archive-estimator atlas-estimator" aria-label="Instrumento temporal">${qaQuestionImage(q,image)}<div class="atlas-instrument"><div class="atlas-instrument-label"><span>INSTRUMENTO TEMPORAL</span><small>15 segundos · precisión primero, velocidad después</small></div><div class="year-control"><div class="year-instrument atlas-year-instrument"><button class="year-step year-step-wide" data-action="adjust" data-step="-10" aria-label="Restar diez años">−10</button><button class="year-step" data-action="adjust" data-step="-1" aria-label="Restar un año">−1</button><div class="atlas-core">${qaTimerHTML()}<div class="year-readout"><input id="yearInput" class="year-input" type="number" min="${GLOBAL_MIN_YEAR}" max="${GLOBAL_MAX_YEAR}" step="1" value="${round.guess}" inputmode="numeric" aria-label="Año de tu estimación" aria-describedby="yearHelp"><label for="yearInput">TU AÑO</label></div></div><button class="year-step" data-action="adjust" data-step="1" aria-label="Sumar un año">+1</button><button class="year-step year-step-wide" data-action="adjust" data-step="10" aria-label="Sumar diez años">+10</button></div><div class="year-slider-wrap atlas-slider">${qaArchiveRuler()}<input id="yearSlider" type="range" min="${GLOBAL_MIN_YEAR}" max="${GLOBAL_MAX_YEAR}" step="1" value="${round.guess}" aria-label="Navegar por los años"><div class="range-ends"><span>${GLOBAL_MIN_YEAR}</span><span id="yearHelp">Flechas ±1 · Mayús + flecha ±10</span><span>${GLOBAL_MAX_YEAR}</span></div></div>${round.assisted?`<small class="hint-copy">Ayuda: década de ${decadeOf(q.year)}.</small>`:''}</div></div></section></div>`;
    footer=`<div class="row"><button class="text-button" data-action="skip">No lo sé</button>${!daily&&!round.assisted?'<button class="text-button" data-action="hint">Ayuda</button>':''}</div><button class="primary" id="primaryAction" data-action="answer">Revelar año</button>`;
  }else{
    const state=qaResultState(a),delta=answerDeltaCopy(a),score=a.skipped?'':`<div class="atlas-score-ledger"><span><small>PRECISIÓN</small><b>+${a.basePoints??points(a.error)}</b></span><span><small>BONUS TIEMPO</small><b>+${a.timeBonus||0}</b></span><span class="total"><small>TOTAL</small><b>${a.points} pts</b></span></div>`;
    content=`<div class="atlas-feedback atlas-state-${state}"><section class="atlas-reveal" aria-label="Resultado de la respuesta"><div class="atlas-reveal-head"><span class="archive-phase">02 · REVELA</span><b class="atlas-result-name">${qaResultLabel(a)}</b></div>${qaResultGlyph(a)}<div class="atlas-year-reveal">${a.skipped?'':`<div class="guess"><span>TU ESTIMACIÓN</span><strong>${a.guess}</strong></div>`}<div class="actual"><span>AÑO REAL</span><strong class="feedback-year">${a.actual}</strong></div></div><p class="answer-delta">${esc(delta)}</p>${a.timedOut?'<p class="atlas-timeout-note">Tiempo agotado · registramos tu estimación.</p>':''}${score}<div class="atlas-locate"><span class="archive-phase">03 · UBICA</span>${temporalScale(a)}</div></section><section class="atlas-learn" aria-labelledby="questionTitle"><div class="atlas-learn-head"><span class="archive-phase">04 · APRENDE</span><h1 id="questionTitle">${esc(q.title)}</h1><p>${esc(q.prompt)}</p></div>${qaContextDocument(q,image)}<div class="atlas-learn-actions"><button class="secondary" data-action="detail" data-id="${q.id}">Abrir ficha completa</button><span>Dominio · ${esc(mastery(getState().questionStats[q.id]).label)}</span></div></section></div>`;
    footer=`<span class="shortcut">Enter para continuar · ${round.mode==='daily'?'progreso guardado':'sin impacto en tu ritmo diario'}</span><button class="primary" id="primaryAction" data-action="next">${round.index===round.questionIds.length-1?'Cerrar archivo':'Siguiente archivo'} →</button>`;
  }
  setView(`<section class="surface game game-v11 archive-night atlas-v12 ${answered?'is-answered':'is-question'}" aria-labelledby="questionTitle">${header}<div class="game-body ${answered?'answered':''}">${content}</div><footer class="game-footer">${footer}</footer></section>`);
  if(!answered)qaTimerStart();
}

function commitAnswer(skipped=false,options={}){
  if(IS_HUMAN_TESTER&&qaHumanReadyKey!==qaTimerKey())return;
  if(!round||round.phase!=='question')return;
  const input=$('yearInput'),guess=Number(input?input.value:round.guess);if(!skipped&&(!Number.isInteger(guess)||guess<GLOBAL_MIN_YEAR||guess>GLOBAL_MAX_YEAR||input?.value==='')){toast(`Escribe un año entre ${GLOBAL_MIN_YEAR} y ${GLOBAL_MAX_YEAR}.`);input?.focus();return}
  const snap=qaTimerStop(),s=getState(),q=displayQuestion(round.questionIds[round.index]),actual=QUESTION_BY_ID.get(q.id).year,isNew=!discoveredIds(s).has(q.id),error=skipped?null:Math.abs(guess-actual),basePoints=skipped?0:points(error),remainingMs=options.timedOut?0:snap.remainingMs,timeBonus=skipped||IS_HUMAN_TESTER?0:qaTimeBonus(basePoints,remainingMs),finalPoints=basePoints+timeBonus;
  const a={id:q.id,title:q.title,category:q.category,actual,guess:skipped?null:guess,error,basePoints,timeBonus,points:skipped?0:finalPoints,elapsedMs:Math.round(QA_TIMER_DURATION_MS-remainingMs),remainingMs:Math.round(remainingMs),timedOut:Boolean(options.timedOut),scoringVersion:QA_TIMER_SCORING_VERSION,skipped,assisted:round.assisted};
  $('answerAnnouncement').textContent=`Año real: ${actual}. ${answerDeltaCopy(a)}${skipped?'':` Precisión ${basePoints} puntos, bonus de tiempo ${timeBonus}, total ${finalPoints}.`}`;
  recordAnswer(s,a,dateKey());round.answers.push(a);round.phase='answer';if(isNew)round.newDiscoveries++;persistRound();renderGame();refreshHeader();tone(!skipped&&error===0?'exact':'confirm');if(options.timedOut)toast('Tiempo agotado · registramos tu estimación.');$('primaryAction')?.focus({preventScroll:true});
}

function qaFmtTime(ms){if(!Number.isFinite(ms))return '—';return `${(ms/1000).toLocaleString('es-CL',{minimumFractionDigits:1,maximumFractionDigits:1})} s`}
function summarySignature(s){return `<div class="answer-signature archive-signature atlas-signature" aria-label="Resumen de los ${s.answers.length} archivos">${s.answers.map((a,i)=>{const status=a.skipped?'REVELADA':a.error===0?'EXACTA':a.error<=2?'CERCA':a.error<=10?'DESFASE':'SALTO';return `<button class="answer-signature-item state-${qaResultState(a)}" data-action="detail" data-id="${a.id}" aria-label="${esc(a.title)}. ${status}. Abrir contexto"><span class="signature-index">${String(i+1).padStart(2,'0')}</span><span class="signature-copy"><b>${esc(a.title)}</b><small>${a.skipped?`Año real ${a.actual}`:`${a.guess} → ${a.actual} · ${qaFmtTime(a.elapsedMs)}`}</small></span><strong>${status}</strong></button>`}).join('')}</div>`}
function renderSummary(s){
  if(IS_HUMAN_TESTER){if(!s)return;lastSummary=s;qaHumanSummary(s);return}
  if(!s)return;lastSummary=s;const state=getState(),isDaily=s.mode==='daily',errors=s.answers.filter(a=>a.skipped||a.error>5),timed=s.answers.filter(a=>Number.isFinite(a.elapsedMs)),avgTime=timed.length?mean(timed.map(a=>a.elapsedMs)):null,unlocked=(s.newAchievements||[]).map(id=>ACHIEVEMENTS.find(a=>a.id===id)).filter(Boolean),activity=isDaily?archiveRhythmLabel(state):'Sesión de práctica · sin impacto en tu ritmo diario';
  const discoveries=s.newDiscoveries?`<span><b>${s.newDiscoveries}</b><small>nuevas fechas</small></span>`:'',achievements=unlocked.length?`<span><b>${unlocked.length}</b><small>logros</small></span>`:'';
  const primary=errors.length?`<button class="primary summary-primary" data-action="review-results">Repasar ${errors.length} fecha${errors.length===1?'':'s'} →</button>`:`<button class="primary summary-primary" data-view="coleccion">Explorar colección →</button>`;
  setView(`<section class="surface summary archive-summary atlas-summary"><header class="atlas-summary-head"><div><span class="archive-phase">ARCHIVO COMPLETADO</span><h1>${isDaily?'Archivo de hoy completo':'Sesión completada'}</h1></div><span>${activity}</span></header><div class="atlas-summary-score"><strong>${fmt(s.total,0)}</strong><span>PUNTOS TOTALES</span></div><div class="atlas-summary-metrics"><div><b>${fmt(s.avg)}</b><span>años de error medio</span></div><div><b>${qaFmtTime(avgTime)}</b><span>tiempo medio</span></div><div><b>${s.exact}/${s.answers.length}</b><span>exactas</span></div><div><b>+${fmt(s.timeBonus||s.answers.reduce((n,a)=>n+(a.timeBonus||0),0),0)}</b><span>bonus temporal</span></div></div><section class="atlas-summary-files"><div class="summary-section-title"><span class="eyebrow">LOS CINCO ARCHIVOS</span><span>El tiempo suma, pero la precisión manda.</span></div>${summarySignature(s)}</section>${discoveries||achievements?`<div class="atlas-summary-gains">${discoveries}${achievements}</div>`:''}<footer class="summary-footer"><div class="summary-secondary-actions"><button class="secondary" data-action="share">Compartir</button><button class="secondary" data-view="estadisticas">Estadísticas</button></div>${primary}</footer></section>`)
}

const qaBaseOpenDetail=openDetail;
openDetail=function(id){
  const q=displayQuestion(id);if(!q)return;const s=getState(),seen=discoveredIds(s).has(id),revealedInOrder=s.timelineDraft?.answered&&s.timelineDraft.ids.includes(id),answeredNow=round?.phase==='answer'&&round.questionIds[round.index]===id;if(!seen&&!revealedInOrder&&!answeredNow)return;
  const image=safeAsset(q.image),ext=qaExtendedContext(q),st=s.questionStats[id],source=q.source&&safeURL(q.source)?`<a href="${esc(safeURL(q.source))}" target="_blank" rel="noopener noreferrer">${esc(q.sourceLabel||'Fuente')}</a>`:'';
  openDialog(q.title,`<article class="atlas-detail"><header><strong class="feedback-year">${q.year}</strong><div><span>${esc(q.category)}</span><small>${esc(q.region||'')}</small></div></header>${image?`<figure><img class="detail-image" src="${image}" alt="${esc(q.imageAlt)}"><figcaption>${qaImageCaption(q)}${q.imageLicense?` · ${esc(q.imageLicense)}`:''}</figcaption></figure>`:''}<div class="atlas-detail-copy"><section><h3>Qué ocurrió</h3><p>${esc(ext.what||q.fact)}</p></section>${ext.why?`<section><h3>Por qué importa</h3><p>${esc(ext.why)}</p></section>`:''}${ext.locate?`<section><h3>En el mapa del tiempo</h3><p>${esc(ext.locate)}</p></section>`:''}</div><footer>${source?`<span>Fuente · ${source}</span>`:''}<small>${ext.reviewNeeded?'Referencia heredada; esta ficha sigue marcada para revisión editorial.':'Contexto editorial verificado.'}</small>${st?`<span>${st.attempts} intentos · error medio ${fmt(st.avgError)} años · ${mastery(st).label}</span>`:''}</footer></article>`)
};

const qaBaseRenderStats=renderStats;
renderStats=function(){qaBaseRenderStats();if(statsState.tab!=='summary')return;const timed=statsSessions().flatMap(s=>s.answers).filter(a=>Number.isFinite(a.elapsedMs));if(timed.length<3)return;const row=document.querySelector('.metric-row');if(!row)return;const item=document.createElement('div');item.className='metric atlas-time-metric';item.innerHTML=`<b>${qaFmtTime(mean(timed.map(a=>a.elapsedMs)))}</b><span>tiempo medio de respuesta</span>`;row.appendChild(item)};
