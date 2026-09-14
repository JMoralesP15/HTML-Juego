import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
function boot(search=''){
  const {document,window}=parseHTML(html),store=new Map();
  const context=vm.createContext({document,window,console,location:{search,hash:''},URL,URLSearchParams,Date,Map,Set,Math,JSON,Intl,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}});
  for(const name of ['content','scheduler','calendar','editorial','editorial-verification-v18','editorial-v18-manual','content-v12','curation-v14','storage','game'])vm.runInContext(fs.readFileSync(new URL(`../js/${name}.js`,import.meta.url),'utf8'),context,{filename:name});
  return code=>vm.runInContext(code,context);
}
const run=boot(),full=boot('?edition=full');
assert.equal(run('QUESTIONS.length'),62);assert.equal(full('QUESTIONS.length'),300);
assert.equal(run('QUESTION_BY_ID.has("apollo11")'),false);
assert.equal(run('QUESTIONS.every(q=>q.humanApproved&&q.approvedLearning.summary&&q.v18Media.src)'),true);
assert.notEqual(run('STORE_KEY'),full('STORE_KEY'));assert.equal(run('LEGACY_KEYS.length'),0);
assert.equal(run('sanitizeDraft({date:"2026-09-14",questionIds:["apollo11"]})'),null);
assert.equal(run('migrateState({timelineDraft:{ids:["walkman","apollo11","dna","rubik"]}}).timelineDraft'),null);
assert.equal(run('migrateState({questionStats:{apollo11:{attempts:1}}}).questionStats.apollo11'),undefined);
run('const originalText=displayQuestion("walkman").context;getState().editorOverrides.walkman={context:"unapproved"}');
assert.equal(run('displayQuestion("walkman").context===originalText'),true);
for(let d=1;d<=28;d++){
  const key=`2026-09-${String(d).padStart(2,'0')}`;
  assert.equal(run(`dailyQuestions('${key}').length`),5);
  assert.equal(run(`new Set(dailyQuestions('${key}').map(q=>q.id)).size`),5);
  assert.equal(run(`dailyQuestions('${key}').every(q=>q.humanApproved)`),true);
}
assert.equal(run('practiceQuestions("all",10).every(q=>q.humanApproved)'),true);
assert.equal(run('QUESTIONS.filter(q=>!reservedUpcomingIds().has(q.id)).length'),57);
const release=JSON.parse(fs.readFileSync(new URL('../reports/human-tester-release.json',import.meta.url)));
assert.equal(run('QUESTION_BY_ID.get("usb").year'),release.items.find(q=>q.id==='usb').year);
assert.equal(run('QUESTION_BY_ID.get("usb").title'),release.items.find(q=>q.id==='usb').title);
console.log('Human tester contracts passed (62 approved; 300 preserved; schedule, overrides, import, replacement).');

