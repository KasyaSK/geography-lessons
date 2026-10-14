
(()=>{
'use strict';
const $=id=>document.getElementById(id), done=new Set();
function complete(k){done.add(k);const n=done.size;const bar=$('progressFill');if(bar)bar.style.width=(n/4*100)+'%';if($('progressNum'))$('progressNum').textContent=n+'/4';if($('progressText'))$('progressText').textContent=n===4?'Усі справи закрито. Результат готовий до скриншота.':'Зібрано доказів: '+n+' із 4 етапів.'}
const evidence={
route:{answer:'general',reason:'Мандрівникам потрібні дороги, річки й населені пункти. Загальногеографічна карта підходить краще за карту одного статистичного показника.'},
density:{answer:'density',reason:'Густота вимірює кількість жителів на 1 км². Потрібна тематична карта з підписаною шкалою; фізична карта не покаже густоту.'},
heat:{answer:'temp',reason:'Для порівняння річної температури потрібна карта із °C і зазначеним періодом. За нею не можна передбачити погоду на завтра.'}
};
const chosen={};
document.querySelectorAll('[data-evidence]').forEach(b=>b.addEventListener('click',()=>{
const k=b.dataset.evidence,v=b.dataset.pick,x=evidence[k],panel=$('fb-'+k);
document.querySelectorAll('[data-evidence="'+k+'"]').forEach(z=>{z.classList.toggle('selected',z===b&&v===x.answer);z.classList.toggle('wrong',z===b&&v!==x.answer);z.setAttribute('aria-pressed',String(z===b))});
chosen[k]=v===x.answer;
panel.classList.toggle('bad',!chosen[k]);panel.textContent=(chosen[k]?'✅ Доказ прийнято. ':'❌ Не та карта. ')+x.reason;
if(Object.keys(evidence).every(k=>chosen[k])){complete('source');$('mission1Result').textContent='СПРАВУ 01 ЗАКРИТО: Ви вмієте добирати карту під запитання.'}
}));
const places={
zap:{bbox:[34.80,47.70,35.40,48.05],label:'Запоріжжя: знайдіть Дніпро, дороги, підписані назви районів та умовні позначення. Які об’єкти різного типу видно водночас?'},
car:{bbox:[23.65,48.22,24.65,48.83],label:'Карпати: порівняйте дороги та річкові долини. Якої інформації про крутизну схилів бракує на звичайній карті?'},
kyiv:{bbox:[30.15,50.18,30.92,50.73],label:'Київ: знайдіть Дніпро, мости й забудовані квартали. Які три різні географічні об’єкти показано різними знаками?'}
};
document.querySelectorAll('[data-region]').forEach(b=>b.addEventListener('click',()=>{
const p=places[b.dataset.region];if(!p)return;
$('osmMap').src='https://www.openstreetmap.org/export/embed.html?bbox='+p.bbox.join('%2C')+'&layer=mapnik';
$('osmMap').title='OpenStreetMap: '+b.textContent.trim();
$('mapQuestion').textContent=p.label;
document.querySelectorAll('[data-region]').forEach(z=>z.classList.toggle('selected',z===b));
}));
$('checkMap').addEventListener('click',()=>{
const a=$('objectRiver').value,b=$('objectForest').value,c=$('objectCity').value;
const ok=a==='line'&&b==='area'&&c==='point';
const fb=$('mapResult');fb.classList.toggle('bad',!ok);
fb.textContent=ok?'✅ Справа закрита. Сині лінії часто позначають водотоки; площинні заливки — ділянки; значки — точкові об’єкти. Важливо: точне значення кожного знака визначає легенда конкретної карти.':'❌ Зверніть увагу на геометрію: русло річки витягнуте; ліс займає площу; значок станції є точковим. Звірте з умовними знаками в легенді.';
if(ok)complete('map');
});
const verdicts={
v1:{answer:'yes',ok:'На карті 2025 року густота Бангладеш більша, ніж Монголії. Це перевірювана статистична характеристика, а не доказ про площу країни.',no:'Порівняйте країни на карті густоти: значення вимірюються особами на 1 км².'},
v2:{answer:'no',ok:'Правильно: карта середньої температури за 2025 рік не є прогнозом погоди на завтра. Для прогнозу потрібні окремі погодні дані.',no:'Уважно подивіться на дату: середньорічна температура і завтрашня погода — різні поняття.'},
v3:{answer:'no',ok:'Правильно: обидві карти мають власні одиниці й кольорові шкали. Колір поза легендою не є доказом.',no:'Темний колір не має універсального значення. Обов’язково читайте легенду та назву показника.'}
};
const verdictSolved={};
document.querySelectorAll('[data-verdict-case]').forEach(b=>b.addEventListener('click',()=>{
const k=b.dataset.verdictCase,yes=b.dataset.verdict,meta=verdicts[k],ok=yes===meta.answer;
document.querySelectorAll('[data-verdict-case="'+k+'"]').forEach(z=>{z.classList.toggle('selected',z===b&&ok);z.classList.toggle('wrong',z===b&&!ok)});
const out=$('fb-'+k);out.textContent=(ok?'✅ ':'↻ ')+(ok?meta.ok:meta.no);out.classList.toggle('bad',!ok);
verdictSolved[k]=ok;
if(['v1','v2','v3'].every(x=>verdictSolved[x])){complete('thematic');$('mission3Result').textContent='СПРАВУ 03 ЗАКРИТО: три твердження перевірені за картами й легендами.'}
}));
$('checkCER').addEventListener('click',()=>{
const a=$('cerClaim').value.trim(),b=$('cerEvidence').value.trim(),c=$('cerReason').value.trim();
const out=$('cerFeedback');
if(a.length<20||b.length<65||c.length<45){out.classList.add('bad');out.textContent='Потрібні три частини: чітке твердження, щонайменше два конкретні картографічні докази і пояснення, що пов’язує їх із висновком. Розгорніть відповідь.';return}
out.classList.remove('bad');out.textContent='Структура аргументу повна. Самоперевірка: чи названо тип карти, показник та одиницю? Чи не підмінено багаторічні середні значення прогнозом погоди? Текст збережено на сторінці, автоматична перевірка його фактичної правильності не проводиться.';
});
const qs=[
{type:'single',q:'Редактор просить карту, щоб знайти дорогу між двома населеними пунктами. Який набір даних найважливіший?',opts:['Середньорічні температури','Шляхи сполучення, населені пункти та водні перешкоди','Густота населення за країнами','Чисельність населення материків'],answer:1,why:'Маршрут спирається на місцеположення й транспортну мережу.'},
{type:'single',q:'На карті густоти населення Бангладеш має високе значення. Що можна довести саме цією картою?',opts:['У країні завтра буде тепло','У країні найбільша площа','На 1 км² у середньому припадає багато людей','У кожному її місті щільність однакова'],answer:2,why:'Густота населення — середня кількість жителів на одиницю площі, а не площа чи погода.'},
{type:'single',q:'Дві карти зафарбували Монголію в різні кольори. Найобґрунтованіший висновок?',opts:['Одна карта точно помилкова','Потрібно зіставити назви, показники, шкали й роки','Темніший колір завжди означає більше','Краще не використовувати кольорові карти'],answer:1,why:'Кожна карта використовує власну легенду і може показувати різні дані.'},
{type:'single',q:'Учень хоче з’ясувати крутизну карпатського схилу. Яка карта найкорисніша?',opts:['Карта з горизонталями та висотами','Карта вікової структури населення','Схема часових поясів','Карта середніх температур країн'],answer:0,why:'Зближення горизонталей за однакового перерізу рельєфу означає крутіший схил.'},
{type:'multi',q:'Оберіть ТРИ надійні кроки під час читання тематичної карти.',opts:['Прочитати назву показника','Перевірити легенду й одиниці вимірювання','Порівняти території за даними','Вважати кожен синій колір річкою'],answer:[0,1,2],why:'Назва, шкала і порівняння значень — три обов’язкові етапи.'},
{type:'multi',q:'Які ДВА твердження карта середньорічної температури 2025 року НЕ дозволяє встановити?',opts:['У якій країні середньорічна температура вища','Скільки опадів буде завтра в Києві','Яку величину позначає легенда','Чи завтра в Єгипті буде точно спекотніше, ніж в Україні'],answer:[1,3],why:'Карта середньорічної температури не дає погодного прогнозу на окремий день.'},
{type:'match',q:'Зіставте об’єкт із видом умовного знака.',rows:[['Місто у дрібному масштабі','point'],['Річка','line'],['Лісовий масив','area']],opts:[['','Оберіть тип'],['point','Точковий'],['line','Лінійний'],['area','Площинний']],why:'Точкові знаки позначають локальні об’єкти; лінійні — протяжні; площинні — території.'},
{type:'order',q:'Виберіть правильну послідовність перевірки картографічного твердження.',labels:['Спочатку','Потім','Далі','Наприкінці'],opts:[['','Оберіть дію'],['title','Прочитати назву карти'],['legend','Перевірити легенду та одиниці'],['values','Порівняти потрібні території'],['conclusion','Зробити висновок та назвати обмеження']],answer:['title','legend','values','conclusion'],why:'Спочатку з’ясовують зміст і одиниці, потім читають дані та формулюють обмежений висновок.'},
{type:'single',q:'Щоб перевірити твердження «за 30 років густота населення країни зросла», яких даних достатньо?',opts:['Карти температури й річок за один рік','Карта густоти населення тільки за 2025 рік','Значення густоти тієї самої країни щонайменше для двох років','Фотографія столиці'],answer:2,why:'Твердження про зміну в часі потребує щонайменше двох порівнюваних дат.'},
{type:'single',q:'Оберіть найкращий висновок у форматі «твердження — доказ — пояснення».',opts:['Густота висока, адже колір красивий','Бангладеш велика держава, бо на карті вона помаранчева','За тематичною картою густота Бангладеш вища за Монголію; легенда вимірює осіб/км², отже порівнюємо середню кількість людей на однакову площу','Темна країна завжди більша'],answer:2,why:'Належний аргумент посилається на конкретний показник і пояснює зв’язок доказу з висновком.'}
];
function esc(x){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
const quiz=$('quiz');
qs.forEach((q,i)=>{
const div=document.createElement('div');div.className='quizQ';div.dataset.q=String(i);
let out='<div class="number">ЗАВДАННЯ '+String(i+1).padStart(2,'0')+' / 10</div><b>'+esc(q.q)+'</b>';
if(q.type==='single'||q.type==='multi'){out+=q.opts.map((o,j)=>'<label><input type="'+(q.type==='multi'?'checkbox':'radio')+'" name="q'+i+'" value="'+j+'"> '+esc(o)+'</label>').join('')}
else if(q.type==='match'){out+=q.rows.map((r,j)=>'<label>'+esc(r[0])+'<select data-q7="'+j+'">'+q.opts.map(opt=>'<option value="'+opt[0]+'">'+esc(opt[1])+'</option>').join('')+'</select></label>').join('')}
else{out+=q.labels.map((label,j)=>'<label>'+esc(label)+'<select data-q8="'+j+'">'+q.opts.map(opt=>'<option value="'+opt[0]+'">'+esc(opt[1])+'</option>').join('')+'</select></label>').join('')}
div.innerHTML=out;quiz.appendChild(div);
});
const finish=document.createElement('button');finish.type='submit';finish.className='btn';finish.textContent='Перевірити 10 завдань →';quiz.appendChild(finish);
function nameValid(s){return /^[А-ЯІЇЄҐа-яіїєґA-Za-z'’\-\s]+$/u.test(s)&&s.length>=2}
$('unlock').addEventListener('click',()=>{
const n=$('first').value.trim(),s=$('last').value.trim(),cl=$('klass').value.trim();
if(!nameValid(n)||!nameValid(s)||!/^6(?:[\s\-–]?[А-Яа-яA-Za-zІіЇїЄєҐґ0-9]{1,3})?$/.test(cl)){
$('gateMsg').textContent='Вкажіть ім’я, прізвище без цифр і клас 6, 6-А або 6-Б.';return
}
$('gate').hidden=true;quiz.hidden=false;$('quizIntro').hidden=false;quiz.scrollIntoView({behavior:'smooth',block:'start'});
});
quiz.addEventListener('submit',e=>{
e.preventDefault();let score=0;const notes=[];
qs.forEach((q,i)=>{
let ok=false;
if(q.type==='single'){const s=quiz.querySelector('input[name="q'+i+'"]:checked');ok=!!s&&Number(s.value)===q.answer}
if(q.type==='multi'){const selected=[...quiz.querySelectorAll('input[name="q'+i+'"]:checked')].map(x=>Number(x.value)).sort((a,b)=>a-b);ok=JSON.stringify(selected)===JSON.stringify(q.answer)}
if(q.type==='match'){ok=q.rows.every((r,j)=>quiz.querySelector('select[data-q7="'+j+'"]').value===r[1])}
if(q.type==='order'){ok=q.answer.every((v,j)=>quiz.querySelector('select[data-q8="'+j+'"]').value===v)}
if(ok)score++;else notes.push('№'+(i+1)+': '+q.why);
});
const date=new Date().toLocaleString('uk-UA',{dateStyle:'medium',timeStyle:'short'});
$('who').textContent=$('last').value.trim()+' '+$('first').value.trim()+' • '+$('klass').value.trim();
$('when').textContent=date;$('score').textContent=score+'/10';
$('level').textContent=score===10?'Рівень: майстер картографії':score>=8?'Рівень: упевнений дослідник':score>=5?'Рівень: молодший дослідник':'Рівень: тренуємо читання карт';
const lst=$('mistakes');lst.replaceChildren();
if(!notes.length){const p=document.createElement('p');p.textContent='Усі десять завдань виконано правильно.';lst.appendChild(p)}
else notes.forEach(t=>{const p=document.createElement('p');p.textContent=t;lst.appendChild(p)});
$('result').hidden=false;complete('quiz');$('result').scrollIntoView({behavior:'smooth',block:'start'});
});
$('printCard').addEventListener('click',()=>window.print());
})();
