/* v1.2 regression bridge.
   Conserva hooks semánticos/QA de RC.2 mientras la nueva identidad cambia la composición. */
const qaV12RenderGame=renderGame;
renderGame=function(){
  const out=qaV12RenderGame();
  const roundLabel=document.querySelector('.atlas-header-session > span:first-child');
  if(roundLabel)roundLabel.classList.add('round-label');
  return out;
};
const qaV12RenderSummary=renderSummary;
renderSummary=function(session){
  const out=qaV12RenderSummary(session);
  document.querySelector('.atlas-summary')?.classList.add('summary-v11');
  return out;
};
