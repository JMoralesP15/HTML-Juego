/* STORAGE — schema 5. Daily, practice and ordering have separate histories. */
const IS_HUMAN_TESTER=typeof HUMAN_TESTER_ACTIVE!=='undefined'?HUMAN_TESTER_ACTIVE:Boolean(typeof window!=='undefined'&&window.location&&document.documentElement?.dataset.editorialEdition==='human'&&new URLSearchParams(window.location.search).get('edition')!=='full');
if(IS_HUMAN_TESTER&&(typeof HUMAN_TESTER_RELEASE==='undefined'||QUESTIONS.length<10||QUESTIONS.some(q=>!q.humanApproved))){
  QUESTIONS.splice(0,QUESTIONS.length);QUESTION_BY_ID.clear();
  const loading=document.getElementById('view');if(loading)loading.textContent='No se pudo cargar la edición revisada. Recarga la página para volver a intentar.';
  throw new Error('Human tester release unavailable; unreviewed bank blocked');
}
const STORE_KEY=IS_HUMAN_TESTER?'que_ano_tester_'+HUMAN_TESTER_RELEASE.id:'que_ano_state_v10', SCHEMA_VERSION=5;
const LEGACY_KEYS=IS_HUMAN_TESTER?[]:['que_ano_state_v093','que_ano_state_v092','que_ano_state_v08','que_ano_state','que_ano_v04_state'];
const GLOBAL_MIN_YEAR=1950, GLOBAL_MAX_YEAR=Math.max(2026,new Date().getFullYear());
const DIFFICULTY_LABELS={facil:'Fácil',media:'Media',dificil:'Difícil'};
const CATEGORY_COLORS={'Tecnología':'#7acff2','Cine':'#c3b2f2','Música':'#eeb0d4','Videojuegos':'#bcda8e','Cultura':'#efbc87','Ciencia':'#89d6c2','Chile':'#eeaaa4','Historia':'#f4d18b'};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(n,fallback=0)=>Number.isFinite(Number(n))?Number(n):fallback;
const clone=o=>JSON.parse(JSON.stringify(o));
const mean=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:null;
const fmt=(n,d=1)=>Number.isFinite(n)?n.toLocaleString('es-CL',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
const validKey=k=>typeof k==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(k)&&dateKey(parseDateKey(k))===k;
function safeURL(url){try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function safeAsset(url){return typeof url==='string'&&/^assets\/[a-zA-Z0-9_/-]+\.(webp|jpg|jpeg|png)$/.test(url)&&!url.includes('..')?url:''}
function defaultTimelineStats(){return {rounds:0,perfect:0,positions:0,elements:0,currentStreak:0,bestStreak:0,decades:{}}}
function defaultState(){return {schemaVersion:SCHEMA_VERSION,sessions:[],reviewSessions:[],practiceSessions:[],bestStreak:0,achievements:[],questionStats:{},timeline:defaultTimelineStats(),timelineDraft:null,activeSession:null,practiceDraft:null,editorOverrides:{},reviewedIds:[],onboardingSeen:false,dailyIntroDate:'',preferences:{sound:false,volume:.25,motion:'system',palette:'amber'},recoveryIds:[],longTermIds:[]}}
function normalizeAnswer(a){
  if(!a||!QUESTION_BY_ID.has(a.id))return null;
  if(IS_HUMAN_TESTER&&a.actual!=null&&a.actual!==QUESTION_BY_ID.get(a.id).year)return null;
  const q=QUESTION_BY_ID.get(a.id),actual=Number.isInteger(a.actual)?a.actual:q.year;
  if(actual<GLOBAL_MIN_YEAR||actual>GLOBAL_MAX_YEAR)return null;
  const skipped=Boolean(a.skipped),guess=skipped?null:Number(a.guess);
  if(!skipped&&(!Number.isInteger(guess)||guess<GLOBAL_MIN_YEAR||guess>GLOBAL_MAX_YEAR))return null;
  const error=skipped?null:Math.abs(guess-actual);
  return {id:q.id,title:typeof a.title==='string'?a.title:q.title,category:q.category,actual,guess,error,points:skipped?0:points(error),skipped,assisted:Boolean(a.assisted),memorySaved:Boolean(a.memorySaved),date:validKey(a.date)?a.date:null};
}
function sessionFromAnswers(date,answers,mode='daily',extra={}){const errors=answers.filter(a=>!a.skipped).map(a=>a.error);return {...extra,date,mode,answers,avg:mean(errors),total:answers.reduce((s,a)=>s+a.points,0),exact:answers.filter(a=>!a.skipped&&a.error===0).length,omitted:answers.filter(a=>a.skipped).length,challenge:challengeNumber(parseDateKey(date)),contentVersion:extra.contentVersion||CONTENT_VERSION,scheduleVersion:extra.scheduleVersion||SCHEDULE_VERSION}}
function sanitizeSessions(rows,mode){if(!Array.isArray(rows))return [];const seenDates=new Set();return rows.slice(-6000).map(s=>{if(!s||!validKey(s.date)||!Array.isArray(s.answers))return null;const ans=s.answers.map(normalizeAnswer);if(!ans.length||ans.some(a=>!a)||new Set(ans.map(a=>a.id)).size!==ans.length)return null;if(mode==='daily'&&(seenDates.has(s.date)||ans.length!==5))return null;seenDates.add(s.date);return sessionFromAnswers(s.date,ans,mode,{uid:typeof s.uid==='string'?s.uid:`legacy-${mode}-${s.date}`,newDiscoveries:Math.max(0,num(s.newDiscoveries)),contentVersion:s.contentVersion||3,scheduleVersion:s.scheduleVersion||2})}).filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date))}
function sanitizeDraft(d){if(!d||!validKey(d.date)||!Array.isArray(d.questionIds)||!d.questionIds.length||d.questionIds.length>10)return null;const ids=d.questionIds.filter(id=>QUESTION_BY_ID.has(id));if(ids.length!==d.questionIds.length||new Set(ids).size!==ids.length)return null;const ans=(Array.isArray(d.answers)?d.answers:[]).map(normalizeAnswer);if(ans.some((a,i)=>!a||a.id!==ids[i]))return null;const phase=['question','answer'].includes(d.phase)?d.phase:'question';const index=phase==='answer'?Math.max(0,ans.length-1):ans.length;return {uid:typeof d.uid==='string'?d.uid:`legacy-${d.date}`,date:d.date,mode:d.mode==='daily'?'daily':d.mode==='review'?'review':'practice',questionIds:ids,index,phase,answers:ans,guess:Math.max(GLOBAL_MIN_YEAR,Math.min(GLOBAL_MAX_YEAR,num(d.guess,1990))),assisted:Boolean(d.assisted),contentVersion:3,scheduleVersion:2,newDiscoveries:Math.max(0,num(d.newDiscoveries)),newAchievements:Array.isArray(d.newAchievements)?d.newAchievements:[]}}
function migrateState(input){
  const raw=input?.state||input;if(!raw||typeof raw!=='object')return defaultState();
  const s=defaultState();s.sessions=sanitizeSessions(raw.sessions,'daily');s.reviewSessions=sanitizeSessions(raw.reviewSessions,'review');s.practiceSessions=sanitizeSessions(raw.practiceSessions,'practice');
  for(const [id,v] of Object.entries(raw.questionStats||{})){
    if(!QUESTION_BY_ID.has(id)||!v||typeof v!=='object')continue;
    const attempts=Math.max(0,num(v.attempts)),scoredAttempts=Math.max(0,num(v.scoredAttempts,attempts)),totalError=Math.max(0,num(v.totalError,num(v.avgError)*scoredAttempts));
    s.questionStats[id]={...v,attempts,scoredAttempts,totalError,avgError:scoredAttempts?totalError/scoredAttempts:null,bestError:v.bestError==null?null:Math.max(0,num(v.bestError)),lastError:v.lastError==null?null:Math.max(0,num(v.lastError)),intervalDays:Math.max(1,Math.min(120,num(v.intervalDays,1))),dueDay:v.dueDay==null?null:num(v.dueDay),lastReviewedDate:validKey(v.lastReviewedDate)?v.lastReviewedDate:null,successDates:Array.isArray(v.successDates)?[...new Set(v.successDates.filter(validKey))]:[],lastSkipped:Boolean(v.lastSkipped)};
  }
  // Rebuild only missing memory from chronological evidence; existing totals stay intact.
  const existingMemory=new Set(Object.keys(s.questionStats));
  for(const run of [...s.sessions,...s.reviewSessions,...s.practiceSessions].sort((a,b)=>a.date.localeCompare(b.date)))for(const a of run.answers){
    if(!existingMemory.has(a.id))recordAnswer(s,{...a,memorySaved:false},a.date||run.date);
    const st=s.questionStats[a.id];
    if(!a.skipped&&a.error<=2&&!st.successDates.includes(a.date||run.date)&&!a.assisted)st.successDates.push(a.date||run.date);
  }
  s.bestStreak=Math.max(0,num(raw.bestStreak));s.achievements=Array.isArray(raw.achievements)?raw.achievements.filter(x=>typeof x==='string'):[];
  const t=raw.timeline||{};for(const k of ['rounds','perfect','positions','elements','currentStreak','bestStreak'])s.timeline[k]=Math.max(0,num(t[k]));
  for(const [d,v] of Object.entries(t.decades||{})){if(/^\d{4}$/.test(d)&&v&&typeof v==='object')s.timeline.decades[d]={count:Math.max(0,num(v.count??v.n)),error:Math.max(0,num(v.error??v.totalError)),correct:Math.max(0,num(v.correct)),legacyElements:Math.max(0,num(v.legacyElements??v.elements)),legacyPositionError:Math.max(0,num(v.legacyPositionError??v.positionError))};}
  s.activeSession=sanitizeDraft(raw.activeSession);s.practiceDraft=sanitizeDraft(raw.practiceDraft);
  if(raw.timelineDraft&&Array.isArray(raw.timelineDraft.ids)&&raw.timelineDraft.ids.length===4&&new Set(raw.timelineDraft.ids).size===4&&raw.timelineDraft.ids.every(id=>QUESTION_BY_ID.has(id))){s.timelineDraft={ids:raw.timelineDraft.ids,answered:Boolean(raw.timelineDraft.answered),results:Array.isArray(raw.timelineDraft.results)?raw.timelineDraft.results:[]};}
  const allowed=['title','prompt','fact','context','significance','source','sourceLabel'];
  for(const [id,v] of Object.entries(raw.editorOverrides||{})){if(!QUESTION_BY_ID.has(id)||!v||typeof v!=='object')continue;s.editorOverrides[id]={};for(const k of allowed)if(typeof v[k]==='string'&&v[k].length<=4000)s.editorOverrides[id][k]=k==='source'?safeURL(v[k]):v[k];}
  s.reviewedIds=Array.isArray(raw.reviewedIds)?raw.reviewedIds.filter(id=>QUESTION_BY_ID.has(id)):[];
  s.onboardingSeen=Boolean(raw.onboardingSeen);s.dailyIntroDate=validKey(raw.dailyIntroDate)?raw.dailyIntroDate:'';
  const p=raw.preferences||{};s.preferences={sound:Boolean(p.sound),volume:Math.max(0,Math.min(1,num(p.volume,.25))),motion:p.motion==='reduced'?'reduced':'system',palette:['amber','ocean','violet'].includes(p.palette)?p.palette:'amber'};
  s.recoveryIds=Array.isArray(raw.recoveryIds)?raw.recoveryIds.filter(id=>QUESTION_BY_ID.has(id)):[];s.longTermIds=Array.isArray(raw.longTermIds)?raw.longTermIds.filter(id=>QUESTION_BY_ID.has(id)):[];
  return s;
}
let stateCache=null,storageOkay=true;
function getState(){if(stateCache)return stateCache;try{for(const key of [STORE_KEY,...LEGACY_KEYS]){const data=localStorage.getItem(key);if(data){stateCache=migrateState(JSON.parse(data));if(key!==STORE_KEY)setState(stateCache);return stateCache}}}catch{storageOkay=false}return stateCache=defaultState()}
function setState(s){stateCache=s;s.schemaVersion=SCHEMA_VERSION;try{localStorage.setItem(STORE_KEY,JSON.stringify(s));storageOkay=true}catch{storageOkay=false}if($('storageWarning'))$('storageWarning').hidden=storageOkay;return s}
function points(error){return Math.max(1,Math.round(1000*Math.exp(-error/14)))}
function recordAnswer(s,a,when){
  if(a.memorySaved)return;
  const today=dayNumber(parseDateKey(when)),old=s.questionStats[a.id]||{attempts:0,scoredAttempts:0,totalError:0,avgError:null,bestError:null,lastError:null,intervalDays:1,dueDay:null,lastReviewedDate:null,successDates:[]};
  const previousDay=old.lastReviewedDate,previousError=old.lastError,interval=old.intervalDays||1;
  old.attempts++;old.successDates=old.successDates||[];
  if(a.skipped){old.lastSkipped=true;old.lastError=null;old.intervalDays=1;old.dueDay=today+1;old.lastReviewedDate=when;}
  else{
    old.scoredAttempts=(old.scoredAttempts||0)+1;old.totalError=(old.totalError||0)+a.error;old.avgError=old.totalError/old.scoredAttempts;old.bestError=old.bestError==null?a.error:Math.min(old.bestError,a.error);old.lastError=a.error;old.lastSkipped=false;
    if(a.error<=2&&!a.assisted){
      if(!old.successDates.includes(when))old.successDates.push(when);
      if(previousDay&&previousDay!==when&&previousError>10&&!s.recoveryIds.includes(a.id))s.recoveryIds.push(a.id);
      if(previousDay&&today-dayNumber(parseDateKey(previousDay))>=7&&!s.longTermIds.includes(a.id))s.longTermIds.push(a.id);
    }
    if(previousDay!==when){const e=a.assisted?Math.max(11,a.error):a.error;old.intervalDays=Math.min(120,Math.max(1,Math.round(e===0?interval*2.4:e<=5?interval*1.6:e<=10?Math.max(2,interval*1.15):e<=20?2:1)));old.dueDay=today+old.intervalDays;old.lastReviewedDate=when;}
  }
  old.lastSeenDay=today;s.questionStats[a.id]=old;a.memorySaved=true;a.date=when;
}
function discoveredIds(s=getState()){return new Set([...Object.keys(s.questionStats).filter(id=>(s.questionStats[id].attempts||0)>0),...s.sessions.flatMap(x=>x.answers.map(a=>a.id)),...s.reviewSessions.flatMap(x=>x.answers.map(a=>a.id)),...s.practiceSessions.flatMap(x=>x.answers.map(a=>a.id))])}
function mastery(st){if(!st||!st.attempts)return {key:'new',label:'No descubierta'};const dates=[...new Set(st.successDates||[])].sort();if(dates.length>=3&&dayNumber(parseDateKey(dates.at(-1)))-dayNumber(parseDateKey(dates[0]))>=7&&!st.lastSkipped&&st.lastError<=2)return {key:'mastered',label:'Consolidada'};if(st.attempts===1)return {key:'seen',label:'Descubierta'};return {key:'learning',label:'En aprendizaje'}}
function calcStreak(sessions){const dates=[...new Set(sessions.map(s=>s.date))].sort().reverse();if(!dates.length)return 0;const today=dateKey(),yesterday=dateKey(addDays(new Date(),-1));if(dates[0]!==today&&dates[0]!==yesterday)return 0;let streak=1;for(let i=1;i<dates.length;i++){if(dayNumber(parseDateKey(dates[i-1]))-dayNumber(parseDateKey(dates[i]))!==1)break;streak++}return streak}
function recentActivity(s=getState()){const today=dayNumber();return new Set(s.sessions.filter(x=>today-dayNumber(parseDateKey(x.date))>=0&&today-dayNumber(parseDateKey(x.date))<7).map(x=>x.date)).size}
function eligibleReviews(s=getState()){const reserved=reservedUpcomingIds(7),today=dayNumber();return Object.entries(s.questionStats).filter(([id,st])=>QUESTION_BY_ID.has(id)&&st.attempts>0&&!reserved.has(id)).map(([id,st])=>({q:QUESTION_BY_ID.get(id),stat:st,dueIn:(st.dueDay??today)-today,score:Math.max(0,today-(st.dueDay??today))*3+(st.avgError||0)+(st.lastError||0)*1.5+(st.lastSkipped?60:0)})).sort((a,b)=>b.score-a.score)}
function weakestCategory(s=getState()){const by={};for(const [id,v] of Object.entries(s.questionStats)){const q=QUESTION_BY_ID.get(id);if(q&&v.scoredAttempts>0)(by[q.category]||=[]).push(v.avgError)}return Object.entries(by).filter(([,v])=>v.length>=3).sort((a,b)=>mean(b[1])-mean(a[1]))[0]?.[0]||null}
function practiceQuestions(category='Todas',mode='all',count=5,explicitIds=null){
  const s=getState(),reserved=reservedUpcomingIds(7),seen=discoveredIds(s),limit=[3,5,10].includes(Number(count))?Number(count):5;
  let pool=QUESTIONS.filter(q=>!reserved.has(q.id)&&(category==='Todas'||q.category===category));
  if(explicitIds){pool=explicitIds.map(id=>QUESTION_BY_ID.get(id)).filter(Boolean);return [...new Map(pool.map(q=>[q.id,q])).values()].slice(0,limit)}
  if(mode==='due')return eligibleReviews(s).filter(x=>x.dueIn<=0&&(category==='Todas'||x.q.category===category)).slice(0,limit).map(x=>x.q);
  if(mode==='unseen')pool=pool.filter(q=>!seen.has(q.id));
  if(mode==='failed')pool=pool.filter(q=>(s.questionStats[q.id]?.lastError??0)>5||s.questionStats[q.id]?.lastSkipped);
  if(mode==='weakest'){const weak=weakestCategory(s);pool=weak?pool.filter(q=>q.category===weak):[]}
  if(mode==='reinforce')return pool.filter(q=>seen.has(q.id)).sort((a,b)=>(s.questionStats[b.id]?.avgError||0)-(s.questionStats[a.id]?.avgError||0)).slice(0,limit);
  return shuffled(pool,hashString(`${Date.now()}|${Math.random()}|${category}|${mode}`)).slice(0,limit);
}
const ACHIEVEMENTS=[
 {id:'first',title:'Primera coordenada',desc:'Completa tu primer desafío diario.',goal:1,value:s=>s.sessions.length},
 {id:'streak7',title:'Una semana en el tiempo',desc:'Alcanza una racha diaria de siete días.',goal:7,value:s=>Math.max(s.bestStreak,calcStreak(s.sessions))},
 {id:'tenexact',title:'Cirujano temporal',desc:'Consigue diez respuestas diarias exactas.',goal:10,value:s=>s.sessions.flatMap(x=>x.answers).filter(a=>!a.skipped&&a.error===0).length},
 {id:'hundred',title:'Archivo mental',desc:'Responde cien preguntas del desafío diario.',goal:100,value:s=>s.sessions.flatMap(x=>x.answers).filter(a=>!a.skipped).length},
 {id:'allcats',title:'Generalista',desc:'Descubre al menos un hito de cada categoría.',goal:8,value:s=>new Set([...discoveredIds(s)].map(id=>QUESTION_BY_ID.get(id)?.category).filter(Boolean)).size},
 {id:'perfecttimeline',title:'Buen orden',desc:'Completa una ronda perfecta en Línea temporal.',goal:1,value:s=>s.timeline.perfect},
 {id:'recovery',title:'Segunda oportunidad',desc:'Recuerda en otro día tres fechas antes falladas por más de diez años; margen máximo: dos años.',goal:3,value:s=>s.recoveryIds.length},
 {id:'longterm',title:'Memoria a largo plazo',desc:'Recuerda cinco fechas con un margen de dos años tras al menos siete días sin repasarlas.',goal:5,value:s=>s.longTermIds.length},
 {id:'regions',title:'Sin fronteras',desc:'Descubre hitos de diez regiones del archivo.',goal:10,value:s=>new Set([...discoveredIds(s)].map(id=>QUESTION_BY_ID.get(id)?.region).filter(Boolean)).size},
 {id:'decades',title:'A través de las décadas',desc:'Consolida al menos una fecha de cuatro décadas.',goal:4,value:s=>new Set(Object.entries(s.questionStats).filter(([,v])=>mastery(v).key==='mastered').map(([id])=>decadeOf(QUESTION_BY_ID.get(id).year))).size},
 {id:'flexible',title:'Constancia flexible',desc:'Completa cuatro desafíos diarios dentro de cualquier intervalo de siete días.',goal:4,value:s=>{const days=s.sessions.map(x=>dayNumber(parseDateKey(x.date)));return Math.max(0,...days.map(d=>new Set(days.filter(x=>x>=d&&x<d+7)).size))}}
];
function updateAchievements(s){const added=[];for(const a of ACHIEVEMENTS)if(!s.achievements.includes(a.id)&&a.value(s)>=a.goal){s.achievements.push(a.id);added.push(a.id)}return added}
function availablePalettes(s=getState()){return ['amber',...(s.achievements.includes('first')?['ocean']:[]),...(s.achievements.includes('allcats')?['violet']:[])]}
function displayQuestion(id){const q=QUESTION_BY_ID.get(id);return q?{...q,...(IS_HUMAN_TESTER?{}:getState().editorOverrides[id]||{})}:null}
function auditQuestionBank(){const issues={duplicateIds:[],yearRange:[],emptyKind:[],missingSource:[],missingImageAlt:[],invalidDifficulty:[],emptySubcategory:[],nearDuplicates:[],missingScheduleIds:[]},seen=new Set();for(const q of QUESTIONS){if(seen.has(q.id))issues.duplicateIds.push(q.id);seen.add(q.id);if(!Number.isInteger(q.year)||q.year<1950||q.year>GLOBAL_MAX_YEAR)issues.yearRange.push(q.id);if(!q.kind)issues.emptyKind.push(q.id);if(!safeURL(q.source)||!q.sourceLabel)issues.missingSource.push(q.id);if(q.image&&!q.imageAlt)issues.missingImageAlt.push(q.id);if(!DIFFICULTY_LABELS[q.difficulty])issues.invalidDifficulty.push(q.id);if(!q.subcategory)issues.emptySubcategory.push(q.id)}for(const q of SCHEDULE_BANK)if(!seen.has(q.id))issues.missingScheduleIds.push(q.id);const words=s=>new Set(s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/[^a-z0-9]+/).filter(Boolean));for(let i=0;i<QUESTIONS.length;i++)for(let j=i+1;j<QUESTIONS.length;j++){const a=words(QUESTIONS[i].title),b=words(QUESTIONS[j].title),common=[...a].filter(w=>b.has(w)).length;if(common/new Set([...a,...b]).size>.84)issues.nearDuplicates.push([QUESTIONS[i].id,QUESTIONS[j].id])}const countBy=k=>QUESTIONS.reduce((r,q)=>(r[q[k]]=(r[q[k]]||0)+1,r),{});return {total:QUESTIONS.length,versions:{content:CONTENT_VERSION,schedule:SCHEDULE_VERSION,schema:SCHEMA_VERSION},issues,warnings:{genericSources:QUESTIONS.filter(q=>!q.editorialVerified).map(q=>q.id)},category:countBy('category'),difficulty:countBy('difficulty'),region:countBy('region'),images:QUESTIONS.filter(q=>q.image).length,extendedContext:QUESTIONS.filter(q=>q.context).length}}
function simulateSchedule(days=365){generateDailyScheduleThrough(days-1);const seen=new Map(),gaps=[],specials=[];for(let n=0;n<days;n++){const e=DAILY_SCHEDULE_CACHE.get(n);for(const q of e.questions){if(seen.has(q.id))gaps.push(n-seen.get(q.id));seen.set(q.id,n)}if(e.specialTheme)specials.push({date:dateKey(addDays(new Date(2026,0,1),n)),theme:e.specialTheme,match:e.questions.filter(q=>q.themes.includes(e.specialTheme)).length})}return {days,minGap:Math.min(...gaps),repeatsUnder30:gaps.filter(n=>n<30).length,allSpecialsValid:specials.every(s=>s.match>=4),specials}}

