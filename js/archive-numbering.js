/* QUÉ AÑO v1.7 — numeración estable del archivo visible.
 * Responsabilidad única: traducir el orden canónico del banco a 001…300.
 */
function archiveNumber(q){
  const index=QUESTIONS.findIndex(item=>item.id===q?.id);
  return index>=0?String(index+1).padStart(3,'0'):'---';
}
