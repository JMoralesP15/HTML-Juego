import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sources=['js/game.js','js/archive-night.js','js/atlas-v12.js'];
const symbols=['renderGame','renderSummary','summarySignature','temporalScale'];
const owners={};
for(const symbol of symbols){
  owners[symbol]=sources.filter(rel=>{
    const text=fs.readFileSync(path.join(root,rel),'utf8');
    return new RegExp(`\\bfunction\\s+${symbol}\\s*\\(`).test(text)||new RegExp(`\\b${symbol}\\s*=\\s*function\\b`).test(text);
  });
}
const failures=[];
for(const symbol of symbols){
  const found=owners[symbol];
  if(found.length!==1||found[0]!=='js/atlas-v12.js')failures.push(`${symbol}: ${found.join(', ')||'no owner'}`);
}
const archive=fs.readFileSync(path.join(root,'js/archive-night.js'),'utf8');
for(const helper of ['archiveNumber','archiveProgress','archiveRhythmLabel']){
  if(!new RegExp(`\\bfunction\\s+${helper}\\s*\\(`).test(archive))failures.push(`missing required Archive helper ${helper}`);
}
const report={schema:'que-ano-renderer-ownership-v1.8.6',canonicalOwner:'js/atlas-v12.js',owners,archiveHelpersPreserved:['archiveNumber','archiveProgress','archiveRhythmLabel'],pass:failures.length===0,failures};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','renderer-ownership-v186.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(failures.length)process.exitCode=1;
