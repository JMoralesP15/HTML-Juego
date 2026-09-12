export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function RoundProgress({ current = 1, total = 5 } = {}) {
  const root = el('div','qaf-round-progress');
  root.setAttribute('role','group');
  root.setAttribute('aria-label',`Pregunta ${current} de ${total}`);
  const dots = el('div','qaf-round-progress__dots');
  for (let i=1;i<=total;i++) {
    const dot = el('span','qaf-round-dot');
    dot.dataset.state = i < current ? 'done' : i === current ? 'current' : 'pending';
    dots.append(dot);
  }
  root.append(dots, el('span','qaf-round-progress__label',`${current} / ${total}`));
  return root;
}

export function YearAdjustButton({ amount = 1, onAdjust } = {}) {
  const button = el('button','qaf-adjust', amount > 0 ? `+${amount}` : String(amount));
  button.type = 'button';
  button.dataset.magnitude = Math.abs(amount) === 1 ? '1' : '10';
  button.setAttribute('aria-label',`${amount > 0 ? 'Sumar' : 'Restar'} ${Math.abs(amount)} ${Math.abs(amount)===1?'año':'años'}`);
  button.addEventListener('click',()=>onAdjust?.(amount));
  return button;
}

export function YearSelector({ value = 1990, min = 1900, max = 2025, onChange } = {}) {
  const root = el('div','qaf-year-selector');
  const input = el('input','qaf-year-input');
  input.type = 'number'; input.min = String(min); input.max = String(max); input.value = String(value);
  input.setAttribute('aria-label','Año elegido');
  const rangeWrap = el('div','qaf-year-selector__range');
  const range = el('input','qaf-year-range');
  range.type='range'; range.min=String(min); range.max=String(max); range.value=String(value);
  range.setAttribute('aria-label','Seleccionar año');
  const bounds = el('div','qaf-year-selector__bounds'); bounds.append(el('span','',String(min)),el('span','',String(max)));
  rangeWrap.append(range,bounds);
  const setValue = next => {
    const n = Math.max(min,Math.min(max,Number(next)));
    input.value = String(n); range.value = String(n); onChange?.(n);
  };
  const controls = [-10,-1,1,10].map(amount=>YearAdjustButton({amount,onAdjust:a=>setValue(Number(input.value)+a)}));
  input.addEventListener('input',()=>setValue(input.value));
  range.addEventListener('input',()=>setValue(range.value));
  root.append(controls[0],controls[1],input,controls[2],controls[3],rangeWrap);
  return root;
}

export function PrimaryAction({ label = 'Responder', onClick } = {}) {
  const button = el('button','qaf-primary',label); button.type='button'; button.addEventListener('click',()=>onClick?.()); return button;
}

export function AnswerResult({ correctYear=1969, userYear=1968, points=931, label='¡Muy cerca!', tone='near' } = {}) {
  const root = el('section','qaf-answer-result'); root.dataset.tone=tone; root.setAttribute('aria-live','polite');
  const diff = userYear - correctYear;
  let delta = '¡Exacto!';
  if (diff < 0) delta = `Te falt${Math.abs(diff)===1?'ó':'aron'} ${Math.abs(diff)} ${Math.abs(diff)===1?'año':'años'}`;
  if (diff > 0) delta = `Te pasaste por ${Math.abs(diff)} ${Math.abs(diff)===1?'año':'años'}`;
  root.append(el('div','qaf-answer-result__eyebrow',label), el('div','qaf-answer-result__year',String(correctYear)));
  const meta = el('div','qaf-answer-result__meta');
  meta.append(el('span','',`Tu respuesta: ${userYear}`),el('span','qaf-answer-result__delta',delta),el('span','qaf-answer-result__score',`+${points} puntos`));
  root.append(meta);
  return root;
}

export function TemporalScale({ correctYear=1969, userYear=1968 } = {}) {
  const root = el('div','qaf-temporal-scale');
  const track = el('div','qaf-temporal-scale__track');
  const low=Math.min(correctYear,userYear), high=Math.max(correctYear,userYear), diff=Math.abs(high-low);
  const padding = Math.max(5,Math.ceil(diff*.35));
  const min=low-padding, max=high+padding;
  const pct = y => ((y-min)/(max-min))*100;
  const addMarker=(year,kind,label)=>{
    const marker=el('span','qaf-temporal-scale__marker'); marker.dataset.kind=kind; marker.style.left=`${pct(year)}%`;
    const txt=el('span','qaf-temporal-scale__label',`${label} ${year}`); txt.dataset.kind=kind; txt.style.left=`${pct(year)}%`;
    track.append(marker,txt);
  };
  if (correctYear===userYear) addMarker(correctYear,'correct','TU RESPUESTA ·');
  else { addMarker(userYear,'user','TÚ'); addMarker(correctYear,'correct','CORRECTO'); }
  const ticks=el('div','qaf-temporal-scale__ticks'); ticks.append(el('span','',String(min)),el('span','',String(Math.round((min+max)/2))),el('span','',String(max)));
  root.append(track,ticks); return root;
}
