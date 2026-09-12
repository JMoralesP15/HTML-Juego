// Node.js 18+ · no installation required. Run: node tools/audit.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const c=vm.createContext({console,Date,Map,Set,Math,JSON,Intl,URL,document:{getElementById(){return null}},localStorage:{getItem(){return null},setItem(){}}});
for(const name of ['content','scheduler','calendar','editorial','storage'])vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),c,{filename:name+'.js'});
const run=code=>vm.runInContext(code,c,{timeout:30000});
const bank=run('auditQuestionBank()'),schedule=run('simulateSchedule(365)');
const questions=run('QUESTIONS'),missingAssets=questions.filter(q=>q.image&&!fs.existsSync(path.join(root,q.image))).map(q=>q.id);
const dateLeaks=questions.filter(q=>(q.title+' '+q.prompt).includes(String(q.year))).map(q=>q.id);
const calendar=run(`(()=>{generateDailyScheduleThrough(1095);let mismatches=0;for(const [key,row] of PUBLISHED_CALENDAR){const e=DAILY_SCHEDULE_CACHE.get(challengeNumber(parseDateKey(key))-1);if(!e||JSON.stringify(e.questions.map(q=>q.id))!==JSON.stringify(row.ids)||e.specialTheme!==row.specialTheme)mismatches++}return {days:PUBLISHED_CALENDAR.size,mismatches}})()`);
const report={bank,schedule,calendar,missingAssets,dateLeaks};
console.log(JSON.stringify(report,null,2));
if(bank.total!==300||Object.entries(bank.issues).some(([k,v])=>k!=='nearDuplicates'&&v.length)||missingAssets.length||dateLeaks.length||!schedule.allSpecialsValid||schedule.repeatsUnder30||calendar.mismatches||calendar.days!==1096)process.exitCode=1;
