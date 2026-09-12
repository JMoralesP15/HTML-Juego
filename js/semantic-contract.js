/* QUÉ AÑO v1.7 — contrato semántico de clases estables.
 * Mantiene hooks de accesibilidad/QA sin monkey-patching renderers históricos.
 */
(function(){
  'use strict';
  function apply(){
    document.querySelector('.atlas-header-session > span:first-child')?.classList.add('round-label');
    document.querySelector('.atlas-summary')?.classList.add('summary-v11');
  }
  window.__QYA_RUNTIME__?.onRender(apply);
  apply();
  window.__QYA_SEMANTICS__=Object.freeze({apply});
})();
