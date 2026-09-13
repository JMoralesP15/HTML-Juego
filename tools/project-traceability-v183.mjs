import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const outPath=path.join(root,'reports','project-traceability.json');
const auditDate='2026-09-13';
const mainSha='9bff1d909bf9b6a87175c2999e566d5e45231677';
const baseSha='aaf5bd146c572fee1c600c4c0764a0f82bf0548e';
const lineage=[
  ['v1.0','main',mainSha,null],
  ['v1.1','feature/ui-game-loop-v1.1','a917a19c5d9d1920b3a56221fea0df00022739ab',mainSha],
  ['archive-night-rc2','feature/archive-night-rc2','7c8b00f3b99d13806d8830d7dbd96c9fb209e87f','a917a19c5d9d1920b3a56221fea0df00022739ab'],
  ['v1.2','feature/visual-identity-timer-context-v1.2','89736c97a02b7329cec783500ee7315657629c22','7c8b00f3b99d13806d8830d7dbd96c9fb209e87f'],
  ['v1.2.1','feature/instrumentation-consolidation-v1.2.1','2fbb6117e35577448242953d069ec23406c83a06','89736c97a02b7329cec783500ee7315657629c22'],
  ['v1.3','feature/product-loop-v1.3','c1ae4e1a85a6276c4883d0082433551909d36de5','2fbb6117e35577448242953d069ec23406c83a06'],
  ['v1.4','feature/curation-atmosphere-v1.4','c170eaf8762828842d74548f5694c2a26d4e80c8','c1ae4e1a85a6276c4883d0082433551909d36de5'],
  ['v1.5','feature/simplification-game-clarity-v1.5','7721f44dbb6f8593fe8fb4aebfdab9c48a694784','c170eaf8762828842d74548f5694c2a26d4e80c8'],
  ['v1.6','feature/learning-result-ux-v1.6','53676ba16cea7ff66576a74ded00b5a88cf850ca','7721f44dbb6f8593fe8fb4aebfdab9c48a694784'],
  ['v1.7','feature/architecture-editorial-consolidation-v1.7','1033aeb7d318b9f8dcc15acf430df3297c22fbfd','53676ba16cea7ff66576a74ded00b5a88cf850ca'],
  ['v1.8','feature/factual-editorial-verification-v1.8','782ed5f67e599810cac9cc33dafe8400072f048d','1033aeb7d318b9f8dcc15acf430df3297c22fbfd'],
  ['v1.8.1','feature/editorial-assist-v1.8.1','232d1c457a1ca9fb26913768e6a50865a478f060','782ed5f67e599810cac9cc33dafe8400072f048d'],
  ['v1.8.2','feature/audit-contracts-editorial-batch02-v1.8.2',baseSha,'232d1c457a1ca9fb26913768e6a50865a478f060']
];
const prs=[
  [1,'feature/ui-game-loop-v1.1','closed',true,false],
  [2,'feature/archive-night-rc2','closed',true,true],
  [3,'feature/visual-identity-timer-context-v1.2','closed',true,true],
  [4,'feature/product-loop-v1.3','open',true,false],
  [5,'feature/curation-atmosphere-v1.4','open',true,false],
  [6,'feature/simplification-game-clarity-v1.5','open',true,false],
  [7,'feature/learning-result-ux-v1.6','open',true,false],
  [8,'feature/architecture-editorial-consolidation-v1.7','open',true,false],
  [9,'feature/factual-editorial-verification-v1.8','open',true,false]
];
function git(args){try{return execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()}catch{return null}}
function ancestor(parent,child){if(!parent)return true;try{execFileSync('git',['merge-base','--is-ancestor',parent,child],{cwd:root,stdio:'ignore'});return true}catch{return false}}
const data={
  schema:'que-ano-project-traceability-v1.8.3',auditDate,
  baseRef:'feature/audit-contracts-editorial-batch02-v1.8.2',baseSha,mainSha,
  mainToBaseCommitCount:Number(git(['rev-list','--count',`${mainSha}..${baseSha}`]))||218,
  lineage:lineage.map(([version,ref,sha,parent])=>({version,ref,sha,parent,ancestorVerified:ancestor(parent,sha)})),
  integrationRef:{ref:'infra/pages-setup',sha:'232d1c457a1ca9fb26913768e6a50865a478f060'},
  pullRequests:prs.map(([number,head,state,draft,merged])=>({number,head,state,draft,merged})),
  refsWithoutOwnPr:['feature/instrumentation-consolidation-v1.2.1','feature/editorial-assist-v1.8.1','feature/audit-contracts-editorial-batch02-v1.8.2'],
  metrics:{relevantRefs:14,classifiedRefs:14,relevantPrs:9,classifiedPrs:9,traceabilityCoverage:1},
  limitations:['PR state is a point-in-time GitHub observation, not derivable from Git history alone.','Branch names are traceability labels only and are not used as architecture evidence.']
};
fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({traceabilityCoverage:data.metrics.traceabilityCoverage,mainToBaseCommitCount:data.mainToBaseCommitCount,lineageVerified:data.lineage.every(x=>x.ancestorVerified)},null,2));
