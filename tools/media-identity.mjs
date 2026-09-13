// Pure identity matching, independent of editorial prose and rights checks.
const stop=new Set('the and for with para con del las los una uno first primer primera year ano anos album film movie pelicula lanzamiento de el en por que como fue su se'.split(' '));
export const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export const identityTokens=q=>[...new Set([q.title,q.entity?.replace(/-/g,' '),...(q.imageAliases||[])].join(' ').split(/\s+/).flatMap(x=>normalize(x).split(' ')).filter(t=>t.length>=3&&!stop.has(t)&&!/^\d+$/.test(t)))];
export function matchIdentity(q,blob){
  const words=new Set(normalize(blob).split(' ')),identity=identityTokens(q),matched=identity.filter(t=>words.has(t));
  const minimum=Math.min(2,identity.length);
  return {matched,accepted:minimum>0&&matched.length>=minimum&&matched.length/identity.length>=0.5};
}
export const photoMime=mime=>/^image\/(jpeg|png|webp|tiff)$/i.test(mime||'');
export function captureYear(meta){
  // DateTime may be an upload/digitisation date. Never use it as capture evidence.
  const text=String(meta?.DateTimeOriginal?.value||'').replace(/<[^>]+>/g,' ');
  const years=[...text.matchAll(/\b(18\d{2}|19\d{2}|20\d{2})\b/g)].map(m=>Number(m[1]));
  return new Set(years).size===1?years[0]:null;
}
