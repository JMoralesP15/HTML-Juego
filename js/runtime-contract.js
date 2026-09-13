/* QUÉ AÑO v1.7 — contrato de ciclo de render.
 * Centraliza la notificación de vistas para evitar observers y wrappers de presentación encadenados.
 * No modifica contenido, gameplay, persistencia, scoring ni calendario.
 */
(function(){
  'use strict';
  const VERSION='1.7.0-beta.1';
  const listeners=new Set();
  let queued=false,lastReason='boot',renderCount=0;

  function notify(){
    queued=false;renderCount++;
    const detail={reason:lastReason,renderCount,view:typeof currentView==='string'?currentView:null,phase:typeof round!=='undefined'&&round?round.phase:null};
    for(const fn of [...listeners]){try{fn(detail)}catch(error){console.error('[QYA runtime] render listener failed',error)}}
    try{document.dispatchEvent(new CustomEvent('qya:rendered',{detail}))}catch{}
  }
  function emit(reason='manual'){
    lastReason=reason;
    if(queued)return;
    queued=true;
    // Finish presentation in the same task, before the browser can paint legacy copy.
    queueMicrotask(notify);
  }
  function onRender(fn){
    if(typeof fn!=='function')return ()=>{};
    listeners.add(fn);
    return ()=>listeners.delete(fn);
  }

  const baseSetView=window.setView||setView;
  setView=function(html){
    const result=baseSetView(html);
    emit('setView');
    return result;
  };

  window.__QYA_RUNTIME__=Object.freeze({version:VERSION,onRender,emit,get listenerCount(){return listeners.size},get renderCount(){return renderCount}});
  emit('boot');
})();
