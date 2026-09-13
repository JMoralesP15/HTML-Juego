/* ARCHIVO NOCTURNO — RC.2 visual/gameplay layer.
   Evidence-informed principles: curiosity/mastery over variable rewards,
   finite sessions, structured visual richness, cognitive accessibility.
   v1.8.6: conserva helpers visuales; Atlas es el writer canónico del renderer. */

function archiveNumber(q){
  const m=String(q?.id||'').match(/\d+/g);
  return m?.length?m.join('').slice(-4):String(q?.id||'—').toUpperCase();
}

function archiveRhythmLabel(s=getState()){
  return `${recentActivity(s)} de 7 días · ritmo ${calcStreak(s.sessions)}`;
}

function refreshHeader(){
  const s=getState(),due=eligibleReviews(s).filter(x=>x.dueIn<=0).length;
  $('weeklyActivity').textContent=archiveRhythmLabel(s);
  $('dueBadge').textContent=due;$('dueBadge').hidden=due===0;
  applyPreferences();
}

function renderCover(){
  const s=getState(),entry=dailyEntry(),n=entry.questions.filter(q=>!discoveredIds(s).has(q.id)).length;
  setView(`<section class="surface cover archive-cover">
    <span class="cover-mark">ARCHIVO DE HOY</span>
    <div class="stack"><span class="eyebrow">${esc(new Date().toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'}))}</span><h1>QUÉ AÑO #${challengeNumber()}</h1></div>
    <p>Cinco hitos. Estima, revela y ubica cada fecha en tu mapa del tiempo.</p>
    <div class="cover-meta"><span>2 fáciles · 2 medias · 1 difícil</span><span>${n} por descubrir</span>${entry.specialTheme?`<span>Especial ${esc(entry.specialTheme)}</span>`:''}</div>
    <button class="primary" data-action="start-daily">Abrir el archivo →</button>
    <small>${archiveRhythmLabel(s)} · sin penalización por ausencias</small>
  </section>`)
}

