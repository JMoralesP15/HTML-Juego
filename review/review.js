/* QUÉ AÑO v1.8.7 — canonical browser-only editorial review console.
 * One interface and one decision store for factual, textual and visual review.
 */
(function(){
  'use strict';
  const VERSION='1.8.7-draft.2';
  const STORAGE_KEY='que-ano-editorial-review-v18';
  const LEGACY_V181_KEY='que-ano-editorial-proposals-v181-batch01';
  const evidence=(window.__QA_V18_EVIDENCE__?.rows)||{};
  const questions=Array.isArray(window.QUESTIONS)?window.QUESTIONS:(typeof QUESTIONS!=='undefined'?QUESTIONS:[]);
  const byId=new Map(questions.map(q=>[q.id,q]));
  const v181=window.__QA_EDITORIAL_PROPOSALS_V181__?.items||{};
  const v182=window.__QA_EDITORIAL_PROPOSALS_V182__?.items||{};
  const batchV187=new Map((window.__QA_EDITORIAL_BATCH_V187__?.items||[]).map(x=>[x.id,x]));
  const batch02Ids=new Set(window.__QA_EDITORIAL_BATCH02_V187__?.ids||[]);
  const v181Ids=new Set(Object.keys(v181));
  const priority={needs_review:0,item_specific_reference:1,structured_corroborated:2,manual_verified:3};
  const factualStates=['pending','approved','doubtful','incorrect','review_source'];
  const textStates=['pending','approved','edit','generic','redundant'];
  const mediaStates=['pending','approved','irrelevant','anachronistic','rights_review','no_photo'];
  const defaultRecord=()=>({factualStatus:'pending',textStatus:'pending',mediaStatus:'pending',mediaChoice:'pending',note:'',edits:{},updatedAt:null});
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const asset=v=>{if(!v)return'';if(/^https?:|^data:|^blob:/.test(v))return v;return `../${String(v).replace(/^\.\//,'')}`};
  const $=id=>document.getElementById(id);
  const proposalFor=id=>v182[id]||v181[id]||null;
  const batchItemFor=id=>batchV187.get(id)||null;
  const batchFor=id=>batch02Ids.has(id)?'batch-02-100':v181Ids.has(id)?'batch-01-50':'none';
  const candidateFor=(q,e)=>batchItemFor(q.id)?.mediaCandidate||e?.media||q?.v18Media||null;

  let store=loadStore(),filtered=[],currentId=null;

  function loadStore(){
    try{
      const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(parsed&&parsed.records&&typeof parsed.records==='object')return {version:VERSION,updatedAt:parsed.updatedAt||null,migrations:parsed.migrations||{},records:parsed.records};
    }catch{}
    return {version:VERSION,updatedAt:null,migrations:{},records:{}};
  }
  function persist(){store.version=VERSION;store.updatedAt=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(store))}catch{};updateMetrics()}
  function record(id){const base=store.records[id]||{};const next={...defaultRecord(),...base,edits:{...(base.edits||{})}};store.records[id]=next;return next}
  function migrateLegacyV181(){
    if(store.migrations?.v181)return;
    try{
      const legacy=JSON.parse(localStorage.getItem(LEGACY_V181_KEY)||'{}');
      for(const [id,old] of Object.entries(legacy||{})){
        if(!byId.has(id)||!v181[id])continue;
        const r=record(id);
        if(r.textStatus==='pending')r.textStatus=old.status==='approved'?'approved':old.status==='edit'?'edit':old.status==='rejected'?'redundant':'pending';
        for(const key of ['summary','expanded','dateNote'])if(old.edits?.[key]!=null&&r.edits[key]==null)r.edits[key]=old.edits[key];
        if(old.note&&!r.note)r.note=old.note;
      }
    }catch{}
    store.migrations={...(store.migrations||{}),v181:true};persist();
  }
  function decided(v){return v&&v!=='pending'}
  function complete(r){return decided(r.factualStatus)&&decided(r.textStatus)&&decided(r.mediaStatus)}
  function approved(r){return r.factualStatus==='approved'&&r.textStatus==='approved'&&['approved','no_photo'].includes(r.mediaStatus)}
  function flagged(r){return complete(r)&&!approved(r)}
  function evidenceFor(id){return evidence[id]||byId.get(id)?.v18Evidence||null}
  function statusLabel(s){return ({manual_verified:'Verificada manualmente',structured_corroborated:'Corroborada estructuralmente',item_specific_reference:'Referencia específica',needs_review:'Requiere revisión'})[s]||s||'Sin evidencia'}
  function statusTone(s){return s==='manual_verified'?'good':s==='needs_review'?'bad':'warn'}
  function learningFor(q,p){
    const item=batchItemFor(q.id);
    return {
      summary:item?.learning?.summary??p?.summary??q.context??q.fact??'',
      expanded:item?.learning?.expanded??p?.expanded??q.significance??'',
      dateNote:item?.learning?.dateNote??p?.dateNote??'',
      check:item?.textCheck||null,
      source:item?.textSource|| (p?'proposal':'current_bank')
    };
  }
  function allRows(){return questions.map(q=>({q,e:evidenceFor(q.id),r:record(q.id),p:proposalFor(q.id),batch:batchFor(q.id)})).sort((a,b)=>(priority[a.e?.status]??4)-(priority[b.e?.status]??4)||a.q.category.localeCompare(b.q.category,'es')||a.q.title.localeCompare(b.q.title,'es'))}

  function populateCategories(){const cats=[...new Set(questions.map(q=>q.category))].sort((a,b)=>a.localeCompare(b,'es'));$('categoryFilter').insertAdjacentHTML('beforeend',cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join(''))}
  function applyFilters({keepCurrent=true}={}){
    const status=$('statusFilter').value,category=$('categoryFilter').value,media=$('mediaFilter').value,batch=$('batchFilter')?.value||'all',search=$('searchInput').value.trim().toLowerCase();
    filtered=allRows().filter(({q,e,r,batch:rowBatch})=>{
      if(batch!=='all'&&rowBatch!==batch)return false;
      if(category!=='all'&&q.category!==category)return false;
      if(search&&!`${q.id} ${q.title} ${q.category} ${q.region||''}`.toLowerCase().includes(search))return false;
      const candidate=Boolean(candidateFor(q,e));
      if(media==='candidate'&&!candidate)return false;
      if(media==='none'&&candidate)return false;
      if(media==='unreviewed'&&r.mediaStatus!=='pending')return false;
      if(status==='pending'&&complete(r))return false;
      if(status==='reviewed'&&!complete(r))return false;
      if(status==='approved'&&!approved(r))return false;
      if(status==='flagged'&&!flagged(r))return false;
      if(['needs_review','manual_verified','structured_corroborated'].includes(status)&&e?.status!==status)return false;
      return true;
    });
    if(!keepCurrent||!filtered.some(x=>x.q.id===currentId))currentId=filtered[0]?.q.id||null;
    renderQueue();renderCurrent();updateMetrics();
  }
  function renderQueue(){
    $('queueCount').textContent=`${filtered.length} ${filtered.length===1?'resultado':'resultados'}`;
    const index=filtered.findIndex(x=>x.q.id===currentId);$('currentPosition').textContent=filtered.length?`${Math.max(0,index)+1} / ${filtered.length}`:'0 / 0';
    $('queueList').innerHTML=filtered.map(({q,r,batch},i)=>`<button class="queue-item ${q.id===currentId?'active':''}" data-open="${esc(q.id)}"><span class="num">${String(i+1).padStart(3,'0')}</span><span><strong>${esc(q.title)}</strong><small>${q.year} · ${esc(q.category)}${batch!=='none'?` · ${esc(batch)}`:''}</small></span><i class="dot ${approved(r)?'approved':flagged(r)?'flagged':''}" title="${complete(r)?approved(r)?'Aprobada':'Con observaciones':'Pendiente'}"></i></button>`).join('')||'<div class="empty-state">No hay fichas con estos filtros.</div>';
  }
  function statusButtons(group,current,defs){return `<div class="status-group">${defs.map(([value,label,tone])=>`<button class="status-btn ${current===value?'selected':''}" data-status-group="${group}" data-status-value="${value}" data-tone="${tone||''}">${label}</button>`).join('')}</div>`}
  function sourceLink(url,label){return url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label||'Abrir fuente')} ↗</a>`:'<span>Sin URL específica</span>'}
  function imageCard(title,src,caption){return `<div class="compare-card"><h4>${esc(title)}</h4>${src?`<div class="photo-stage"><img src="${esc(asset(src))}" alt="" loading="lazy"></div>`:'<div class="photo-stage"><div class="photo-empty">Sin imagen</div></div>'}${caption?`<p class="photo-credit">${caption}</p>`:''}</div>`}

  function renderCurrent(){
    const row=filtered.find(x=>x.q.id===currentId);
    if(!row){$('reviewCard').innerHTML='<div class="empty-state">No hay fichas disponibles con los filtros actuales.</div>';return}
    const {q,e,p,batch}=row,r=record(q.id),candidate=candidateFor(q,e),currentImage=q.v18LegacyImage||q.image||'';
    const learning=learningFor(q,p),batchItem=batchItemFor(q.id);
    const currentCaption=q.imageCredit?`${esc(q.imageCredit)}${q.imageLicense?` · ${esc(q.imageLicense)}`:''}`:'';
    const candidateCaption=candidate?`${esc(candidate.artist||'Autor no indicado')} · ${esc(candidate.license||'Licencia no indicada')}<br>${candidate.sourcePage?sourceLink(candidate.sourcePage,'Procedencia y licencia'):''}`:'';
    const issues=e?.issues||[];
    const summary=r.edits.summary??learning.summary,expanded=r.edits.expanded??learning.expanded,dateNote=r.edits.dateNote??learning.dateNote;
    const contractualText=batch!=='none'||Boolean(p);
    const textState=batchItem?.textCheck;
    const textChip=p?'propuesta contractual':batchItem?textState?.summaryOk&&textState?.expandedOk&&textState?.noMetadiscourse?'contenido actual compatible':'contenido actual · requiere ajuste':'contenido actual';
    const photoChip=batchItem?.mediaCandidate?'foto real candidata':candidate?'candidata previa':'sin candidata';
    $('reviewCard').innerHTML=`
      <header class="record-header"><div><span class="kicker">${esc(q.id)}</span><h2>${esc(q.title)}</h2><div class="record-meta"><span class="chip">${q.year}</span><span class="chip">${esc(q.category)}</span><span class="chip">${esc(q.region||'Sin región')}</span>${batch!=='none'?`<span class="chip good">${esc(batch)}</span>`:''}<span class="chip ${statusTone(e?.status)}">${esc(statusLabel(e?.status))}</span></div></div><div class="evidence-status">${complete(r)?approved(r)?'<strong style="color:var(--good)">REVISIÓN COMPLETA · APROBADA</strong>':'<strong style="color:var(--warn)">REVISIÓN COMPLETA · CON OBSERVACIONES</strong>':'Pendiente de hecho, texto y visual'}</div></header>
      <div class="review-grid"><section class="pane">
        <div class="section"><div class="section-head"><h3>1 · Hecho y fuente</h3></div><div class="section-body"><div class="copy-block"><span>Pregunta</span><p>${esc(q.prompt||'')}</p></div><div class="copy-block"><span>Dato actual</span><p>${esc(q.fact||'Sin dato breve')}</p></div><div class="source-row"><span class="chip ${statusTone(e?.status)}">${esc(statusLabel(e?.status))}</span>${sourceLink(p?.source||batchItem?.sourceUrl||e?.sourceUrl||q.source,p?.sourceLabel||batchItem?.sourceLabel||e?.sourceLabel||q.sourceLabel)}</div>${e?.evidence?.yearMatch?`<div class="copy-block" style="margin-top:.8rem"><span>Corroboración temporal</span><p>${esc(e.evidence.yearMatch.label||'Fecha')}: ${esc(e.evidence.yearMatch.exactDate||e.evidence.yearMatch.year||q.year)}</p></div>`:''}${issues.length?`<ul class="issue-list">${issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}<div style="margin-top:.9rem">${statusButtons('factualStatus',r.factualStatus,[['approved','✓ Correcto','good'],['doubtful','? Dudoso','warn'],['review_source','↗ Revisar fuente','warn'],['incorrect','✕ Incorrecto','bad']])}</div></div></div>
        <div class="section"><div class="section-head"><h3>2 · Contenido textual</h3><span class="chip">${esc(textChip)}</span></div><div class="section-body">
          ${contractualText?`<div class="compare"><div class="compare-card"><h4>Actual</h4><p>${esc(q.context||q.fact||'Sin contexto explícito')}</p></div><div class="compare-card"><h4>${p?'Propuesta contractual':'Borrador para ajustar'}</h4><p>${esc(summary||'Sin resumen')}</p></div></div><div class="editor-fields" style="margin-top:.85rem"><label>Aprendizaje breve visible<textarea data-edit="summary">${esc(summary)}</textarea></label><label>Contexto ampliado opcional<textarea data-edit="expanded">${esc(expanded)}</textarea></label><label>Nota cronológica opcional<textarea data-edit="dateNote">${esc(dateNote)}</textarea></label></div>${textState?`<div class="copy-block" style="margin-top:.8rem"><span>Diagnóstico del contrato</span><p>${textState.summaryWords} palabras visibles · ${textState.expandedWords} ampliadas · ${textState.noMetadiscourse?'sin metadiscurso':'revisar metadiscurso'}.</p></div>`:''}${p?.imageBrief?`<div class="copy-block" style="margin-top:.8rem"><span>Imagen ideal según propuesta</span><p>${esc(p.imageBrief)}</p></div>`:''}`:`<div class="editor-fields"><label>Dato breve<input data-edit="fact" value="${esc(r.edits.fact??q.fact??'')}"></label><label>Contexto<textarea data-edit="context">${esc(r.edits.context??q.context??'')}</textarea></label><label>Relevancia<textarea data-edit="significance">${esc(r.edits.significance??q.significance??'')}</textarea></label></div>`}
          <div style="margin-top:.9rem">${statusButtons('textStatus',r.textStatus,[['approved','✓ Aprobar texto','good'],['edit','✎ Editar','warn'],['generic','Muy genérico','warn'],['redundant','Redundante','bad']])}</div></div></div>
      </section><section class="pane">
        <div class="section"><div class="section-head"><h3>3 · Contenido visual</h3><span class="chip">${esc(photoChip)}</span></div><div class="section-body"><div class="compare">${imageCard('Actual',currentImage,currentCaption)}${imageCard(batchItem?.mediaCandidate?'Fotografía real candidata':'Candidata documental',candidate?.src,candidateCaption)}</div>${candidate?.description?`<div class="copy-block" style="margin-top:.8rem"><span>Descripción documental</span><p>${esc(candidate.description)}</p></div>`:''}${batchItem?.mediaCandidate?`<div class="copy-block" style="margin-top:.8rem"><span>Señales automáticas</span><p>Coincidencia semántica: ${esc((batchItem.mediaCandidate.matchedEntityTokens||[]).join(', ')||'sí')} · ${batchItem.mediaCandidate.exactYear?'menciona el año del hito':'sin año exacto en metadata'}${batchItem.mediaCandidate.originalYear?` · fecha de imagen ${batchItem.mediaCandidate.originalYear}`:''}. La aprobación humana sigue siendo obligatoria.</p></div>`:''}<div style="margin-top:.9rem">${statusButtons('mediaStatus',r.mediaStatus,[['approved','✓ Aprobar visual','good'],['irrelevant','Irrelevante','warn'],['anachronistic','Anacrónica','bad'],['rights_review','Revisar derechos','warn'],['no_photo','Sin foto está bien','good']])}</div><div class="status-group" style="margin-top:.6rem">${candidate?`<button class="status-btn ${r.mediaChoice==='candidate'?'selected':''}" data-media-choice="candidate">Usar candidata</button>`:''}${currentImage?`<button class="status-btn ${r.mediaChoice==='current'?'selected':''}" data-media-choice="current">Mantener actual</button>`:''}<button class="status-btn ${r.mediaChoice==='none'?'selected':''}" data-media-choice="none">No usar imagen</button></div></div></div>
        <div class="section note-box"><div class="section-head"><h3>Nota del revisor</h3></div><div class="section-body"><textarea id="reviewNote" placeholder="Qué corregir, qué fuente buscar o por qué la imagen no sirve…">${esc(r.note||'')}</textarea></div></div>
      </section></div>`;
    $('currentPosition').textContent=`${filtered.findIndex(x=>x.q.id===currentId)+1} / ${filtered.length}`;
  }
  function updateMetrics(){const rows=questions.map(q=>record(q.id)),reviewed=rows.filter(complete).length,ok=rows.filter(approved).length,bad=rows.filter(flagged).length,noPhoto=rows.filter(r=>r.mediaStatus==='no_photo').length,pct=questions.length?reviewed/questions.length*100:0;$('metricReviewed').textContent=`${reviewed} / ${questions.length}`;$('metricPercent').textContent=`${pct.toFixed(1)}%`;$('metricApproved').textContent=ok;$('metricFlagged').textContent=bad;$('metricNoPhoto').textContent=noPhoto;$('progressBar').style.width=`${pct}%`}
  function setStatus(group,value){if(!currentId)return;const r=record(currentId);if(group==='factualStatus'&&!factualStates.includes(value))return;if(group==='textStatus'&&!textStates.includes(value))return;if(group==='mediaStatus'&&!mediaStates.includes(value))return;r[group]=value;r.updatedAt=new Date().toISOString();persist();renderCurrent();renderQueue()}
  function saveFields(){if(!currentId)return;const r=record(currentId);document.querySelectorAll('[data-edit]').forEach(el=>{r.edits[el.dataset.edit]=el.value});const note=$('reviewNote');if(note)r.note=note.value;r.updatedAt=new Date().toISOString();persist()}
  function navigate(step){if(!filtered.length)return;saveFields();let i=filtered.findIndex(x=>x.q.id===currentId);i=Math.max(0,Math.min(filtered.length-1,i+step));currentId=filtered[i].q.id;renderQueue();renderCurrent();document.querySelector('.review-card')?.scrollIntoView({behavior:'smooth',block:'start'})}
  function approveAvailable(){if(!currentId)return;const q=byId.get(currentId),e=evidenceFor(currentId),r=record(currentId);r.factualStatus='approved';r.textStatus='approved';if(candidateFor(q,e)){r.mediaStatus='approved';r.mediaChoice='candidate'}else if(q?.image){r.mediaStatus='approved';r.mediaChoice='current'}else{r.mediaStatus='no_photo';r.mediaChoice='none'}r.updatedAt=new Date().toISOString();persist();renderCurrent();renderQueue()}
  function markReview(){if(!currentId)return;const r=record(currentId);if(r.factualStatus==='pending')r.factualStatus='doubtful';if(r.textStatus==='pending')r.textStatus='edit';if(r.mediaStatus==='pending')r.mediaStatus='rights_review';r.updatedAt=new Date().toISOString();persist();renderCurrent();renderQueue()}
  function acceptNoPhoto(){if(!currentId)return;const r=record(currentId);r.mediaStatus='no_photo';r.mediaChoice='none';r.updatedAt=new Date().toISOString();persist();renderCurrent();renderQueue()}
  function exportStore(){saveFields();const payload={schema:'que-ano-editorial-review',version:VERSION,exportedAt:new Date().toISOString(),records:store.records,migrations:store.migrations};const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`que-ano-editorial-review-${new Date().toISOString().slice(0,10)}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  async function importStore(file){const parsed=JSON.parse(await file.text());if(!parsed?.records||typeof parsed.records!=='object')throw new Error('Formato de revisión inválido');store={version:VERSION,updatedAt:new Date().toISOString(),migrations:parsed.migrations||store.migrations||{},records:parsed.records};persist();applyFilters({keepCurrent:false})}

  document.addEventListener('click',e=>{
    const open=e.target.closest?.('[data-open]');if(open){saveFields();currentId=open.dataset.open;renderQueue();renderCurrent();return}
    const status=e.target.closest?.('[data-status-group]');if(status){saveFields();setStatus(status.dataset.statusGroup,status.dataset.statusValue);return}
    const media=e.target.closest?.('[data-media-choice]');if(media&&currentId){const r=record(currentId);r.mediaChoice=media.dataset.mediaChoice;r.updatedAt=new Date().toISOString();persist();renderCurrent();return}
  });
  $('prevButton').addEventListener('click',()=>navigate(-1));$('saveNextButton').addEventListener('click',()=>navigate(1));
  for(const id of ['statusFilter','categoryFilter','mediaFilter','batchFilter'])$(id)?.addEventListener('change',()=>{saveFields();applyFilters({keepCurrent:false})});
  $('searchInput').addEventListener('input',()=>applyFilters({keepCurrent:false}));$('clearFilters').addEventListener('click',()=>{for(const id of ['statusFilter','categoryFilter','mediaFilter','batchFilter'])if($(id))$(id).value='all';$('searchInput').value='';applyFilters({keepCurrent:false})});
  $('exportButton').addEventListener('click',exportStore);$('importButton').addEventListener('click',()=>$('importInput').click());$('importInput').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{await importStore(file)}catch(err){alert(err.message)}finally{e.target.value=''}});
  document.addEventListener('input',e=>{if(e.target.matches?.('[data-edit],#reviewNote'))saveFields()});
  document.addEventListener('keydown',e=>{if(/input|textarea|select/i.test(e.target?.tagName||''))return;if(e.key==='ArrowLeft'){e.preventDefault();navigate(-1)}else if(e.key==='ArrowRight'){e.preventDefault();navigate(1)}else if(e.key.toLowerCase()==='a'){e.preventDefault();approveAvailable()}else if(e.key.toLowerCase()==='r'){e.preventDefault();markReview()}else if(e.key.toLowerCase()==='n'){e.preventDefault();acceptNoPhoto()}});

  migrateLegacyV181();populateCategories();applyFilters({keepCurrent:false});
  window.__QA_EDITORIAL_REVIEW_CONSOLE__={version:VERSION,getCurrent:()=>currentId,getStore:()=>JSON.parse(JSON.stringify(store)),proposalFor,batchItemFor,batchFor,learningFor,applyFilters,exportStore};
})();
