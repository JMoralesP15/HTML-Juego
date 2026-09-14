import {test,expect} from '@playwright/test';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url=pathToFileURL(path.join(root,'index.html')).href;
async function boot(page,width=390){
  await page.setViewportSize({width,height:844});await page.goto(url);
  await page.evaluate(()=>{const s=defaultState();s.onboardingSeen=true;setState(s);document.querySelector('dialog[open]')?.close();round=null;showView('hoy',{focus:false})});
}
test('default release gates all pools and keeps a five-event session across reload',async({page})=>{
  await boot(page);expect(await page.evaluate(()=>QUESTIONS.length)).toBe(62);
  await expect(page.locator('.brand .version')).toContainText('62 eventos revisados');
  await page.evaluate(()=>startDaily());const ids=await page.evaluate(()=>round.questionIds);
  await page.reload();expect(await page.evaluate(()=>round.questionIds)).toEqual(ids);
  for(let i=0;i<5;i++){await page.evaluate(()=>commitAnswer(true));await expect(page.locator('.v16-learning-card')).toBeVisible();await page.evaluate(()=>nextQuestion())}
  expect(await page.evaluate(()=>getState().sessions.at(-1).answers.length)).toBe(5);
  await page.evaluate(()=>startTimeline());expect(await page.evaluate(()=>getState().timelineDraft.ids.every(id=>QUESTION_BY_ID.get(id).humanApproved))).toBe(true);
});
for(const width of [375,390])test(`approved copy and chosen image visible before expanding at ${width}px`,async({page})=>{
  await boot(page,width);await page.evaluate(()=>{startPractice('all','Todas',5);round.questionIds[0]='bitcoin';renderGame();commitAnswer(true)});
  const approved=await page.evaluate(()=>QUESTION_BY_ID.get('bitcoin').approvedLearning);
  await expect(page.locator('.v16-learning-narrative').first()).toHaveText(approved.summary);
  const image=page.locator('.atlas-learn>.atlas-document-image img');await expect(image).toHaveAttribute('src',await page.evaluate(()=>QUESTION_BY_ID.get('bitcoin').v18Media.src));
  await expect(page.locator('.atlas-learn>.atlas-document-image')).toBeVisible();
  await page.getByRole('button',{name:'Profundizar',exact:true}).click();
  await expect(page.locator('.atlas-document-copy')).toContainText(approved.expanded);
  await expect(page.locator('.atlas-document-copy')).not.toContainText(approved.summary);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:`test-results/screenshots/human-tester-${width}.png`,fullPage:true});
});
test('full edition remains explicitly available',async({page})=>{await page.goto(url+'?edition=full');expect(await page.evaluate(()=>QUESTIONS.length)).toBe(300)});