function archiveProgress(round,roundLabel){
  return `<ol class="round-progress archive-progress" style="--rounds:${round.questionIds.length}" aria-label="${roundLabel}">${round.questionIds.map((_,i)=>{
    const state=i<round.index?'done':i===round.index?'current':'pending';
    const copy=state==='done'?`Archivo ${i+1} completado`:state==='current'?`Archivo ${i+1} actual`:`Archivo ${i+1} pendiente`;
    return `<li class="${state}" aria-current="${state==='current'?'step':'false'}"><span class="archive-progress-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><span class="archive-progress-state" aria-hidden="true">${state==='done'?'HECHO':state==='current'?'AHORA':'DESPUÉS'}</span><span class="sr-only">${copy}</span></li>`
  }).join('')}</ol>`;
}

function archiveRuler(){
  const start=Math.ceil(GLOBAL_MIN_YEAR/10)*10,end=Math.floor(GLOBAL_MAX_YEAR/10)*10,marks=[];
  for(let y=start;y<=end;y+=10){
    const pos=((y-GLOBAL_MIN_YEAR)/(GLOBAL_MAX_YEAR-GLOBAL_MIN_YEAR))*100;
    marks.push(`<span class="archive-ruler-mark" style="--mark:${pos.toFixed(2)}%"><i></i><b>${y}</b></span>`);
  }
  return `<div class="archive-ruler" aria-hidden="true">${marks.join('')}</div>`;
}

function archiveQuestionVisual(q,image){
  if(image){
    return `<figure class="archive-question-visual has-image"><img src="${image}" alt="${esc(q.imageAlt)}" data-fallback><figcaption>${q.imageType==='documentary'?'Fotografía de archivo':'Imagen de apoyo'}${q.imageCredit?` · ${esc(q.imageCredit)}`:''}</figcaption></figure>`;
  }
  return `<div class="archive-question-visual archive-placeholder" aria-hidden="true">
    <span class="archive-placeholder-kicker">ARCHIVO TEMPORAL</span>
    <strong>#${esc(archiveNumber(q))}</strong>
    <span>${esc(q.category)}</span>
    <div class="archive-placeholder-lines"><i></i><i></i><i></i><i></i></div>
  </div>`;
}

function answerDeltaCopy(a){
  if(a.skipped)return 'Fecha revelada. Queda para repasar.';
  if(a.error===0)return 'Tu estimación coincide con el año real.';
  const unit=a.error===1?'año':'años';
  return a.guess<a.actual?`${a.error} ${unit} antes.`:`${a.error} ${unit} después.`;
}

/* Implementaciones históricas preservadas como evidencia de paridad. No escriben los símbolos canónicos. */
function legacyArchiveTemporalScale(a){
  if(a.skipped)return `<div class="temporal-scale reveal-scale" role="img" aria-label="Fecha revelada: ${a.actual}. Queda para repaso"><div class="temporal-track"><i class="temporal-marker correct exact" style="--pos:50%"><b><small>AÑO REAL</small><span>${a.actual}</span></b></i></div><div class="temporal-distance"><strong>Fecha revelada</strong><span>Queda para repasar</span></div></div>`;
  if(a.error===0)return `<div class="temporal-scale exact-scale" role="img" aria-label="Tu estimación ${a.guess} coincide con el año real"><div class="temporal-track"><i class="temporal-marker exact" style="--pos:50%"><b><small>ESTIMACIÓN · REAL</small><span>${a.actual}</span></b></i></div><div class="temporal-distance"><strong>Exacta</strong><span>Mismo punto en el tiempo</span></div></div>`;
  const diff=Math.abs(a.guess-a.actual),unit=diff===1?'año':'años',guessFirst=a.guess<a.actual;
  const spread=diff<=2?24:diff<=5?38:diff<=20?54:diff<=50?64:72;
  const left=50-spread/2,right=50+spread/2;
  const guessPos=(guessFirst?left:right).toFixed(1)+'%',correctPos=(guessFirst?right:left).toFixed(1)+'%';
  const cls=diff<=2?'scale-near':diff<=5?'scale-close':diff<=20?'scale-medium':diff<=50?'scale-wide':'scale-decades';
  const note=diff>20?'<small>La escala resume la distancia para facilitar la lectura.</small>':'';
  return `<div class="temporal-scale ${cls}" role="img" aria-label="Tu estimación ${a.guess}; año real ${a.actual}; diferencia ${diff} ${unit}"><div class="temporal-track"><i class="temporal-marker guess" style="--pos:${guessPos}"><b><small>TU ESTIMACIÓN</small><span>${a.guess}</span></b></i><i class="temporal-marker correct" style="--pos:${correctPos}"><b><small>AÑO REAL</small><span>${a.actual}</span></b></i></div><div class="temporal-distance"><strong>${diff} ${unit} de distancia</strong><span>${a.guess<a.actual?'Tu estimación quedó antes':'Tu estimación quedó después'}</span>${note}</div></div>`;
}

function legacyArchiveRenderGame(){
  if(!round)return;
  const q=displayQuestion(round.questionIds[round.index]);
  if(!q){toast('No se pudo recuperar esta pregunta.');return}
  document.documentElement.style.setProperty('--cat',CATEGORY_COLORS[q.category]||'#7acff2');
  const answered=round.phase==='answer',a=round.answers[round.index],image=safeAsset(q.image),showImage=image&&(q.imageRole!=='context'||answered),daily=round.mode==='daily';
  const label=daily?`DESAFÍO #${challengeNumber(parseDateKey(round.date))}`:round.mode==='review'?'REPASO':'PRÁCTICA';
  const roundLabel=`Pregunta ${round.index+1} de ${round.questionIds.length}`;
  const header=`<header class="game-header archive-game-header">
    <div class="archive-header-meta"><span class="archive-meta-tag category">${esc(q.category)}</span><span class="archive-meta-tag">${esc(DIFFICULTY_LABELS[q.difficulty])}</span><span class="archive-meta-tag archive-file">ARCHIVO #${esc(archiveNumber(q))}</span></div>
    <div class="archive-header-side"><span class="round-label">${roundLabel}</span><span class="counter">${label}${daily&&round.date!==dateKey()?` · ${round.date}`:''}</span></div>
    ${archiveProgress(round,roundLabel)}
  </header>`;
  let content,footer;
  if(answered){
    const grade=a.skipped?'Fecha revelada':a.error===0?'Exacta':a.error<=2?'Muy cerca':a.error<=5?'Cerca':a.error<=10?'A cierta distancia':'Lejos';
    const st=getState().questionStats[q.id],context=q.context||q.fact,delta=answerDeltaCopy(a),source=q.source&&q.sourceLabel?`<a class="source-link" href="${esc(q.source)}" target="_blank" rel="noopener noreferrer">Fuente · ${esc(q.sourceLabel)} ↗</a>`:'';
    const feedbackMedia=image?`<figure class="feedback-media"><img src="${image}" alt="${esc(q.imageAlt)}" data-fallback><figcaption>${q.imageType==='documentary'?'Fotografía de archivo':'Imagen de apoyo'}</figcaption></figure>`:'';
    content=`<div class="feedback-layout archive-feedback ${feedbackMedia?'has-feedback-media':'no-feedback-media'}">
      <section class="feedback-result archive-reveal" aria-label="Revelación de la respuesta">
        <span class="archive-phase">02 · REVELA</span>
        <span class="result-tag" style="--result:${resultColor(a)}">${grade}</span>
        <div class="archive-year-pair ${a.skipped?'is-revealed':''}">
          ${a.skipped?'':`<div><span>Tu estimación</span><strong>${a.guess}</strong></div>`}
          <div class="real-year"><span>Año real</span><strong class="feedback-year">${a.actual}</strong></div>
        </div>
        <p class="answer-delta">${esc(delta)}</p>
        <p class="answer-comparison">${a.skipped?'0 puntos · la fecha queda en repaso':`+${a.points} pts · la recompensa principal es ubicar la fecha`}</p>
        <div class="archive-locate"><span class="archive-phase">03 · UBICA</span>${legacyArchiveTemporalScale(a)}</div>
      </section>
      <section class="feedback-context archive-learn" aria-labelledby="questionTitle">
        <span class="archive-phase">04 · APRENDE</span>
        <div class="feedback-context-copy"><span class="eyebrow">${esc(q.kind)}</span><h1 id="questionTitle">${esc(q.title)}</h1><p class="prompt">${esc(q.prompt)}</p></div>
        ${feedbackMedia}
        <div class="feedback-history"><p class="context-copy">${esc(context)}</p><div class="answer-links"><button class="secondary" data-action="detail" data-id="${q.id}">Ampliar contexto</button><span class="mastery-label ${mastery(st).key==='mastered'?'good':''}">Dominio · ${esc(mastery(st).label)}</span>${source}</div>${a.assisted?'<small>Respuesta con ayuda; esta fecha queda fuera de consolidación.</small>':''}</div>
      </section>
    </div>`;
    footer=`<span class="shortcut">Enter para continuar · ${round.mode==='daily'?'progreso guardado':'sin impacto en tu ritmo diario'}</span><button class="primary" id="primaryAction" data-action="next">${round.index===round.questionIds.length-1?'Cerrar archivo':'Siguiente archivo'} →</button>`;
  }else{
    const visibleImage=!answered&&showImage?image:null;
    content=`<div class="archive-question-layout">
      <section class="archive-editorial question-copy" aria-labelledby="questionTitle">
        <span class="archive-phase">01 · ESTIMA</span>
        <div class="archive-editorial-rule"></div>
        <span class="eyebrow">${esc(q.kind)}</span>
        <h1 id="questionTitle">${esc(q.title)}</h1>
        <p class="prompt">${esc(q.prompt)}</p>
        <div class="archive-editorial-note"><span>#${esc(archiveNumber(q))}</span><span>${esc(q.category)}</span><span>${esc(DIFFICULTY_LABELS[q.difficulty])}</span></div>
      </section>
      <section class="archive-estimator" aria-label="Instrumento temporal">
        ${archiveQuestionVisual(q,visibleImage)}
        <div class="year-control">
          <span class="year-control-title">Tu estimación</span>
          <div class="year-instrument">
            <button class="year-step year-step-wide" data-action="adjust" data-step="-10" aria-label="Restar diez años">−10</button>
            <button class="year-step" data-action="adjust" data-step="-1" aria-label="Restar un año">−1</button>
            <div class="year-readout"><input id="yearInput" class="year-input" type="number" min="${GLOBAL_MIN_YEAR}" max="${GLOBAL_MAX_YEAR}" step="1" value="${round.guess}" inputmode="numeric" aria-label="Año de tu estimación" aria-describedby="yearHelp"><label for="yearInput">AÑO</label></div>
            <button class="year-step" data-action="adjust" data-step="1" aria-label="Sumar un año">+1</button>
            <button class="year-step year-step-wide" data-action="adjust" data-step="10" aria-label="Sumar diez años">+10</button>
          </div>
          <div class="year-slider-wrap">
            ${archiveRuler()}
            <input id="yearSlider" type="range" min="${GLOBAL_MIN_YEAR}" max="${GLOBAL_MAX_YEAR}" step="1" value="${round.guess}" aria-label="Navegar por los años">
            <div class="range-ends"><span>${GLOBAL_MIN_YEAR}</span><span id="yearHelp">Flechas ±1 · Mayús + flecha ±10</span><span>${GLOBAL_MAX_YEAR}</span></div>
          </div>
          ${round.assisted?`<small class="hint-copy">Ayuda: década de ${decadeOf(q.year)}.</small>`:''}
        </div>
      </section>
    </div>`;
    footer=`<div class="row"><button class="text-button" data-action="skip">No lo sé</button>${!daily&&!round.assisted?'<button class="text-button" data-action="hint">Ayuda</button>':''}</div><button class="primary" id="primaryAction" data-action="answer">Revelar año</button>`;
  }
  setView(`<section class="surface game game-v11 archive-night ${answered?'is-answered':'is-question'}" aria-labelledby="questionTitle">${header}<div class="game-body ${answered?'answered':''}">${content}</div><footer class="game-footer">${footer}</footer></section>`);
}

