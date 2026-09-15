/* QUÉ AÑO v1.8.8 — mobile view-state bridge.
 * Reads the canonical render contract. It never wraps renderers or changes game state.
 */
(function(){
  'use strict';
  const VERSION='1.8.8-mobile.1';
  let previousKey='';

  function sync(detail={}){
    const body=document.body;
    if(!body)return;
    const mobile=matchMedia('(max-width:760px)').matches;
    body.toggleAttribute('data-mobile-ui',mobile);
    body.dataset.qyaView=detail.view||((typeof currentView==='string'&&currentView)||'hoy');
    const phase=detail.phase||((typeof round!=='undefined'&&round?.phase)||'idle');
    body.dataset.qyaPhase=phase;

    const surface=document.querySelector('.atlas-v12,.summary-v11,.archive-cover');
    const questionId=typeof round!=='undefined'&&round?.questionIds?.[round.index]||'';
    const key=`${body.dataset.qyaView}:${phase}:${questionId}`;
    if(mobile&&surface&&key!==previousKey){
      previousKey=key;
      requestAnimationFrame(()=>{
        const top=Math.max(0,surface.getBoundingClientRect().top+window.scrollY-56);
        if(window.scrollY>top+24)window.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
      });
    }
  }

  const media=matchMedia('(max-width:760px)');
  media.addEventListener?.('change',()=>sync({}));
  window.__QYA_RUNTIME__?.onRender(sync);
  sync({});
  window.__QA_MOBILE_V188__=Object.freeze({version:VERSION,sync});
})();
