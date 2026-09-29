let score=0, timer=null, seconds=1800, started=false;

function updateScore(n=0){
  score+=n;
  document.getElementById('score').textContent=score;
  document.getElementById('finalScore').textContent=score;
}
function startTimer(){
  if(started) return;
  started=true;
  timer=setInterval(()=>{
    seconds=Math.max(0,seconds-1);
    const m=String(Math.floor(seconds/60)).padStart(2,'0');
    const s=String(seconds%60).padStart(2,'0');
    document.getElementById('clock').textContent=`${m}:${s}`;
    if(seconds===0){clearInterval(timer);document.getElementById('clock').textContent='ЧАС!';}
  },1000);
}
function pickOpen(btn,points){
  const parent=btn.closest('.quest');
  parent.querySelectorAll('.choice').forEach(b=>b.classList.remove('correct'));
  btn.classList.add('correct');
  parent.querySelector('.feedback')?.classList.add('show');
}
function answer(btn,isCorrect,feedbackId){
  const parent=btn.closest('.quest');
  parent.querySelectorAll('.choice').forEach(b=>b.disabled=true);
  btn.classList.add(isCorrect?'correct':'wrong');
  const fb=document.getElementById(feedbackId);
  if(fb) fb.classList.add('show');
  if(isCorrect && !parent.dataset.scored){ updateScore(2); parent.dataset.scored='1';}
}
function toggleAns(id){
  document.getElementById(id).classList.toggle('show');
}
const rules=[...document.querySelectorAll('.rule')];
rules.forEach(btn=>btn.addEventListener('click',()=>{
  const count=document.querySelectorAll('.rule.selected').length;
  if(!btn.classList.contains('selected') && count>=5) return;
  btn.classList.toggle('selected');
  document.getElementById('ruleCount').textContent=document.querySelectorAll('.rule.selected').length;
}));
function ruleTrap(){
  const n=document.querySelectorAll('.rule.selected').length;
  const box=document.getElementById('ruleFeedback');
  box.classList.add('show');
  if(n!==5){box.textContent='Спершу оберіть рівно 5 правил.';return;}
  box.innerHTML='<b>Пастка!</b> Викинути ще п’ять виявилося боляче, правда? Реальна спільнота не тримається на одному лозунгу. Їй потрібні повага, відповідальність і правила.';
  if(!box.dataset.scored){updateScore(2);box.dataset.scored='1';}
}
function resetRules(){
  rules.forEach(b=>b.classList.remove('selected'));
  document.getElementById('ruleCount').textContent='0';
  document.getElementById('ruleFeedback').classList.remove('show');
}
const stages=[...document.querySelectorAll('[data-stage]')];
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const idx=stages.indexOf(e.target);
      const pct=((idx+1)/stages.length)*100;
      document.getElementById('progressFill').style.width=pct+'%';
    }
  });
},{threshold:.35});
stages.forEach(s=>obs.observe(s));
document.querySelectorAll('.vote').forEach(v=>v.addEventListener('click',()=>v.classList.toggle('active')));