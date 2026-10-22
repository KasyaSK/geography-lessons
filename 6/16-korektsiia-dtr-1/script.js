const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const routeBtn=$('#routeBtn'),routeOut=$('#routeOut');routeBtn.addEventListener('click',()=>{const v=document.querySelector('input[name="weak"]:checked')?.value;if(!v){routeOut.textContent='Спочатку оберіть тип труднощів.';return}const names={source:'A — Обрати джерело',direction:'B — Напрям і азимут',scale:'C — Масштаб',legend:'D — Легенда'};routeOut.textContent=`Почніть зі станції ${names[v]}, потім пройдіть решту.`;document.getElementById(v).scrollIntoView({behavior:'smooth',block:'center'})});
$$('[data-check]').forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.check;let ok=false,msg='';if(t==='source'){ok=$('#sourceSelect').value==='серія супутникових знімків різних років';msg=ok?'Так: серія знімків дає змогу порівнювати стан у різні роки.':'Потрібне джерело, яке фіксує реальний стан території у різні моменти часу.'}if(t==='direction'){ok=document.querySelector('input[name="az"]:checked')?.value==='90';msg=ok?'Так: схід відповідає 90°.':'Пригадайте: Пн 0°/360°, Сх 90°, Пд 180°, Зх 270°.'}if(t==='scale'){ok=Math.abs(Number($('#scaleAns').value)-10.5)<.01;msg=ok?'Так: 1 см = 2,5 км; 4,2 см = 10,5 км.':'Перетворіть 250 000 см у 2,5 км, а потім помножте на 4,2.'}if(t==='legend'){ok=document.querySelector('input[name="lg"]:checked')?.value==='no';msg=ok?'Так: колір кодує значення показника, а не площу території.':'Ні. Площа регіону та значення показника — різні властивості.'}const fb=$('#'+t+'Fb');fb.textContent=msg;fb.className='feedback '+(ok?'ok':'bad')}));
const fields=['#first','#last','#class'].map($);function gate(){const ok=$('#first').value.trim().length>=2&&$('#last').value.trim().length>=2&&$('#class').value.trim().length>=1;$('#startTest').disabled=!ok}fields.forEach(x=>x.addEventListener('input',gate));
const questions=[
 {t:'Потрібно порівняти межі озера у 2000 і 2025 роках. Які дані оберете?',ty:'one',o:['Серія супутникових знімків із датами','Глобус сучасного року','Тільки фізична карта 2025 року','Політична карта'],a:0},
 {t:'Турист рухається на захід. Який азимут його руху?',ty:'one',o:['90°','180°','270°','360°'],a:2},
 {t:'На карті 5 см у масштабі 1:100 000. Яка відстань на місцевості?',ty:'one',o:['0,5 км','5 км','50 км','500 км'],a:1},
 {t:'Кольори висот на фізичній карті можна правильно прочитати...',ty:'one',o:['за назвою країни','за легендою карти','за кількістю назв','за розміром аркуша'],a:1},
 {t:'Оберіть ДВА коректні географічні твердження.',ty:'multi',o:['Схід відповідає азимуту 90°','Масштаб 1:10 000 більший за 1:100 000','Більший знаменник масштабу завжди означає більший масштаб','Сині кольори на всіх картах означають державні кордони'],a:[0,1]},
 {t:'Потрібно перевірити маршрут на місцевості. Які ДВА джерела допоможуть?',ty:'multi',o:['Актуальна карта вулиць','Компас або дані напрямку','Лише глобус Землі','Лише схема політичних кордонів'],a:[0,1]},
 {t:'Установіть відповідність: джерело → що досліджуємо.',ty:'match',rows:['Супутникові знімки за різні роки','Топографічний план','Картограма населення'],o:['Динаміка об’єкта в часі','Відстані й рельєф у межах місцевості','Відмінності статистичного показника'],a:['Динаміка об’єкта в часі','Відстані й рельєф у межах місцевості','Відмінності статистичного показника']},
 {t:'Упорядкуйте чотири кроки побудови маршруту.',ty:'order',rows:['Визначити початковий і кінцевий пункти','Ознайомитися з масштабом та легендою','Намітити шлях з урахуванням перешкод','Перевірити відстань і напрям'],a:[1,2,3,4]},
 {t:'Для твердження «біля школи за 5 років стало менше дерев» достатньо доказу...',ty:'one',o:['Однієї літньої фотографії','Порівнюваних датованих знімків однієї ділянки','Відгуку незнайомої людини','Карти середньої температури світу'],a:1},
 {t:'Який висновок містить твердження, доказ і пояснення?',ty:'one',o:['Масштаб — це завжди сантиметри','На плані 4 см за 1:25 000 означають 1 км на місцевості, бо 1 см на плані дорівнює 250 м','Мені здається, річка довга','Карта гарна, тому правильна'],a:1}
];
function qMarkup(x,i){
 const title='<div class="q"><b>'+(i+1)+'. '+x.t+'</b>';
 if(x.ty==='one'||x.ty==='multi')return title+'<div class="choices">'+x.o.map((a,j)=>'<label class="choice"><input type="'+(x.ty==='one'?'radio':'checkbox')+'" name="q'+i+'" value="'+j+'">'+a+'</label>').join('')+'</div></div>';
 if(x.ty==='match')return title+x.rows.map((t,j)=>'<label class="choice">'+t+' <select id="q'+i+'r'+j+'"><option value="">Оберіть</option>'+x.o.map(a=>'<option>'+a+'</option>').join('')+'</select></label>').join('')+'</div>';
 return title+x.rows.map((t,j)=>'<label class="choice">'+t+' <select id="q'+i+'r'+j+'"><option value="">№ кроку</option>'+[1,2,3,4].map(n=>'<option>'+n+'</option>').join('')+'</select></label>').join('')+'</div>';
}
function validateIdentity(){return [$('#first').value,$('#last').value].every(v=>/^[А-ЯІЇЄҐа-яіїєґ’'-]{2,}$/u.test(v.trim()))&&/^6-[А-ЯІЇЄҐA-Z]$/u.test($('#class').value.trim().toUpperCase())}
function renderQuiz(){const q=$('#quiz');q.innerHTML=questions.map(qMarkup).join('');q.addEventListener('change',progress)}
function doneFor(x,i){if(x.ty==='one'||x.ty==='multi')return !!document.querySelector('input[name="q'+i+'"]:checked');return x.rows.every((_,j)=>document.getElementById('q'+i+'r'+j).value!=='')}
function progress(){let done=questions.filter(doneFor).length;$('#bar').style.width=(done*10)+'%'}
$('#startTest').addEventListener('click',()=>{if(!validateIdentity()){alert('Укажіть ім’я, прізвище українськими літерами й клас, наприклад 6-А.');return}$('#test').classList.remove('hidden');renderQuiz();$('#test').scrollIntoView({behavior:'smooth'})});
$('#finish').addEventListener('click',()=>{
 const missing=questions.map((x,i)=>doneFor(x,i)?null:i+1).filter(Boolean);
 if(missing.length){$('#score').textContent='Спочатку дайте відповіді на всі завдання: '+missing.join(', ')+'.';return}
 let score=0;
 questions.forEach((x,i)=>{
 let ok=false;
 if(x.ty==='one'||x.ty==='multi'){const v=[...document.querySelectorAll('input[name="q'+i+'"]:checked')].map(a=>+a.value).sort((a,b)=>a-b);ok=x.ty==='one'?v.length===1&&v[0]===x.a:JSON.stringify(v)===JSON.stringify(x.a)}
 else {const v=x.rows.map((_,j)=>document.getElementById('q'+i+'r'+j).value);ok=JSON.stringify(v.map(String))===JSON.stringify(x.a.map(String))}
 if(ok)score++;
 });
 const n=$('#first').value.trim()+' '+$('#last').value.trim(),cl=$('#class').value.trim(),t=new Date().toLocaleString('uk-UA');
 $('#score').innerHTML='<div style="font-weight:900;font-size:1.25rem">Картка результату · корекція ДТР-1</div><p>'+n+' · '+cl+'</p><h2 style="font-size:2rem">'+score+' / 10 · '+(score*10)+'%</h2><p>'+(score>=9?'Мета корекції досягнута.':score>=6?'Є прогрес; перевірте масштаб, джерела й азимут.':'Поверніться до станцій та пройдіть індивідуальну корекцію.')+'</p><p><b>Дата та час:</b> '+t+'</p><p><b>Зробіть скриншот цієї картки й надішліть учителю.</b></p><button type="button" onclick="window.print()">Друкувати</button>';
 $('#score').style.cssText='background:#e6f6f5;border:3px solid #0c8f92;border-radius:18px;padding:22px;margin:20px 0;color:#174a59';
 $('#quiz').hidden=true;$('#finish').hidden=true;$('#score').scrollIntoView({behavior:'smooth'});
});