/* QUÉ AÑO v1.4 — atmósfera, lectura editorial e imágenes abiertas como progressive enhancement.
 * v1.7: la inspección visual usa el contrato de render y deja de observar mutaciones del DOM.
 * v1.8.4: la media curada v1.8 tiene precedencia explícita sobre Commons, incluso tras una respuesta asíncrona tardía.
 */
(function(){
  'use strict';

  const VERSION='1.4.0-beta.1';
  const CACHE_KEY='que_ano_v14_open_media';
  const CACHE_TTL=1000*60*60*24*14;
  const COMMONS='https://commons.wikimedia.org/w/api.php';
  const ALLOWED_LICENSE=/^(public domain|pd|cc0|cc by(?:[- ]sa)?(?:[- ]\d(?:\.\d)?)?|cc-by(?:-sa)?(?:-\d(?:\.\d)?)?)$/i;
  let renderKey='';

  function currentQuestion(){
    try{if(typeof round==='undefined'||!round?.questionIds)return null;return QUESTION_BY_ID.get(round.questionIds[round.index])||null}catch{return null}
  }
  function telemetry(event,properties={}){
    try{if(window.posthog&&typeof window.posthog.capture==='function')window.posthog.capture(event,{app_version:VERSION,...properties})}catch{}
  }
  function text(value){const d=document.createElement('div');d.innerHTML=String(value||'');return (d.textContent||'').replace(/\s+/g,' ').trim()}
  function normalized(value){return text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
  function tokens(value){const stop=new Set(['file','image','the','and','para','del','las','los','una','uno','con','por','que','año','year','jpg','jpeg','png','webp']);return normalized(value).split(/\s+/).filter(x=>x.length>2&&!stop.has(x))}
  function relevant(q,pageTitle){const wanted=tokens(q.title),found=new Set(tokens(pageTitle));return wanted.length===0||wanted.some(t=>found.has(t)||[...found].some(x=>x.includes(t)||t.includes(x)))}
  function safeHttp(value){try{const u=new URL(value);return u.protocol==='https:'?u.href:''}catch{return ''}}
  function licenseAllowed(name){const n=text(name).replace(/Creative Commons/ig,'CC').replace(/Attribution-ShareAlike/ig,'BY-SA').replace(/Attribution/ig,'BY').replace(/\s+/g,' ').trim();return !/NC|ND/i.test(n)&&ALLOWED_LICENSE.test(n)}
  function hasCuratedMedia(q){return Boolean(q?.v18Media?.src)}

  function readCache(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')||{}}catch{return {}}}
  function writeCache(cache){try{localStorage.setItem(CACHE_KEY,JSON.stringify(cache))}catch{}}
  function cached(id){const c=readCache()[id];if(!c||Date.now()>c.expires)return undefined;return c.media||null}
  function saveCache(id,media){const c=readCache();c[id]={expires:Date.now()+CACHE_TTL,media:media||null};const keys=Object.keys(c);if(keys.length>140)keys.sort((a,b)=>(c[a]?.expires||0)-(c[b]?.expires||0)).slice(0,keys.length-140).forEach(k=>delete c[k]);writeCache(c)}

  async function findOpenMedia(q){
    if(!q||navigator.onLine===false)return null;
    const hit=cached(q.id);if(hit!==undefined)return hit;
    const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:q.v14MediaQuery||q.title,gsrnamespace:'6',gsrlimit:'4',prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'1200',iiextmetadatalanguage:'es',iiextmetadatafilter:'LicenseShortName|LicenseUrl|Artist|Credit|ImageDescription',format:'json',origin:'*'});
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4500);
    try{
      const res=await fetch(`${COMMONS}?${params}`,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!res.ok)throw new Error('commons_http');
      const data=await res.json(),pages=Object.values(data?.query?.pages||{});
      for(const page of pages){
        const info=page?.imageinfo?.[0],meta=info?.extmetadata||{},license=text(meta.LicenseShortName?.value),src=safeHttp(info?.thumburl||info?.url);
        if(!src||!licenseAllowed(license)||!relevant(q,page.title||''))continue;
        const media={src,page:`https://commons.wikimedia.org/wiki/${encodeURIComponent(String(page.title||'').replace(/ /g,'_'))}`,artist:text(meta.Artist?.value||meta.Credit?.value||'Wikimedia Commons'),license,licenseUrl:safeHttp(meta.LicenseUrl?.value),description:text(meta.ImageDescription?.value||q.title).slice(0,220),automatic:true};
        saveCache(q.id,media);return media;
      }
      saveCache(q.id,null);return null;
    }catch{telemetry('open_media_failed',{question_id:q.id,culture_tier:q.cultureTier||null});return null}
    finally{clearTimeout(timer)}
  }

  function installMedia(media,q){
    if(!media||!q||hasCuratedMedia(q))return;
    const doc=document.querySelector('.atlas-document');if(!doc)return;
    let fig=doc.querySelector('.atlas-document-image');
    if(fig?.dataset.v18==='1')return;
    if(!fig){fig=document.createElement('figure');fig.className='atlas-document-image';doc.prepend(fig);doc.classList.remove('no-image');doc.classList.add('has-image')}
    const img=document.createElement('img');img.src=media.src;img.alt=media.description||`Documento visual abierto relacionado con ${q.title}`;img.loading='lazy';img.referrerPolicy='no-referrer';
    const cap=document.createElement('figcaption');cap.className='v14-open-media-credit';
    const strong=document.createElement('strong');strong.textContent='IMAGEN ABIERTA · SELECCIÓN AUTOMÁTICA';
    const detail=document.createElement('span');detail.textContent=`${media.artist} · ${media.license}`;
    const source=document.createElement('a');source.href=media.page;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Ficha y atribución ↗';
    cap.append(strong,detail,source);fig.replaceChildren(img,cap);
    img.addEventListener('error',()=>{fig.remove();doc.classList.remove('has-image');doc.classList.add('no-image');telemetry('open_media_failed',{question_id:q.id,culture_tier:q.cultureTier||null})},{once:true});
    telemetry('open_media_loaded',{question_id:q.id,culture_tier:q.cultureTier||null,license:media.license,automatic:true});
  }

  async function enrichMedia(q,key){
    if(!q||key!==renderKey||hasCuratedMedia(q))return;
    if(q.imageType==='documentary'&&!q.v12GeneratedImage&&q.imageSource)return;
    const media=await findOpenMedia(q);
    if(key!==renderKey||!media||hasCuratedMedia(q))return;
    if(document.querySelector('.atlas-document-image[data-v18="1"]'))return;
    installMedia(media,q)
  }

  function addCultureBadge(q){
    if(!q||document.querySelector('.v14-culture-badge'))return;
    const target=document.querySelector('.v13-feedback-sequence')||document.querySelector('.atlas-learn-head');if(!target)return;
    const badge=document.createElement('span');badge.className=`v14-culture-badge tier-${q.cultureTier||'context'}`;badge.textContent=q.cultureTierLabel||'Contexto recomendado';badge.title=`Adecuación editorial estimada: ${q.cultureScore}/100. ${q.cultureAssessment?.reason||''}`;target.append(badge)
  }

  function addDenseContext(q){
    const extra=document.querySelector('.v13-context-extra');if(!q||!extra||extra.dataset.v14==='1')return;extra.dataset.v14='1';
    const enrich=q.v14Context||{};
    const blocks=[['DATO PARA RECORDAR',enrich.remember],['CONEXIÓN',enrich.connection]];
    for(const [label,value] of blocks){if(!value)continue;const section=document.createElement('section'),b=document.createElement('b'),p=document.createElement('p');b.textContent=label;p.textContent=value;section.append(b,p);extra.append(section)}
    const note=document.createElement('small');note.className='v14-editorial-note';note.textContent=`Nivel editorial: ${q.cultureTierLabel||'Contexto recomendado'} · ${q.cultureAssessment?.method||'curaduría v1.4'}.`;extra.append(note)
  }

  function inspect(){
    const q=currentQuestion();if(!q)return;
    let phase='question';try{phase=round?.phase||phase}catch{}
    const key=`${q.id}:${phase}`;if(key===renderKey&&document.querySelector('.v14-culture-badge'))return;renderKey=key;
    if(phase==='answer'){
      addCultureBadge(q);addDenseContext(q);enrichMedia(q,key);
      const toggle=document.querySelector('[data-v13-action="context-toggle"]');if(toggle&&!toggle.dataset.v14Tracked){toggle.dataset.v14Tracked='1';toggle.addEventListener('click',()=>telemetry('culture_context_expanded',{question_id:q.id,culture_tier:q.cultureTier||null,culture_score:q.cultureScore||null}),{once:true})}
    }
  }

  class AmbientEngine{
    constructor(){this.ctx=null;this.timer=null;this.enabled=false;this.step=0;this.button=null}
    ensure(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;this.ctx=this.ctx||new Audio();if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return true}
    chord(){
      if(!this.enabled||document.visibilityState!=='visible'||!this.ctx)return;
      const roots=[146.83,130.81,174.61,196.00],ratios=[[1,1.2,1.5],[1,1.25,1.5],[1,1.2,1.498],[1,1.25,1.498]],root=roots[this.step%roots.length],shape=ratios[this.step%ratios.length],now=this.ctx.currentTime;
      shape.forEach((r,i)=>{const o=this.ctx.createOscillator(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();o.type=i===0?'sine':'triangle';o.frequency.value=root*r*(i===2?2:1);f.type='lowpass';f.frequency.value=1400;g.gain.setValueAtTime(0,now+i*.07);g.gain.linearRampToValueAtTime(.022,now+.28+i*.07);g.gain.exponentialRampToValueAtTime(.0001,now+3.1+i*.07);o.connect(f);f.connect(g);g.connect(this.ctx.destination);o.start(now+i*.07);o.stop(now+3.25+i*.07)});this.step++
    }
    start(){if(!this.ensure())return false;this.enabled=true;this.chord();clearInterval(this.timer);this.timer=setInterval(()=>this.chord(),3600);this.paint();telemetry('ambient_audio_toggled',{enabled:true});return true}
    stop(track=true){this.enabled=false;clearInterval(this.timer);this.timer=null;this.paint();if(track)telemetry('ambient_audio_toggled',{enabled:false})}
    toggle(){this.enabled?this.stop():this.start()}
    paint(){if(this.button){this.button.textContent=`Ambiente: ${this.enabled?'sí':'no'}`;this.button.setAttribute('aria-pressed',String(this.enabled));this.button.setAttribute('aria-label',this.enabled?'Desactivar ambiente musical':'Activar ambiente musical generativo')}}
    install(){const host=document.querySelector('.header-actions');if(!host||document.getElementById('ambientToggle'))return;const b=document.createElement('button');b.id='ambientToggle';b.className='icon-button v14-ambient';b.type='button';b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>this.toggle());host.insertBefore(b,document.getElementById('soundToggle')||host.firstChild);this.button=b;this.paint()}
  }

  const ambient=new AmbientEngine();ambient.install();
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible'&&ambient.enabled){clearInterval(ambient.timer);ambient.timer=null}else if(document.visibilityState==='visible'&&ambient.enabled&&!ambient.timer){ambient.chord();ambient.timer=setInterval(()=>ambient.chord(),3600)}});

  window.__QYA_RUNTIME__?.onRender(inspect);
  inspect();
  window.__QA_V14__={version:VERSION,findOpenMedia,licenseAllowed,relevant,hasCuratedMedia,ambient,inspect,cacheKey:CACHE_KEY};
})();