function legacyArchiveSummarySignature(s){
  return `<div class="answer-signature archive-signature" aria-label="Resumen de los ${s.answers.length} archivos">${s.answers.map((a,i)=>{
    const unit=a.error===1?'año':'años',status=a.skipped?'Revelada':a.error===0?'Exacta':`${a.error} ${unit}`;
    return `<button class="answer-signature-item" data-action="detail" data-id="${a.id}" style="--result:${resultColor(a)}" aria-label="${esc(a.title)}. ${status}. Abrir contexto"><span class="signature-index">${String(i+1).padStart(2,'0')}</span><span class="signature-copy"><b title="${esc(a.title)}">${esc(a.title)}</b><small>${a.skipped?`Año real ${a.actual}`:`Tu ${a.guess} · real ${a.actual}`}</small></span><strong>${status}</strong></button>`
  }).join('')}</div>`;
}

function legacyArchiveRenderSummary(s){
  if(!s)return;
  lastSummary=s;
  const state=getState(),isDaily=s.mode==='daily',errors=s.answers.filter(a=>a.skipped||a.error>5),unlocked=(s.newAchievements||[]).map(id=>ACHIEVEMENTS.find(a=>a.id===id)).filter(Boolean),prior=state.sessions.filter(x=>x.date!==s.date&&Number.isFinite(x.avg)),priorAvg=prior.length>=3?mean(prior.map(x=>x.avg)):null;
  const knowledge=[];
  if(s.newDiscoveries)knowledge.push(`<span><b>${s.newDiscoveries}</b> nueva${s.newDiscoveries===1?' fecha':'s fechas'} descubierta${s.newDiscoveries===1?'':'s'}</span>`);
  if(unlocked.length)knowledge.push(`<span><b>${unlocked.length}</b> ${unlocked.length===1?'logro':'logros'} · ${unlocked.map(a=>esc(a.title)).join(' · ')}</span>`);
  const action=isDaily?(errors.length?`<button class="primary summary-primary" data-action="review-results">Repasar ${errors.length} fecha${errors.length===1?'':'s'} →</button>`:`<button class="primary summary-primary" data-view="coleccion">Explorar colección →</button>`):`<button class="primary summary-primary" data-view="repaso">Volver a repaso →</button>`;
  setView(`<section class="surface summary summary-v11 archive-summary">
    <header class="summary-head"><div><span class="eyebrow">${isDaily?`ARCHIVO #${s.challenge}`:s.mode==='review'?'REPASO COMPLETO':'PRÁCTICA COMPLETA'}</span><h1>${isDaily?'Archivo de hoy completo':'Sesión completada'}</h1></div><span class="summary-session-meta">${isDaily?archiveRhythmLabel(state):'Sesión sin presión de racha'}</span></header>
    <div class="summary-body">
      <section class="summary-result" aria-label="Lectura de la partida"><span class="archive-phase">LECTURA DE LA PARTIDA</span><div class="summary-scoreline"><div class="summary-score"><b>${fmt(s.avg)}</b><span>años de error medio</span></div><div class="summary-measures"><div><b>${s.exact}/${s.answers.length}</b><span>exactas</span></div><div><b>${fmt(s.total,0)}</b><span>puntos</span></div></div></div><p class="summary-narrative">${summaryNarrative(s,priorAvg)}</p>${isDaily&&Number.isFinite(priorAvg)&&Number.isFinite(s.avg)?`<p class="summary-comparison">Tu referencia previa era ${fmt(priorAvg)} años; hoy fue ${fmt(s.avg)}.</p>`:''}${s.omitted?`<small>${s.omitted} fecha${s.omitted===1?'':'s'} revelada${s.omitted===1?'':'s'}; el promedio usa solo estimaciones.</small>`:''}</section>
      <section class="summary-round"><div class="summary-section-title"><span class="eyebrow">LOS CINCO ARCHIVOS</span><span class="summary-section-hint">Abre un hito para volver a su contexto</span></div>${legacyArchiveSummarySignature(s)}</section>
      ${knowledge.length?`<section class="summary-rewards"><span class="eyebrow">CONOCIMIENTO ACUMULADO</span><div class="reward-lines">${knowledge.join('')}</div></section>`:''}
    </div>
    <footer class="summary-footer"><div class="summary-secondary-actions"><button class="secondary" data-view="coleccion">Colección</button><button class="secondary" data-action="share">Compartir</button></div>${action}</footer>
  </section>`)
}

function shareText(s){
  const mode=s.mode==='daily'?`#${s.challenge}`:s.mode==='review'?'REPASO':'PRÁCTICA';
  return `QUÉ AÑO ${mode}\n${s.answers.map(a=>a.skipped?'—':a.error===0?'✓':`+${a.error}`).join(' ')}\n${fmt(s.avg)} años de error medio · ${s.answers.length-s.omitted}/${s.answers.length} estimadas\n${s.total} pts${s.mode==='daily'?`\nRitmo ${streakAtDate(s.date)}`:''}`;
}

// Make keyboard control explicit even while the numeric year input has focus.
document.addEventListener('keydown',e=>{
  if(!round||round.phase!=='question'||e.target?.id!=='yearInput')return;
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  e.preventDefault();
  const positive=e.key==='ArrowRight'||e.key==='ArrowUp';
  setYear(round.guess+(positive?1:-1)*(e.shiftKey?10:1));
},{capture:true});
