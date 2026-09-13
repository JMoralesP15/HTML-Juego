import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const baseline=readJson('config/architecture-budget-v186.json');
const runtime=readJson('reports/runtime-ownership.json');
const css=readJson('reports/css-cascade-audit.json');
const files=readJson('reports/runtime-file-classification.json');
const audit=readJson('reports/audit-baseline-v183.json');

const current={
  activeScripts:runtime.active?.scriptCount??files.metrics?.activeScripts??null,
  activeStylesheets:runtime.active?.stylesheetCount??files.metrics?.activeStylesheets??null,
  staticCollisions:runtime.signals?.collisionCount??null,
  behaviorPatches:runtime.signals?.behaviorPatchCount??null,
  mutationObservers:runtime.signals?.mutationObserverCount??null,
  renderSubscriptions:runtime.signals?.renderSubscriptionCount??null,
  eventListeners:runtime.signals?.eventListenerCount??null,
  cssImportant:css.totalImportant??null,
  repeatedCssSelectors:css.repeatedSelectorCount??null,
  classificationCoverage:files.metrics?.classificationCoverage??null,
  ownershipRatio:audit.metrics?.ownershipRatio??null,
  testProtectionRatio:audit.metrics?.testProtectionRatio??null,
  contracts:audit.observed?.contracts??null,
  auditCompletenessScore:audit.metrics?.auditCompletenessScore??null
};

const checks=[];
for(const [metric,limit] of Object.entries(baseline.max||{})){
  const value=current[metric];
  checks.push({metric,kind:'max',limit,value,pass:Number.isFinite(value)&&value<=limit});
}
for(const [metric,limit] of Object.entries(baseline.min||{})){
  const value=current[metric];
  checks.push({metric,kind:'min',limit,value,pass:Number.isFinite(value)&&value+Number.EPSILON>=limit});
}
const failed=checks.filter(x=>!x.pass);
const report={schema:'que-ano-architecture-budget-result-v1.8.6',baseline:baseline.baseline,policy:baseline.policy,current,checks,pass:failed.length===0,failed};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','architecture-budget-v186.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(failed.length){console.error(`Architecture budget failed: ${failed.map(x=>`${x.metric}=${x.value} (${x.kind} ${x.limit})`).join(', ')}`);process.exitCode=1;}
