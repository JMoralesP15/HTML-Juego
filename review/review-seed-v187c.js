/* v1.8.7-c — seed only missing local records; never overwrite a locally reviewed record. */
(function(){
'use strict';
const KEY='que-ano-editorial-review-v18',seed=window.__QA_EDITORIAL_FEEDBACK_V187C__;if(!seed)return;
let store;try{store=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}if(!store?.records)store={version:'1.8.7-c',updatedAt:null,migrations:{},records:{}};
if(store.migrations?.v187cHumanFeedbackSeed)return;
const touched=new Set();
const ensure=id=>{if(store.records[id]?.updatedAt)return null;const r=store.records[id]||{factualStatus:'pending',textStatus:'pending',mediaStatus:'pending',mediaChoice:'pending',replacementChoice:null,note:'',edits:{},updatedAt:null};store.records[id]=r;touched.add(id);return r};
for(const [status,ids] of Object.entries(seed.factual||{}))for(const id of ids){const r=ensure(id);if(r)r.factualStatus=status}
for(const [status,ids] of Object.entries(seed.text||{}))for(const id of ids){const r=ensure(id);if(r)r.textStatus=status}
for(const [status,ids] of Object.entries(seed.media||{}))for(const id of ids){const r=ensure(id);if(r){r.mediaStatus=status;if(status==='approved'&&r.mediaChoice==='pending')r.mediaChoice='current'}}
for(const [id,note] of Object.entries(seed.notes||{})){const r=ensure(id);if(r&&!r.note)r.note=note}
for(const id of touched){const r=store.records[id];r.updatedAt=seed.sourceExportedAt||new Date().toISOString();r.seededFromHumanExport=true}
store.migrations={...(store.migrations||{}),v187cHumanFeedbackSeed:true};store.version='1.8.7-c';store.updatedAt=new Date().toISOString();
try{localStorage.setItem(KEY,JSON.stringify(store))}catch{}
})();
