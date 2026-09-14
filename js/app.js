/* UI EVENTS — delegated events survive view changes without duplicate handlers. */
let pendingBackup=null,pendingEdits=null,draggedOrderId=null;
function exportBackup(){downloadJSON({app:'QUÉ AÑO',version:'1.0',exportedAt:new Date().toISOString(),state:getState()},`que_ano_progreso_${dateKey()}.json`);toast('Copia de seguridad preparada')}
function replaceBackup(){if(!pendingBackup)return;setState(pendingBackup);pendingBackup=null;round=null;closeDialog();showView('hoy');toast('Progreso restaurado')}
function applyEditorImport(){if(!pendingEdits)return;const s=getState();for(const [id,patch] of Object.entries(pendingEdits))s.editorOverrides[id]={...(s.editorOverrides[id]||{}),...patch};pendingEdits=null;setState(s);openEditor();toast('Correcciones de texto importadas')}
const actions={
 'begin-answer':()=>qaHumanBegin(),
 'review-tab':b=>{reviewTab=b.dataset.tab==='practice'?'practice':'due';renderReview()},
 'start-daily':()=>startDaily(),answer:()=>commitAnswer(false),skip:()=>commitAnswer(true),next:()=>nextQuestion(),
 adjust:b=>setYear((round?.guess||1990)+Number(b.dataset.step)),
 hint:()=>{if(!round||round.mode==='daily'||round.phase!=='question')return;round.assisted=true;persistRound();renderGame();toast('Década revelada. Esta respuesta no consolida la fecha.')},
 detail:b=>openDetail(b.dataset.id),'close-dialog':()=>closeDialog(),help:()=>openHelp(),
 'game-image':()=>{if(!round)return;const q=displayQuestion(round.questionIds[round.index]),src=safeAsset(q.image);if(!src||q.imageRole==='context')return;openDialog('Imagen de apoyo',`<img class="detail-image" src="${src}" alt="${esc(q.imageAlt)}"><p class="source-note">${q.imageType==='documentary'?'Fotografía de archivo':'Ilustración de apoyo'}. ${esc(q.imageCredit)}</p>`)},
 'start-due':()=>{if(getState().practiceDraft){openDialog('Hay una sesión pendiente','<p>Puedes retomarla o comenzar un repaso nuevo.</p><div class="row"><button data-action="resume-practice" class="primary">Retomar</button><button data-action="replace-due">Comenzar nuevo repaso</button></div>')}else startPractice('due')},
 'replace-due':()=>{closeDialog();startPractice('due')},
 'start-practice':()=>{const mode=$('practiceMode').value,cat=$('practiceCategory').value,count=Number($('practiceCount').value);if(getState().practiceDraft){openDialog('Hay una sesión pendiente',`<p>Comenzar otra sesión reemplazará la pendiente. Las respuestas ya guardadas permanecerán en tu memoria de aprendizaje.</p><div class="row"><button data-action="resume-practice">Retomar</button><button class="primary" data-action="replace-practice" data-mode="${mode}" data-category="${esc(cat)}" data-count="${count}">Comenzar otra</button></div>`)}else startPractice(mode,cat,count)},
 'replace-practice':b=>{closeDialog();startPractice(b.dataset.mode,b.dataset.category,Number(b.dataset.count))},
 'resume-practice':()=>{if($('detailDialog').open)closeDialog();resumePractice()},
 'review-results':()=>{if(!lastSummary)return;const ids=lastSummary.answers.filter(a=>a.skipped||a.error>5).map(a=>a.id);if(getState().practiceDraft){openDialog('Sesión pendiente','<p>Retoma tu práctica antes de empezar otro repaso.</p><button class="primary" data-action="resume-practice">Retomar</button>');return}startPractice('reinforce','Todas',ids.length<=3?3:ids.length<=5?5:10,ids)},
 'select-order':b=>selectTimeline(b.dataset.id),'move-order':b=>{const ids=getState().timelineDraft?.ids||[];moveTimeline(b.dataset.id,ids.indexOf(b.dataset.id)+Number(b.dataset.step))},'confirm-order':()=>confirmTimeline(),'new-order':()=>startTimeline(),'timeline-stats':()=>openTimelineStats(),
 'collection-mode':b=>{collectionState.mode=b.dataset.mode;collectionState.page=0;renderCollection()},
 'collection-page':b=>{collectionState.page=Math.max(0,collectionState.page+Number(b.dataset.step));renderCollection()},
 'collection-group':b=>{collectionState={mode:'cards',category:b.dataset.category||'Todas',status:'all',search:'',page:0,decade:b.dataset.decade?Number(b.dataset.decade):null};renderCollection()},
 'clear-decade':()=>{collectionState.decade=null;collectionState.page=0;renderCollection()},
 'achievement-page':b=>{achievementPage=Math.max(0,achievementPage+Number(b.dataset.step));renderCollection()},
 palette:b=>{if(!availablePalettes().includes(b.dataset.palette))return;const s=getState();s.preferences.palette=b.dataset.palette;setState(s);applyPreferences();renderCollection();tone('place')},
 'stats-tab':b=>{statsState.tab=b.dataset.tab;renderStats()},'inspect-trend':()=>openCalendarDetail($('trendInspect').value),
 'calendar-month':b=>{const m=statsState.month;statsState.month=new Date(m.getFullYear(),m.getMonth()+Number(b.dataset.step),1);renderStats()},'calendar-detail':b=>openCalendarDetail(b.dataset.date),
 share:()=>openShare(), 'copy-share':()=>lastSummary&&copyShare(shareText(lastSummary)),
 'download-share':()=>{const c=$('shareCanvas');if(c)c.toBlob(blob=>{if(blob)downloadBlob(blob,`que_ano_${lastSummary.mode==='daily'?lastSummary.challenge:lastSummary.mode}.png`);else toast('No se pudo exportar la imagen. Puedes copiar el texto.')},'image/png')},
 'native-share':async()=>{if(!lastSummary||!navigator.share)return;try{await navigator.share({title:'QUÉ AÑO',text:shareText(lastSummary)})}catch(e){if(e.name!=='AbortError')copyShare(shareText(lastSummary))}},
 'share-collection':()=>{const s=getState();copyShare(`QUÉ AÑO · MI COLECCIÓN\n${discoveredIds(s).size}/${QUESTIONS.length} fechas descubiertas\n${Object.values(s.questionStats).filter(st=>mastery(st).key==='mastered').length} consolidadas`)},
 'share-order':()=>{const t=getState().timeline;copyShare(`QUÉ AÑO · LÍNEA TEMPORAL\n${t.rounds} rondas · ${t.perfect} perfectas\n${t.positions}/${t.elements} elementos bien colocados\nMejor racha: ${t.bestStreak}`)},
 'export-backup':()=>exportBackup(),'import-backup':()=>$('backupInput').click(),'confirm-import':()=>replaceBackup(),
 'reset-confirm':()=>openDialog('Borrar el progreso',`<p>Se eliminarán las partidas, la colección y las correcciones locales de v1.0 en este navegador. Puedes guardar una copia antes.</p><div class="row"><button data-action="export-backup">Exportar copia</button><button class="danger" data-action="reset-now">Borrar progreso de v1.0</button></div>`),
 'reset-now':()=>{setState(defaultState());round=null;closeDialog();showView('hoy');toast('Progreso de v1.0 borrado')},
 'open-editor':()=>openEditor(),'editor-search':()=>{editorSearch=$('editorSearch').value;editorPage=0;openEditor()},'editor-page':b=>{editorPage=Math.max(0,editorPage+Number(b.dataset.step));openEditor()},'edit-question':b=>editQuestion(b.dataset.id),
 'export-bank':()=>downloadJSON({app:'QUÉ AÑO',version:'1.0',contentVersion:3,scheduleVersion:2,questions:QUESTIONS.map(q=>displayQuestion(q.id))},'que_ano_banco_v1_0.json'),
 'import-edits':()=>$('editorInput').click(),'confirm-edits':()=>applyEditorImport(),
 audit:()=>{const report=auditQuestionBank(),simulation=simulateSchedule(365);openDialog('Auditoría del banco',`<p>${report.total} preguntas · ${report.images} imágenes · ${report.extendedContext} contextos ampliados.</p><p>Separación mínima observada: ${simulation.minGap} días. Especiales válidos: ${simulation.allSpecialsValid?'sí':'no'}.</p><p>${report.warnings.genericSources.length} referencias heredadas pendientes de verificación.</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:.8rem">${esc(JSON.stringify(report.issues,null,2))}</pre><button data-action="download-audit">Exportar auditoría</button>`)},
 'download-audit':()=>downloadJSON({bank:auditQuestionBank(),schedule:simulateSchedule(365)},'que_ano_auditoria_v1_0.json')
};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.view){showView(b.dataset.view);return}if(b.dataset.action&&actions[b.dataset.action])actions[b.dataset.action](b)});
$('soundToggle').addEventListener('click',()=>{const s=getState();s.preferences.sound=!s.preferences.sound;setState(s);applyPreferences();if(s.preferences.sound)tone('confirm')});
$('settingsButton').addEventListener('click',()=>openSettings());$('closeDialog').addEventListener('click',()=>closeDialog());
$('detailDialog').addEventListener('click',e=>{if(e.target===$('detailDialog')){const rect=e.target.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)closeDialog()}});
$('detailDialog').addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true})});
document.addEventListener('input',e=>{
  if(e.target.id==='yearSlider')setYear(e.target.value);
  if(e.target.id==='yearInput'&&round?.phase==='question'){const n=Number(e.target.value);if(Number.isInteger(n)&&n>=GLOBAL_MIN_YEAR&&n<=GLOBAL_MAX_YEAR){round.guess=n;if($('yearSlider'))$('yearSlider').value=n;persistRound()}}
  if(e.target.id==='volumeSetting'){const s=getState();s.preferences.volume=Number(e.target.value)/100;setState(s)}
});
document.addEventListener('change',e=>{
 const id=e.target.id,v=e.target.value;
 if(id==='soundSetting'){const s=getState();s.preferences.sound=e.target.checked;setState(s);applyPreferences();tone('confirm')}
 if(id==='motionSetting'){const s=getState();s.preferences.motion=e.target.checked?'reduced':'system';setState(s);applyPreferences()}
 if(id==='volumeSetting')tone('confirm');
 if(id==='collectionCategory'){collectionState.category=v;collectionState.page=0;renderCollection()}
 if(id==='collectionStatus'){collectionState.status=v;collectionState.page=0;renderCollection()}
 if(id==='statsPeriod'){statsState.period=v;renderStats()}
 if(id==='trendMetric'){statsState.metric=v;renderStats()}
 if(id==='editorFilter'){editorFilter=v;editorPage=0;openEditor()}
});
document.addEventListener('submit',e=>{
 if(e.target.id==='collectionSearchForm'){e.preventDefault();collectionState.search=$('collectionSearch').value;collectionState.page=0;renderCollection()}
 if(e.target.id==='editorForm'){e.preventDefault();const id=e.target.dataset.id,patch={};for(const k of ['title','prompt','fact','context','significance','sourceLabel','source'])patch[k]=$('edit-'+k).value.trim();if(!patch.title||!patch.prompt||!patch.fact||!patch.sourceLabel||!safeURL(patch.source)){toast('Completa título, pregunta, hecho y una fuente válida.');return}const s=getState();s.editorOverrides[id]=patch;if($('edit-reviewed').checked){if(!s.reviewedIds.includes(id))s.reviewedIds.push(id)}else s.reviewedIds=s.reviewedIds.filter(x=>x!==id);setState(s);openEditor();toast('Corrección guardada')}
});
document.addEventListener('keydown',e=>{
 if($('detailDialog').open)return;
 if(e.key==='Escape'&&timelineSelection){timelineSelection=null;renderTimeline();return}
 if(!round)return;
 const target=e.target,gameTarget=target.id==='yearInput'||target.id==='yearSlider'||target.id==='primaryAction'||target.id==='main'||target===document.body;
 if(e.key==='Enter'&&gameTarget){e.preventDefault();if(e.repeat)return;if(round.phase==='question'){if(IS_HUMAN_TESTER&&qaHumanReadyKey!==qaTimerKey())qaHumanBegin();else commitAnswer();}else nextQuestion();return}
 if(round.phase==='question'&&['ArrowLeft','ArrowRight'].includes(e.key)&&!['INPUT','SELECT','TEXTAREA','BUTTON'].includes(target.tagName)){e.preventDefault();setYear(round.guess+(e.key==='ArrowLeft'?-1:1)*(e.shiftKey?10:1))}
});
document.addEventListener('dragstart',e=>{const c=e.target.closest('[data-order-id]');if(c&&!getState().timelineDraft?.answered){draggedOrderId=c.dataset.orderId;e.dataTransfer?.setData('text/plain',draggedOrderId)}});
document.addEventListener('dragover',e=>{if(e.target.closest('[data-order-id]')&&draggedOrderId)e.preventDefault()});
document.addEventListener('drop',e=>{const c=e.target.closest('[data-order-id]');if(c&&draggedOrderId){e.preventDefault();moveTimeline(draggedOrderId,getState().timelineDraft.ids.indexOf(c.dataset.orderId));draggedOrderId=null}});
document.addEventListener('dragend',()=>{draggedOrderId=null});
$('backupInput').addEventListener('change',async e=>{const file=e.target.files?.[0];try{if(!file)return;if(file.size>10*1024*1024)throw Error('Archivo demasiado grande');const data=JSON.parse(await file.text()),raw=data.state||data;if(!raw||!Array.isArray(raw.sessions)||!raw.questionStats||typeof raw.questionStats!=='object')throw Error('No es una copia de progreso');if(raw.schemaVersion>SCHEMA_VERSION)throw Error('La copia corresponde a una versión más reciente');pendingBackup=migrateState(raw);if(pendingBackup.sessions.length!==raw.sessions.length)throw Error('La copia contiene partidas incompletas o inválidas');openDialog('Restaurar progreso',`<p>La copia contiene ${pendingBackup.sessions.length} desafíos, ${discoveredIds(pendingBackup).size} fechas descubiertas y ${pendingBackup.timeline.rounds} rondas de Línea temporal.</p><p>Al restaurarla reemplazarás el progreso actual de v1.0.</p><div class="row"><button data-action="export-backup">Respaldar el actual</button><button class="primary" data-action="confirm-import">Restaurar esta copia</button></div>`)}catch(err){pendingBackup=null;toast(err.message||'No se pudo leer la copia')}finally{e.target.value=''}});
$('editorInput').addEventListener('change',async e=>{const file=e.target.files?.[0];try{if(!file)return;if(file.size>5*1024*1024)throw Error('Archivo demasiado grande');const data=JSON.parse(await file.text()),rows=Array.isArray(data)?data:data.questions;if(!Array.isArray(rows))throw Error('Se espera un banco de preguntas');const patches={};for(const q of rows){if(!q||!QUESTION_BY_ID.has(q.id))continue;const p={};for(const k of ['title','prompt','fact','context','significance','source','sourceLabel'])if(typeof q[k]==='string'&&q[k].length<=4000)p[k]=q[k];if(p.source&&!safeURL(p.source))throw Error('Hay una URL de fuente inválida');patches[q.id]=p;}pendingEdits=patches;openDialog('Importar correcciones',`<p>Se aplicarán textos a ${Object.keys(patches).length} preguntas existentes. No cambia el calendario ni los años de respuesta.</p><button class="primary" data-action="confirm-edits">Aplicar correcciones</button>`)}catch(err){pendingEdits=null;toast(err.message||'No se pudo leer el archivo')}finally{e.target.value=''}});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h==='editor')openEditor();else if(['hoy','repaso','orden','coleccion','estadisticas'].includes(h))showView(h)});
window.addEventListener('pagehide',()=>{if(round)persistRound()});
// Expose read-only audit helpers for the bundled validation script and editorial panel.
window.auditQuestionBank=auditQuestionBank;window.simulateSchedule=simulateSchedule;
try{const s=getState();updateAchievements(s);setState(s);showView('hoy',{focus:false});if(location.hash==='#editor')openEditor();else if(!s.onboardingSeen){s.onboardingSeen=true;setState(s);if(!IS_HUMAN_TESTER)openHelp()}}catch(error){$('view').innerHTML='<div class="empty-state"><h1>No pudimos abrir el juego</h1><p>Comprueba que descomprimiste el ZIP completo y que la carpeta js está junto al HTML. Conserva tu copia de progreso.</p></div>';console.error(error)}

