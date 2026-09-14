const byId=id=>document.getElementById(id);
function showFeedback(id,html,ok=true){
  const el=byId(id); el.innerHTML=html; el.classList.add('show');
  el.style.background=ok?'#e5efe4':'#f6e1d9';
}
document.querySelectorAll('[data-quick]').forEach(group=>{
  group.addEventListener('click',e=>{
    const b=e.target.closest('.choice'); if(!b)return;
    if(group.dataset.quick==='beforeMeasure'){ b.setAttribute('aria-pressed', b.getAttribute('aria-pressed')==='true'?'false':'true'); return; }
    group.querySelectorAll('.choice').forEach(x=>x.setAttribute('aria-pressed','false')); b.setAttribute('aria-pressed','true');
    const v=b.dataset.value, k=group.dataset.quick;
    if(k==='route') showFeedback('routeFeedback',v==='insufficient'?'Так. Спочатку треба врахувати рельєф, дороги, воду/болота, стан покриття й мету руху. Найкоротша лінія — лише один доказ.':'Це можлива гіпотеза, але рішення поки слабке: Ви використали лише довжину маршруту.',v==='insufficient');
    if(k==='scale') showFeedback('scaleFeedback',v==='25000'?'Правильно: 1:25 000 — більший масштаб і більше деталей.':'Ні. Чим менший знаменник дробу 1:n, тим більший масштаб.',v==='25000');
    if(k==='convert') showFeedback('convertFeedback',v==='500'?'Так: 50 000 см = 500 м = 0,5 км.':'Перевірте одиниці: 100 см = 1 м.',v==='500');
    if(k==='gridArea') showFeedback('gridAreaFeedback',v==='1'?'Так: кілометрова сітка дає квадрат 1 км × 1 км = 1 км².':'Ні: площа квадрата 1 км × 1 км дорівнює 1 км².',v==='1');
  });
});
byId('checkBefore').addEventListener('click',()=>{
  const pressed=[...document.querySelectorAll('[data-quick="beforeMeasure"] .choice[aria-pressed="true"]')].map(x=>x.dataset.value).sort();
  const good=['grid','legend','scale'].sort();
  const ok=JSON.stringify(pressed)===JSON.stringify(good);
  showFeedback('beforeFeedback',ok?'Саме так: масштаб + легенда + сітка/одиниці. Північ важлива для напрямку, але не є достатньою умовою коректного вимірювання.':'Потрібен точний набір: масштаб, легенда та сітка/одиниці.',ok);
});
document.querySelectorAll('.reveal').forEach(b=>b.addEventListener('click',()=>byId(b.dataset.target).classList.add('show')));
document.querySelectorAll('[data-zoom]').forEach(b=>b.addEventListener('click',()=>{byId('topoMap').style.width=(Number(b.dataset.zoom)*100)+'%'}));

byId('calcDistance').addEventListener('click',()=>{
  const cm=Number(byId('mapCm').value), den=Number(byId('scaleDen').value);
  if(!(cm>0&&den>0)){byId('distanceOut').textContent='Перевірте числа';return}
  const km=cm*den/100000;
  byId('distanceOut').textContent=km.toLocaleString('uk-UA',{maximumFractionDigits:3})+' км';
});
byId('calcDistance').click();

byId('checkArea').addEventListener('click',()=>{
  const v=Number(byId('areaGuess').value);
  if(!Number.isFinite(v)){showFeedback('areaFeedback','Введіть оцінку площі.',false);return}
  const ok=v>=13&&v<=16;
  showFeedback('areaFeedback',ok?'Добра оцінка. Для такої палетки прийнятний інтервал приблизно 13–16 км². Важливіше не «вгадати точне число», а визнати похибку неповних клітин.':'Спробуйте ще раз: порахуйте повні клітинки, а неповні приблизно зведіть до половинок. Орієнтир — близько 14–15 км².',ok);
});

document.querySelectorAll('.level-btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.level-panel').forEach(p=>p.classList.remove('active'));
  byId('level-'+b.dataset.level).classList.add('active');
}));

