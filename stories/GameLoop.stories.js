import { RoundProgress, YearAdjustButton, YearSelector, PrimaryAction, AnswerResult, TemporalScale } from '../src/ui/components.js';

const wrap = (...nodes) => { const root=document.createElement('div'); root.className='qaf-demo-shell'; root.style.display='grid'; root.style.gap='22px'; root.append(...nodes); return root; };

export default { title: 'v1.1/Game Loop' };

export const RoundProgress_Default = { render: () => wrap(RoundProgress({current:3,total:5})) };
export const YearAdjustButton_Default = { render: () => wrap(YearAdjustButton({amount:-10}),YearAdjustButton({amount:-1}),YearAdjustButton({amount:1}),YearAdjustButton({amount:10})) };
export const YearSelector_Desktop = { render: () => wrap(YearSelector({value:1990,min:1900,max:2025})) };
export const PrimaryAction_Default = { render: () => wrap(PrimaryAction({label:'Responder'})) };
export const AnswerResult_Exact = { render: () => wrap(AnswerResult({correctYear:1969,userYear:1969,points:1000,label:'¡Exacto!',tone:'success'})) };
export const AnswerResult_Near = { render: () => wrap(AnswerResult({correctYear:1969,userYear:1968,points:931,label:'¡Muy cerca!',tone:'near'})) };
export const AnswerResult_LargeError = { render: () => wrap(AnswerResult({correctYear:1960,userYear:1990,points:118,label:'Muy lejos',tone:'far'})) };
export const TemporalScale_Exact = { render: () => wrap(TemporalScale({correctYear:1969,userYear:1969})) };
export const TemporalScale_OneYear = { render: () => wrap(TemporalScale({correctYear:1969,userYear:1968})) };
export const TemporalScale_LargeError = { render: () => wrap(TemporalScale({correctYear:1960,userYear:1990})) };
export const Feedback_Composed = { render: () => wrap(RoundProgress({current:3,total:5}),AnswerResult({correctYear:1969,userYear:1968,points:931,label:'¡Muy cerca!',tone:'near'}),TemporalScale({correctYear:1969,userYear:1968}),PrimaryAction({label:'Siguiente'})) };
