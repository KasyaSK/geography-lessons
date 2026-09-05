document.querySelectorAll('[data-check]').forEach(b=>b.addEventListener('click',()=>{
  const box=b.closest('.activity')||b.parentElement.parentElement, out=box.querySelector('.feedback');
  const ok=b.dataset.check==='right';
  out.className='feedback '+(ok?'ok':'bad');
  out.textContent=ok?'✓ Так. Висновок спирається на механізм передавання енергії.':'Спробуйте ще раз: відокремте джерело енергії від тіла, яке безпосередньо нагріває повітря.';
}));

let expected=1;
document.querySelectorAll('#chainGame button').forEach(b=>b.addEventListener('click',()=>{
  const out=document.querySelector('#chainOut');
  if(+b.dataset.order===expected){b.classList.add('done');b.disabled=true;expected++;out.className='feedback ok';out.textContent=expected===5?'✓ Ланцюг завершено: Сонце → поверхня → повітря → добова зміна температури.':'Правильно. Оберіть наступний етап.'}
  else{b.classList.add('wrong');setTimeout(()=>b.classList.remove('wrong'),300);out.className='feedback bad';out.textContent='Цей етап ще зарано. Шукайте попередню причину.'}
}));

const temps={0:10,3:8,6:7,9:12,12:18,15:21,18:17,21:13,24:10};
const comments={
0:'Після опівночі поверхня втрачає тепло, температура знижується.',
3:'Нічне вихолоджування триває.',
6:'Поблизу сходу Сонця поверхня ще має нічні втрати тепла — у прикладі це добовий мінімум.',
9:'Сонячна енергія вже нагріває поверхню, а від неї — нижній шар повітря.',
12:'Надходження сонячної енергії дуже велике, але температура ще не досягла максимуму.',
15:'У моделі це максимум: після полудня система ще встигла накопичити тепло.',
18:'Надходження енергії слабшає, втрати переважають — температура падає.',
21:'Після заходу Сонця поверхня продовжує віддавати тепло.',
24:'Знову опівніч: цикл повторюється.'
};
const hour=document.querySelector('#hour');
function updateHour(){
 const h=+hour.value,t=temps[h];document.querySelector('#hourLabel').textContent=String(h).padStart(2,'0')+':00';document.querySelector('#tempOut').textContent=t+' °C';document.querySelector('#dayComment').textContent=comments[h];document.querySelector('#tempBar').style.width=((t+5)/30*100)+'%';
}
hour.addEventListener('input',updateHour);updateHour();
document.querySelector('#checkAmp').addEventListener('click',()=>{
 const v=+document.querySelector('#amp').value,o=document.querySelector('#ampOut');o.className='feedback '+(v===14?'ok':'bad');o.textContent=v===14?'✓ 14 °C: 21 − 7.':'Знайдіть найбільшу й найменшу температуру та відніміть Tmin від Tmax.';
});

const info={
 asphalt:'Темний асфальт часто швидко нагрівається вдень і швидко втрачає тепло після заходу Сонця. Прогноз: різкіша реакція поверхні.',
 grass:'Рослинність частину доступної енергії витрачає на випаровування води. За однакових умов поверхня часто нагрівається слабше за суху темну.',
 water:'Вода має велику теплоємність і перемішується. Прогноз: її температура змінюється повільніше, тому біля великої водойми добові коливання часто пом’якшуються.'
};
document.querySelectorAll('[data-surface]').forEach(b=>b.addEventListener('click',()=>document.querySelector('#surfaceOut').textContent=info[b.dataset.surface]));

document.querySelector('#proofCheck').addEventListener('click',()=>{
 const t=document.querySelector('#proofText').value.trim(),o=document.querySelector('#proofOut');
 const hasData=/12|15|18|21|полуд|енерг|інерц|запіз/i.test(t);
 const good=t.length>=80&&hasData;o.className='feedback '+(good?'ok':'bad');
 o.textContent=good?'✓ Є твердження й опора на факти. Перевірте, чи пояснюєте саме запізнення температурного максимуму.':'Додайте конкретний факт (наприклад 12:00/15:00 або енергетичний баланс) і поясніть причинний зв’язок у 2–3 реченнях.';
});

document.querySelector('#cerCheck').addEventListener('click',()=>{
 const vals=['#cerC','#cerE','#cerR'].map(s=>document.querySelector(s).value.trim());
 const o=document.querySelector('#cerOut'),good=vals.every(v=>v.length>=25);
 o.className='feedback '+(good?'ok':'bad');o.textContent=good?'✓ CER має всі три частини. Тепер перевірте: Evidence містить дані, а Reasoning — механізм?':'Заповніть усі три частини: твердження, конкретний доказ і пояснення механізму.';
});

document.querySelector('#saveWeather').addEventListener('click',()=>{
 const d=document.querySelector('#wxDate').value,t=document.querySelector('#wxTime').value,v=document.querySelector('#wxTemp').value,o=document.querySelector('#weatherSaved');
 if(!d||!t||v===''){o.className='feedback bad';o.textContent='Заповніть дату, час і температуру.';return}
 const arr=JSON.parse(localStorage.getItem('geo6_weather')||'[]');arr.push({d,t,v});localStorage.setItem('geo6_weather',JSON.stringify(arr));
 o.className='feedback ok';o.textContent=`✓ Збережено в цьому браузері: ${d}, ${t}, ${v} °C. Усього записів: ${arr.length}.`;
});

const ids=['surname','name','className'],quiz=document.querySelector('#quiz'),lock=document.querySelector('#testLock');
function gate(){const open=ids.every(id=>document.querySelector('#'+id).value.trim().length>=2);quiz.hidden=!open;lock.hidden=open}
ids.forEach(id=>document.querySelector('#'+id).addEventListener('input',gate));gate();
const key={q1:'a',q2:'a',q3:'a',q4:'b',q5:'b',q6:'a',q7:'a',q8:'a',q9:'a',q10:'a'};
quiz.addEventListener('submit',e=>{
 e.preventDefault();let score=0;Object.entries(key).forEach(([q,a])=>{const x=quiz.querySelector(`input[name="${q}"]:checked`);if(x&&x.value===a)score++});
 const who=`${document.querySelector('#surname').value} ${document.querySelector('#name').value}, ${document.querySelector('#className').value}`;
 document.querySelector('#score').innerHTML=`${who}: <strong>${score}/10</strong>. ${score>=8?'Тему засвоєно впевнено.':score>=6?'Перегляньте помилки й повторіть причинний ланцюг та амплітуду.':'Поверніться до діяльностей 2–5 і повторіть §25.'}`;
});