document.querySelectorAll('.duel-btn').forEach((b,i)=>b.addEventListener('click',()=>{
  const texts=[
    'Хибне. 1:25 000 — більший масштаб, бо одна й та сама довжина на карті відповідає меншій ділянці місцевості, отже деталей більше.',
    'Правильне: 1 мм × 50 000 = 50 000 мм = 50 м.',
    'Хибне. Карта дає планову відстань; реальний шлях залежить від звивистості маршруту, рельєфу та прохідності.'
  ];
  showFeedback(b.dataset.id,texts[i],true);
}));
byId('checkCer').addEventListener('click',()=>{
  const vals=[byId('cerC').value.trim(),byId('cerE').value.trim(),byId('cerR').value.trim()];
  const ok=vals.every(v=>v.length>=20);
  showFeedback('cerFeedback',ok?'CER повний. Тепер перевірте, чи доказ конкретний, а пояснення показує зв’язок між доказом і твердженням.':'У кожному полі потрібно хоча б одне змістовне речення: твердження, конкретний доказ і пояснення зв’язку.',ok);
});

function validFullName(value){
  const parts=value.trim().replace(/\s+/g,' ').split(' ');
  return parts.length>=2 && parts.every(p=>/^[А-ЯІЇЄҐа-яіїєґ'’\-]+$/u.test(p));
}
byId('startQuiz').addEventListener('click',()=>{
  const n=byId('studentName').value, c=byId('studentClass').value.trim();
  if(!validFullName(n)||!c){showFeedback('gateFeedback','Введіть ім’я, прізвище та клас. Без цифр у ПІБ.',false);return}
  byId('quizGate').style.display='none'; byId('quizForm').style.display='block'; byId('quizForm').scrollIntoView({behavior:'smooth'});
});
function exactChecks(name,expected){
  const got=[...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x=>x.value).sort();
  return JSON.stringify(got)===JSON.stringify([...expected].sort());
}
byId('quizForm').addEventListener('submit',e=>{
  e.preventDefault();
  let score=0;
  const radio=(n,v)=>document.querySelector(`input[name="${n}"]:checked`)?.value===v;
  if(radio('q1','1.8'))score++;
  if(radio('q2','curvi'))score++;
  if(radio('q3','50'))score++;
  if(radio('q4','25'))score++;
  if(exactChecks('q5',['scale','legend','relief','obstacles']))score++;
  if(exactChecks('q6',['grid','split','gis']))score++;
  if(byId('quizForm').q7a.value==='road'&&byId('quizForm').q7b.value==='forest'&&byId('quizForm').q7c.value==='tower')score++;
  if(radio('q8','b'))score++;
  if(radio('q9','no'))score++;
  if(radio('q10','b'))score++;
  const pct=score*10;
  const comment=score<=4?'Потрібно повторити масштаб і способи вимірювання.':score<=7?'Достатній рівень: основа є, допрацюйте похибку й вибір методу.':score<=9?'Добре: Ви впевнено працюєте з картою та доказами.':'Відмінно: точні обчислення і коректна логіка.';
  byId('scoreText').textContent=`${score}/10 • ${pct}%`;
  const now=new Date();
  byId('resultDetails').innerHTML=`<p><b>${byId('studentName').value.trim()}</b> • ${byId('studentClass').value.trim()}</p><p>Тема: Читання топографічних карт і вимірювання відстаней та площ</p><p>${comment}</p><p>${now.toLocaleString('uk-UA')}</p>`;
  byId('quizResult').classList.add('show'); byId('quizResult').scrollIntoView({behavior:'smooth'});
});
byId('printResult').addEventListener('click',()=>window.print());
byId('retryQuiz').addEventListener('click',()=>{
  if(!confirm('Очистити відповіді тесту? ПІБ і клас залишаться.'))return;
  byId('quizForm').reset(); byId('quizResult').classList.remove('show'); byId('quizForm').scrollIntoView({behavior:'smooth'});
});
