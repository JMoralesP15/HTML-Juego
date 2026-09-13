import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const trace=readJson('reports/project-traceability.json');
const files=readJson('reports/runtime-file-classification.json');
const globals=readJson('reports/global-collisions.json');
const css=readJson('reports/css-cascade-audit.json');
const runtime=readJson('reports/runtime-ownership.json');
const registry=read('docs/contracts/CONTRACT_REGISTRY.md');
const debt=read('docs/audit/TECH_DEBT_MAP.md');

const contractRows=registry.split('\n').filter(line=>/^\|\s*\d+\s*\|/.test(line)).map(line=>line.split('|').slice(1,-1).map(x=>x.trim()));
const contractCount=contractRows.length;
const uniqueOwners=contractRows.filter(cols=>/^UNIQUE\b/.test(cols[4]||'')).length;
const directTests=contractRows.filter(cols=>(cols[5]||'')==='DIRECT').length;
const mappedTests=contractRows.filter(cols=>['DIRECT','INDIRECT','NONE'].includes(cols[5]||'')).length;
const ownershipMapped=contractRows.filter(cols=>Boolean(cols[4])).length;
const debtComplete=['## P0','## P1','## P2','## OBSOLETE CANDIDATES','## NEXT MIGRATION CANDIDATES'].every(x=>debt.includes(x));
const cssGlobalComplete=Boolean(css.schema&&globals.schema&&runtime.schema);

const components={
  traceability:Number(trace.metrics?.traceabilityCoverage)||0,
  fileClassification:Number(files.metrics?.classificationCoverage)||0,
  runtimeOwnership:contractCount?ownershipMapped/contractCount:0,
  contracts:Math.min(1,contractCount/18),
  techDebt:debtComplete?1:0,
  cssGlobalAnalysis:cssGlobalComplete?1:0,
  testMapping:contractCount?mappedTests/contractCount:0
};
const weights={traceability:.20,fileClassification:.20,runtimeOwnership:.20,contracts:.15,techDebt:.10,cssGlobalAnalysis:.10,testMapping:.05};
const score=Object.entries(weights).reduce((sum,[key,w])=>sum+(components[key]||0)*w,0)*100;
const baseline={
  schema:'que-ano-audit-baseline-v1.8.3',auditDate:'2026-09-13',
  weights,components,
  metrics:{
    traceabilityCoverage:components.traceability,
    runtimeFileClassificationCoverage:components.fileClassification,
    contractCoverage:components.contracts,
    ownershipRatio:contractCount?uniqueOwners/contractCount:0,
    ownershipNumerator:uniqueOwners,ownershipDenominator:contractCount,
    testProtectionRatio:contractCount?directTests/contractCount:0,
    testProtectionNumerator:directTests,testProtectionDenominator:contractCount,
    auditCompletenessScore:Number(score.toFixed(2))
  },
  observed:{activeScripts:files.metrics?.activeScripts,activeStylesheets:files.metrics?.activeStylesheets,contracts:contractCount,staticCollisionCount:Array.isArray(globals.collisions)?globals.collisions.length:null},
  unresolved:[...(runtime.requiresBrowser||[])],
  interpretation:'Completeness measures audit coverage, not architecture quality. Explicit UNKNOWN or REQUIRES_BROWSER states count as complete when evidence limits are documented.'
};
fs.writeFileSync(path.join(root,'reports','audit-baseline-v183.json'),JSON.stringify(baseline,null,2)+'\n');
console.log(JSON.stringify(baseline.metrics,null,2));
