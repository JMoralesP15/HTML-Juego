// v1.7 architectural-debt report. Measures active runtime, not merely files kept for history.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=[...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m=>m[1]);
const scripts=[...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map(m=>m[1]);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const activeSources=scripts.map(src=>({src,code:read(src)}));
const count=(re,code)=>[...code.matchAll(re)].length;
const mutationObservers=activeSources.flatMap(({src,code})=>Array.from({length:count(/new\s+MutationObserver\s*\(/g,code)},()=>src));
const lifecycleAssignments=[];
for(const {src,code} of activeSources){
  for(const symbol of ['setView','renderGame','renderSummary']){
    const hits=count(new RegExp(`\\b${symbol}\\s*=\\s*function\\b`,'g'),code);
    for(let i=0;i<hits;i++)lifecycleAssignments.push({src,symbol});
  }
}
const behaviorAssignments=[];
for(const {src,code} of activeSources){
  for(const symbol of ['commitAnswer','nextQuestion','setYear','openSettings','openDetail','qaTimerStart','qaTimerPause','qaTimerResume','qaTimerComputeRemaining']){
    const hits=count(new RegExp(`\\b${symbol}\\s*=\\s*function\\b`,'g'),code);
    for(let i=0;i<hits;i++)behaviorAssignments.push({src,symbol});
  }
}
const versionedScripts=scripts.filter(x=>/-v\d+\.js$/.test(x));
const patchStyles=css.filter(x=>/(compat|fix|polish)/i.test(x));
const patchScripts=scripts.filter(x=>/(compat|fix|polish)/i.test(x));
const report={
  methodology:'Static active-runtime inventory from index.html. Counts layering/coupling signals; it is not a cyclomatic-complexity score.',
  active:{stylesheets:css.length,scripts:scripts.length,css,scripts},
  debtSignals:{mutationObservers,lifecycleAssignments,behaviorAssignments,versionedScripts,patchStyles,patchScripts},
  budgets:{stylesheetsMax:6,mutationObserversMax:0,lifecycleAssignmentsMax:1,patchLayersMax:0},
  pass:{stylesheets:css.length<=6,mutationObservers:mutationObservers.length===0,lifecycleAssignments:lifecycleAssignments.length<=1,patchLayers:patchStyles.length===0&&patchScripts.length===0},
  nextTargets:{versionedPresentationScripts:0,behaviorMonkeyPatches:'migrate only when parity tests exist; do not trade reliability for a cosmetic count'}
};
report.pass.all=Object.values(report.pass).every(Boolean);
const out=path.join(root,'reports');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'architecture-v17.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(!report.pass.all)process.exitCode=1;
