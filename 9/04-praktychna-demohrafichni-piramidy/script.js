function reveal(id,name){
 const el=document.getElementById(id); el.classList.remove('locked');
 el.querySelector('.name').textContent=name;
}
function checkZ1(){
 const a=document.getElementById('z1a').value,b=document.getElementById('z1b').value,c=document.getElementById('z1c').value;
 const fb=document.getElementById('fb-z1');
 if(!a||!b||!c){fb.className='feedback bad';fb.textContent='Заповніть усі три поля.';return}
 if(a==='A'&&b==='C'&&c==='C'){fb.className='feedback ok';fb.textContent='✅ Так. A — наймолодша структура, C — найстаріша і водночас уже скорочується.'}
 else{fb.className='feedback bad';fb.textContent='Не все збігається. Дивіться на частку дітей, частку 65+ і зміну чисельності за 10 років.'}
}
function checkRatio(){
 const v=Number(document.getElementById('ratio').value),fb=document.getElementById('fb-ratio');
 if(!v){fb.className='feedback bad';fb.textContent='Введіть число.';return}
 if(Math.abs(v-3.4)<=0.2){fb.className='feedback ok';fb.textContent='✅ Так: 15,8 ÷ 4,7 ≈ 3,4.'}
 else{fb.className='feedback bad';fb.textContent='Спробуйте поділити 15,8 на 4,7. Працюємо з модулем скорочення, тобто без знака «мінус».'}
}
function scenario(id,correct,fbid){
 const v=document.getElementById(id).value,fb=document.getElementById(fbid);
 if(!v){fb.className='feedback bad';fb.textContent='Оберіть варіант.';return}
 if(v===correct){fb.className='feedback ok';fb.textContent='✅ Логічно. Це відповідає віковій структурі населення.'}
 else{fb.className='feedback bad';fb.textContent='❌ Перевірте структуру населення: яка вікова група велика і які потреби це створює?'}
}
function buildReport(){
 const name=document.getElementById('studentName').value.trim()||'ПІБ не вказано';
 const cls=document.getElementById('studentClass').value.trim()||'9 клас';
 const claim=document.getElementById('claim').value.trim();
 const ev1=document.getElementById('ev1').value.trim();
 const ev2=document.getElementById('ev2').value.trim();
 const reason=document.getElementById('reason').value.trim();
 const extras=[
  ['Нігерія',document.getElementById('a3').value.trim()],
  ['Японія',document.getElementById('a4').value.trim()],
  ['Німеччина vs Японія',document.getElementById('a5').value.trim()],
  ['Стать і вік',document.getElementById('a6').value.trim()],
  ['Регіони України',document.getElementById('a7').value.trim()],
  ['Обмеження даних',document.getElementById('a9').value.trim()],
  ['Прогноз Нігерія',document.getElementById('a10').value.trim()],
  ['Прогноз Японія',document.getElementById('a11').value.trim()]
 ].filter(x=>x[1]);
 let text=`ПРАКТИЧНА РОБОТА • 9 КЛАС\n${name} • ${cls}\n\n`;
 text+=`ВИСНОВОК CER\nТвердження: ${claim||'—'}\nДоказ 1: ${ev1||'—'}\nДоказ 2: ${ev2||'—'}\nПояснення: ${reason||'—'}\n`;
 if(extras.length){text+='\nРОБОЧІ ВІДПОВІДІ\n'+extras.map(x=>`${x[0]}: ${x[1]}`).join('\n')}
 document.getElementById('output').textContent=text;
}