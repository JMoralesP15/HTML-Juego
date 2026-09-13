import {test,expect} from '@playwright/test';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url=pathToFileURL(path.join(root,'index.html')).href+'#main';

async function boot(page){
  await page.addInitScript(()=>{window.__QUE_ANO_DISABLE_ANALYTICS__=true});
  await page.setViewportSize({width:1280,height:800});
  await page.goto(url);
  await page.waitForFunction(()=>typeof renderGame==='function'&&typeof __QA_TIMER__==='object'&&typeof __QYA_RUNTIME__==='object');
  await page.evaluate(()=>{
    const s=defaultState();s.onboardingSeen=true;setState(s);round=null;lastSummary=null;
    const d=document.getElementById('detailDialog');if(d?.open)d.close();
  });
}

async function assertCanonicalQuestion(page,mode){
  await expect(page.locator('.atlas-v12.is-question')).toBeVisible();
  await expect(page.locator('.atlas-header')).toBeVisible();
  await expect(page.locator('#qaTimerShell')).toBeVisible();
  const state=await page.evaluate(()=>({mode:round?.mode,renderSource:renderGame.toString(),summarySource:renderSummary.toString()}));
  expect(state.mode).toBe(mode);
  expect(state.renderSource).toContain('atlas-v12');
  expect(state.summarySource).toContain('atlas-summary');
}

async function answerCurrent(page){
  await page.evaluate(()=>{
    const q=QUESTION_BY_ID.get(round.questionIds[round.index]);
    __QA_TIMER__.setRemaining(10000);setYear(q.year);commitAnswer(false);
  });
  await expect(page.locator('.atlas-v12.is-answered')).toBeVisible();
  await expect(page.locator('.v16-learning-card')).toBeVisible();
}

async function finish(page){
  await page.evaluate(()=>{
    while(round){
      if(round.phase==='question'){
        const q=QUESTION_BY_ID.get(round.questionIds[round.index]);
        __QA_TIMER__.setRemaining(10000);setYear(q.year);commitAnswer(false);
      }
      if(round?.phase==='answer')nextQuestion();
    }
  });
  await expect(page.locator('.atlas-summary')).toBeVisible();
}

test('renderer canónico cubre daily question feedback summary',async({page})=>{
  await boot(page);await page.evaluate(()=>{showView('hoy',{focus:false});startDaily()});
  await assertCanonicalQuestion(page,'daily');await answerCurrent(page);await finish(page);
});

test('renderer canónico cubre practice question feedback summary',async({page})=>{
  await boot(page);await page.evaluate(()=>startPractice('all','Todas',3));
  await assertCanonicalQuestion(page,'practice');await answerCurrent(page);await finish(page);
});

test('renderer canónico cubre review question feedback summary',async({page})=>{
  await boot(page);await page.evaluate(()=>{
    currentView='repaso';round=createRound('review',QUESTIONS.slice(0,3));persistRound();renderGame();
  });
  await assertCanonicalQuestion(page,'review');await answerCurrent(page);await finish(page);
});
