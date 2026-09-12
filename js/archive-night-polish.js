/* RC.2 visual polish: stable human-readable archive numbering. */
function archiveNumber(q){
  const index=QUESTIONS.findIndex(item=>item.id===q?.id);
  return index>=0?String(index+1).padStart(3,'0'):'---';
}
