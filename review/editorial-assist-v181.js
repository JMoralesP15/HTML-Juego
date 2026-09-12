/* QUÉ AÑO v1.8.1 — revisión asistida del lote narrativo 01 (50 hitos).
 * No modifica el banco ni el juego. Las decisiones se guardan aparte en localStorage.
 */
(function(){
  'use strict';
  const proposals=window.__QA_EDITORIAL_PROPOSALS_V181__?.items||{};
  const ids=Object.keys(proposals);
  const STORE_KEY='que-ano-editorial-proposals-v181-batch01';
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const load=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}};
  let store=load(),busy=false;
  const rec=id=>store[id]||(store[id]={status:'pending',edits:{},note:'',updatedAt:null});
  const save=()=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(store))}catch{};renderBatchMetric()};
  const currentId=()=>window.__QA_EDITORIAL_REVIEW_CONSOLE__?.getCurrent?.()||null;

  function renderBatchMetric(){
    const approved=ids.filter(id=>rec(id).status==='approved').length;
    const edited=ids.filter(id=>rec(id).status==='edit').length;
    const rejected=ids.filter(id=>rec(id).status==='rejected').length;
    const done=approved+edited+rejected;
    const el=document.getElementById('v181BatchMetric');
    if(el)el.textContent=`Lote 50 · ${done}/50 · ${approved} aprobadas · ${edited} editar · ${rejected} descartadas`;
  }

  function openProposal(id){
    if(!proposals[id])return;
    const search=document.getElementById('searchInput');
    if(!search)return;
    search.value=id;search.dispatchEvent(new Event('input',{bubbles:true}));
    setTimeout(()=>document.querySelector(`[data-open="${CSS.escape(id)}"]`)?.click(),30);
  }
  function nextProposal(delta=1){
    const id=currentId(),i=Math.max(0,ids.indexOf(id));
    openProposal(ids[(i+delta+ids.length)%ids.length]);
  }
  function clearBatchFilter(){
    const search=document.getElementById('searchInput');if(!search)return;search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));
  }

  function topControls(){
    if(document.getElementById('v181BatchButton'))return;
    const actions=document.querySelector('.top-actions');if(!actions)return;
    const metric=document.createElement('span');metric.id='v181BatchMetric';metric.className='v181-batch-metric';
    const start=document.createElement('button');start.id='v181BatchButton';start.className='button secondary';start.textContent='Revisar lote 50';start.onclick=()=>openProposal(ids[0]);
    const all=document.createElement('button');all.className='button ghost';all.textContent='Ver las 300';all.onclick=clearBatchFilter;
    const exp=document.createElement('button');exp.className='button secondary';exp.textContent='Exportar lote 50';exp.onclick=exportBatch;
    actions.prepend(metric,start,all,exp);renderBatchMetric();
  }

  function setStatus(id,status){const r=rec(id);r.status=status;r.updatedAt=new Date().toISOString();save();renderProposal()}
  function saveFields(id){
    const r=rec(id),root=document.querySelector('.v181-proposal-section');if(!root)return;
    root.querySelectorAll('[data-v181-edit]').forEach(el=>r.edits[el.dataset.v181Edit]=el.value);
    const note=root.querySelector('[data-v181-note]');if(note)r.note=note.value;
    r.updatedAt=new Date().toISOString();save();
  }
  function exportBatch(){
    const payload={schema:'que-ano-editorial-proposals-review',version:'1.8.1-draft.1',batch:'batch-01-50',exportedAt:new Date().toISOString(),proposalCount:ids.length,records:store};
    const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`editorial-proposals-v181-batch01-${new Date().toISOString().slice(0,10)}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function renderProposal(){
    if(busy)return;busy=true;
    try{
      document.querySelector('.v181-proposal-section')?.remove();
      const id=currentId(),p=proposals[id];
      const textSection=[...document.querySelectorAll('.pane .section')].find(s=>s.querySelector('h3')?.textContent.includes('2 · Texto de aprendizaje'));
      if(textSection)textSection.hidden=Boolean(p);
      if(!p)return;
      const q=(window.QUESTIONS||[]).find(x=>x.id===id);if(!q)return;
      const r=rec(id),summary=r.edits.summary??p.summary,expanded=r.edits.expanded??p.expanded,dateNote=r.edits.dateNote??p.dateNote;
      const sec=document.createElement('section');sec.className='section v181-proposal-section';
      sec.innerHTML=`
        <div class="section-head"><div><span class="v181-kicker">LOTE 01 · PROPUESTA ${String(ids.indexOf(id)+1).padStart(2,'0')}/50</span><h3>Texto narrativo que vería el jugador</h3></div><span class="chip ${p.confidence==='high'?'good':p.confidence==='medium'?'warn':'bad'}">confianza ${esc(p.confidence)}</span></div>
        <div class="section-body">
          <p class="v181-rule">Contrato: <strong>un relato breve visible</strong> + <strong>contexto ampliado que añade información</strong>. “Qué fue”, “Por qué importa” y “Dato para recordar” no son etiquetas de interfaz.</p>
          <div class="v181-field"><label>Aprendizaje breve visible</label><textarea data-v181-edit="summary">${esc(summary)}</textarea><small>Objetivo: 2–4 frases naturales. Debe explicar el hito, no la ficha ni el proceso de verificación.</small></div>
          <div class="v181-field"><label>Contexto ampliado opcional</label><textarea data-v181-edit="expanded">${esc(expanded)}</textarea><small>Debe aportar información nueva. Si sólo repite el bloque anterior, debe descartarse o reescribirse.</small></div>
          <div class="v181-field"><label>Nota de precisión cronológica <em>(sólo si hace falta)</em></label><textarea data-v181-edit="dateNote">${esc(dateNote||'')}</textarea></div>
          <div class="v181-source"><div><b>Fuente</b><a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">${esc(p.sourceLabel)} ↗</a></div><div><b>Imagen ideal</b><span>${esc(p.imageBrief||'Sin requisito de imagen.')}</span></div></div>
          <details class="v181-current"><summary>Comparar con el contenido actual</summary><div class="compare"><div class="compare-card"><h4>Contexto actual</h4><p>${esc(q.context||'Sin contexto explícito')}</p></div><div class="compare-card"><h4>Relevancia actual</h4><p>${esc(q.significance||'Sin relevancia explícita')}</p></div></div></details>
          <div class="v181-decision"><button data-v181-status="approved" class="status-btn ${r.status==='approved'?'selected':''}" data-tone="good">✓ Aprobar propuesta</button><button data-v181-status="edit" class="status-btn ${r.status==='edit'?'selected':''}" data-tone="warn">✎ Aprobar con edición</button><button data-v181-status="rejected" class="status-btn ${r.status==='rejected'?'selected':''}" data-tone="bad">✕ Descartar</button></div>
          <label class="v181-note">Observación del revisor<textarea data-v181-note placeholder="Por qué aprobar, qué corregir o qué falta…">${esc(r.note||'')}</textarea></label>
          <div class="v181-nav"><button class="button secondary" data-v181-prev>← Propuesta anterior</button><button class="button primary" data-v181-next>Guardar y siguiente propuesta →</button></div>
        </div>`;
      const pane=document.querySelector('.review-grid .pane');if(pane){const first=pane.querySelector('.section');first?.after(sec)}
    }finally{busy=false}
  }

  document.addEventListener('click',e=>{
    const status=e.target.closest?.('[data-v181-status]');if(status){const id=currentId();if(id&&proposals[id]){saveFields(id);setStatus(id,status.dataset.v181Status)}return}
    if(e.target.closest?.('[data-v181-next]')){const id=currentId();if(id)saveFields(id);nextProposal(1);return}
    if(e.target.closest?.('[data-v181-prev]')){const id=currentId();if(id)saveFields(id);nextProposal(-1);return}
  },true);
  document.addEventListener('input',e=>{if(e.target.matches?.('[data-v181-edit],[data-v181-note]')){const id=currentId();if(id)saveFields(id)}});

  const card=document.getElementById('reviewCard');
  if(card)new MutationObserver(()=>queueMicrotask(renderProposal)).observe(card,{childList:true,subtree:true});
  topControls();renderProposal();renderBatchMetric();
  window.__QA_EDITORIAL_ASSIST_V181__={ids,getStore:()=>JSON.parse(JSON.stringify(store)),openProposal,exportBatch};
})();
