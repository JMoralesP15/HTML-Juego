import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
const required=[
  'docs/audit/PROJECT_TRACEABILITY.md','docs/audit/RUNTIME_LAYER_AUDIT.md','docs/audit/CLAUDE_FINDINGS_VERIFICATION.md','docs/audit/TECH_DEBT_MAP.md','docs/contracts/CONTRACT_REGISTRY.md',
  'reports/project-traceability.json','reports/runtime-ownership.json','reports/global-collisions.json','reports/css-cascade-audit.json','reports/runtime-file-classification.json','reports/audit-baseline-v183.json',
  'tools/project-traceability-v183.mjs','tools/runtime-layer-audit-v183.mjs','tools/audit-completion-v183.mjs'
];
for(const file of required)assert.ok(fs.existsSync(path.join(root,file)),`missing required audit deliverable: ${file}`);

const trace=json('reports/project-traceability.json');
assert.equal(trace.metrics.traceabilityCoverage,1);assert.equal(trace.lineage.length,13);assert.ok(trace.lineage.every(x=>x.ancestorVerified));assert.equal(trace.mainToBaseCommitCount,218);
const cls=json('reports/runtime-file-classification.json');
assert.equal(cls.metrics.activeScripts,24);assert.equal(cls.metrics.activeStylesheets,5);assert.equal(cls.metrics.totalActiveFiles,29);assert.equal(cls.metrics.classificationCoverage,1);assert.ok(cls.files.every(x=>x.classification&&x.classification!=='UNKNOWN'));
const registry=text('docs/contracts/CONTRACT_REGISTRY.md');
const rows=registry.split('\n').filter(x=>/^\|\s*\d+\s*\|/.test(x)).map(x=>x.split('|').slice(1,-1).map(v=>v.trim()));
assert.equal(rows.length,18);assert.equal(rows.filter(x=>/^UNIQUE\b/.test(x[4]||'')).length,6);assert.equal(rows.filter(x=>(x[5]||'')==='DIRECT').length,14);
const baseline=json('reports/audit-baseline-v183.json');
assert.equal(Object.values(baseline.weights).reduce((a,b)=>a+b,0),1);assert.equal(baseline.metrics.auditCompletenessScore,100);assert.equal(baseline.metrics.ownershipNumerator,6);assert.equal(baseline.metrics.ownershipDenominator,18);assert.equal(baseline.metrics.testProtectionNumerator,14);assert.equal(baseline.metrics.testProtectionDenominator,18);
assert.ok((json('reports/runtime-ownership.json').requiresBrowser||[]).some(x=>x.id==='MEDIA_ASYNC_PRECEDENCE'));

const report=text('docs/audit/PROJECT_TRACEABILITY.md');
for(const section of ['TRACEABILITY','OBSERVED ARCHITECTURE','OWNERSHIP','GLOBAL COLLISIONS','CSS CASCADE','CONTRACTS','TECH DEBT','QA','CLAUDE FINDINGS','METRICS','AUDIT COMPLETENESS','UNRESOLVED / REQUIRES_BROWSER','OBSOLETE CANDIDATES','NEXT MIGRATION CANDIDATES'])assert.ok(report.includes(`## ${section}`),`missing report section ${section}`);

const base='aaf5bd146c572fee1c600c4c0764a0f82bf0548e';
let changed=[];try{changed=execFileSync('git',['diff','--name-only',`${base}...HEAD`],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean)}catch{}
if(changed.length){
  const allowed=file=>file==='package.json'||file==='.github/workflows/qa.yml'||file==='tests/audit-v183.test.mjs'||file.startsWith('docs/audit/')||file==='docs/contracts/CONTRACT_REGISTRY.md'||file.startsWith('reports/project-traceability')||['reports/runtime-ownership.json','reports/global-collisions.json','reports/css-cascade-audit.json','reports/runtime-file-classification.json','reports/audit-baseline-v183.json'].includes(file)||['tools/project-traceability-v183.mjs','tools/runtime-layer-audit-v183.mjs','tools/audit-completion-v183.mjs'].includes(file);
  const forbidden=changed.filter(x=>!allowed(x));assert.deepEqual(forbidden,[],`audit branch changed prohibited product files: ${forbidden.join(', ')}`);
  assert.equal(changed.some(x=>x.includes('spec.mjs-snapshots/')),false,'audit branch must not regenerate snapshots');
}
console.log('v1.8.3 audit outputs and invariants: OK');
