
(()=>{'use strict';
const el=id=>document.getElementById(id), all=s=>Array.from(document.querySelectorAll(s));
const store='geo6-case13-20261014',state={badges:[false,false,false,false],cases:{},heroIdea:'',fieldNotes:'',densityReason:'',cer:''};
try{const old=JSON.parse(localStorage.getItem(store)||'null');if(old&&Array.isArray(old.badges)){Object.assign(state,old);state.badges=old.badges.slice(0,4);while(state.badges.length<4)state.badges.push(false)}}catch(e){}
const save=()=>{try{localStorage.setItem(store,JSON.stringify(state))}catch(e){}};
function feedback(id,msg,bad){const n=el(id);if(!n)return;n.textContent=msg;n.classList.toggle('error',!!bad);}
function update(){const n=state.badges.filter(Boolean).length;el('progressNum').textContent=n;el('progressBar').style.width=(25*n)+'%';all('[data-stamp]').forEach(p=>{const v=state.badges[+p.dataset.stamp];p.dataset.done=String(v);const s=p.querySelector('[data-pip-status]');if(s)s.textContent=v?'✓':'○'})}
function unlock(i){if(!state.badges[i]){state.badges[i]=true;save()}update()}
update();
const inputs=['heroIdea','fieldNotes','densityReason','cer'];
inputs.forEach(id=>{if(!el(id))return;el(id).value=state[id]||'';el(id).addEventListener('input',()=>{state[id]=el(id).value;save()})});
const cases={route:{right:'general',msg:'Маршрути, дороги, річки й мости одночасно — загальногеографічна карта.'},people:{right:'density',msg:'Густота населення — тематичний показник в особах на км², а не просто розташування міст.'},weather:{right:'temp',msg:'Кліматична тематична карта містить шкалу температури в °C і часовий період.'}};
all('[data-case]').forEach(card=>{
 const key=card.dataset.case;
 all('[data-pick="'+key+'"]').forEach(btn=>{
 btn.setAttribute('aria-pressed',String(state.cases[key]===btn.dataset.value));
 btn.addEventListener('click',()=>{
  state.cases[key]=btn.dataset.value;save();
  all('[data-pick="'+key+'"]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  const correct=cases[key].right===btn.dataset.value;
  feedback('result-'+key,(correct?'✓ Так! ':'Спробуйте іншу карту. ')+cases[key].msg,!correct);
  if(Object.keys(cases).every(k=>state.cases[k]===cases[k].right)){unlock(0);feedback('caseFinal','Доказ №1 отримано: Ви обираєте карту за запитанням, на яке вона має відповісти.')}
 });
 });
});
const places={
 z:{name:'Запоріжжя',bbox:'34.80%2C47.70%2C35.40%2C48.05',url:'https://www.openstreetmap.org/#map=11/47.87/35.10',note:'Шукайте Дніпро, мости, дороги та квартали. Чи можна тут визначити густоту населення у осіб/км²?'},
 c:{name:'Карпати',bbox:'23.70%2C48.20%2C24.65%2C48.85',url:'https://www.openstreetmap.org/#map=10/48.5/24.2',note:'Знайдіть дороги й річки серед гір. Чи достатньо звичайної карти, щоб знати крутість схилу?'},
 k:{name:'Київ',bbox:'30.15%2C50.18%2C30.92%2C50.73',url:'https://www.openstreetmap.org/#map=11/50.45/30.52',note:'Знайдіть Дніпро, дороги та мости. Які об’єкти позначені лініями, а які площами?'}
};
all('[data-map-place]').forEach(btn=>btn.addEventListener('click',()=>{
 const p=places[btn.dataset.mapPlace];if(!p)return;
 const map=el('realMap');map.src='https://www.openstreetmap.org/export/embed.html?bbox='+p.bbox+'&layer=mapnik';map.title='OpenStreetMap — '+p.name;
 el('mapNote').textContent=p.note;el('mapExternal').href=p.url;
 all('[data-map-place]').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));
}));
el('verifyField').addEventListener('click',()=>{
 const c=document.querySelector('input[name=fieldChoice]:checked'),note=el('fieldNotes').value.trim();
 if(!c){feedback('fieldResult','Спочатку оберіть висновок, який може підтвердити карта.',true);return}
 if(c.value!=='map'){feedback('fieldResult','На OpenStreetMap видно розташування доріг, річок та об’єктів. Середню температуру чи густоту населення ця карта напряму не вимірює.',true);return}
 if(note.length<45){feedback('fieldResult','Висновок обрано правильно. Додайте докази: назвіть регіон і щонайменше два конкретні об’єкти різних типів, які побачили.',true);return}
 unlock(1);feedback('fieldResult','Доказ №2 отримано! Переконайтеся, що у Вашій відповіді названі реальні об’єкти. Автоматично перевірено повноту, а не правдивість назв.');
});
el('verifyDensity').addEventListener('click',()=>{
 const c=document.querySelector('input[name=densityChoice]:checked'),note=el('densityReason').value.trim();
 if(!c){feedback('densityResult','Оберіть одне твердження, яке підтверджується числовими даними.',true);return}
 if(c.value!=='b'){feedback('densityResult','Ні: площа країни, загальна кількість людей та густота населення — різні величини. На карті Бангладеш ≈1350 осіб/км², Канада ≈4,6 осіб/км² (оцінка на 2025 рік).',true);return}
 if(note.length<38){feedback('densityResult','Додайте пояснення: що означає осіб/км²? Який рік даних? Чого не можна дізнатися з карти?',true);return}
 unlock(2);feedback('densityResult','Доказ №3 отримано! Країна з більшою площею не обов’язково має більшу густоту. Карта за країнами не показує відмінності всередині кожної країни.');
});
const truth={t1:'no',t2:'yes',t3:'no'},choice={};
all('[data-trap]').forEach(btn=>btn.addEventListener('click',()=>{
 const k=btn.dataset.trap,v=btn.dataset.value;choice[k]=v;
 all('[data-trap="'+k+'"]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
 let correct=v===truth[k];
 let why=k==='t1'?'Колір набуває значення лише всередині легенди конкретної карти.':k==='t2'?'Читати карту слід за назвою, легендою, одиницями вимірювання й доказами.':'Середня температура за рік не є прогнозом погоди на завтра.';
 feedback('answer-'+k,(correct?'✓ Правильно. ':'Ні. ')+why,!correct);
 if(Object.keys(truth).every(n=>choice[n]===truth[n])){unlock(3);feedback('trapFinal','Усі 4 докази зібрано. Ви розкрили справу — час сформулювати підсумкову відповідь!')}
}));
const questions=[
{t:'one',q:'Експедиції потрібні дороги, мости, річки та поселення одночасно. Яку карту обрати?',a:['Карта середніх температур','Загальногеографічна карта','Карта густоти населення','Карта опадів'],r:1},
{t:'one',q:'На карті густоти Бангладеш має 1350 осіб/км², Канада — 4,6. Який висновок підтримують ці дані?',a:['У Бангладеш обов’язково більше мешканців загалом','У Канаді немає великих міст','У Бангладеш вища середня густота','В усіх частинах Бангладеш густота однакова'],r:2},
{t:'one',q:'Учень каже: «На карті темне = гори». Що він пропустив?',a:['Назву карти й легенду','Список мандрівників','Розу вітрів','Назву вчителя'],r:0},
{t:'one',q:'Чи можна за картою середньої річної температури передбачити дощ завтра?',a:['Так, якщо карта яскрава','Ні, потрібен оперативний прогноз погоди','Так, якщо є кордони','Тільки на океані'],r:1},
{t:'many',q:'Оберіть УСІ ознаки для правильного читання тематичної карти.',a:['Назва показника','Красиве оформлення','Одиниці та інтервали легенди','Дата або період даних'],r:[0,2,3]},
{t:'many',q:'Які карти тематичні?',a:['Дороги, поселення, річки та межі разом','Середня річна кількість опадів','Густота населення','Фізична карта світу з рельєфом'],r:[1,2]},
{t:'pair',q:'Доберіть джерело до завдання.',tasks:['Прокласти дорогу між селами','Порівняти число мешканців на км²','Дізнатися висоту гірської вершини'],r:['general','density','relief']},
{t:'order',q:'Установіть правильну послідовність читання тематичної карти.',r:['title','legend','compare','claim']},
{t:'one',q:'Дві країни мають однакову густоту. Чого бракує, щоб порівняти загальну кількість населення?',a:['Лише кольору легенди','Назв континентів','Площі суходолу країн','Напрямку на північ'],r:2},
{t:'one',q:'Обрати найкращий доказовий висновок:',a:['Країна темніша — отже, там більше мешканців','Легенда показує осіб/км²; 1350 у Бангладеш більше за 4,6 у Канаді, отже, середня густота Бангладеш вища','Земля велика, тому карта темна','Колір завжди означає температуру'],r:1}
];
const quiz=el('quiz');
const opts=(name,values)=>'<select name="'+name+'" required><option value="">Оберіть...</option>'+values.map(x=>'<option value="'+x[0]+'">'+x[1]+'</option>').join('')+'</select>';
function makeQuestion(q,i){
 let body='';
 if(q.t==='one'||q.t==='many')body='<div class="quiz-options">'+q.a.map((a,j)=>'<label><input type="'+(q.t==='many'?'checkbox':'radio')+'" name="q'+i+'" value="'+j+'"><span>'+a+'</span></label>').join('')+'</div>';
 if(q.t==='pair')body=q.tasks.map((t,j)=>'<label>'+t+opts('q'+i+'_'+j,[['general','Загальногеографічна'],['density','Карта густоти населення'],['relief','Фізична / топографічна']])+'</label>').join('');
 if(q.t==='order')body=[0,1,2,3].map(j=>'<label>Крок '+(j+1)+opts('q'+i+'_'+j,[['title','Визначити тему й період'],['legend','Прочитати легенду й одиниці'],['compare','Порівняти дані територій'],['claim','Сформулювати доказовий висновок']])+'</label>').join('');
 return '<fieldset class="quiz-item"><legend>'+(i+1)+'. '+q.q+'</legend>'+body+'</fieldset>';
}
quiz.innerHTML=questions.map(makeQuestion).join('')+'<p class="muted">Кожне завдання — 1 бал. Множинний вибір зараховується лише за повний правильний набір.</p><button type="submit" class="action">Відправити відповіді та отримати результат →</button>';
const nameOk=s=>s.length>=2&&/^[А-ЯІЇЄҐа-яіїєґ'’ʼ\-]+$/u.test(s);
el('startQuiz').addEventListener('click',()=>{
 const first=el('studentFirst').value.trim(),last=el('studentLast').value.trim(),cls=el('studentClass').value.trim();
 if(!nameOk(first)||!nameOk(last)||!/^6[-–]?[A-Za-zА-ЯІЇЄҐа-яіїєґ0-9]{0,3}$/u.test(cls)){feedback('gateFeedback','Заповніть ім’я, прізвище та клас (наприклад, 6-А). Без цифр в імені та прізвищі.',true);return}
 el('quizGate').hidden=true;quiz.hidden=false;el('quizCaption').textContent='Тест для: '+last+' '+first+', '+cls;
 quiz.scrollIntoView({behavior:'smooth'});
});
quiz.addEventListener('submit',e=>{
 e.preventDefault();let score=0,miss=[];
 questions.forEach((q,i)=>{
  let ok=false;
  if(q.t==='one'){const a=quiz.querySelector('input[name="q'+i+'"]:checked');ok=!!a&&Number(a.value)===q.r}
  if(q.t==='many'){const got=all('#quiz input[name="q'+i+'"]:checked').map(a=>Number(a.value)).sort().join(',');ok=got===q.r.slice().sort().join(',')}
  if(q.t==='pair'||q.t==='order'){ok=q.r.every((v,j)=>quiz.querySelector('select[name="q'+i+'_'+j+'"]')?.value===v)}
  if(ok)score++;else miss.push(i+1);
 });
 const date=new Intl.DateTimeFormat('uk-UA',{timeZone:'Europe/Kyiv',dateStyle:'medium',timeStyle:'short'}).format(new Date());
 const last=el('studentLast').value.trim(),first=el('studentFirst').value.trim(),cls=el('studentClass').value.trim();
 const comment=score>=9?'Вмієте розрізняти картографічні докази.':score>=7?'Добре. Перевірте складні запитання й обмеження карт.':score>=5?'Потрібне повторення читання легенди й вибору карти.':'Поверніться до картографічної лабораторії та спробуйте ще раз.';
 const out=el('quizResult');out.hidden=false;
 out.innerHTML='<div class="tag dark">КАРТКА РЕЗУЛЬТАТУ</div><h3>Місія завершена</h3><p>'+last+' '+first+' • '+cls+'</p><div class="score">'+score+' / 10</div><p>Географія • 6 клас • Загальногеографічні та тематичні карти</p><p>'+score*10+'% • '+comment+'</p><p>Дата і час (Київ): '+date+'</p><p>Запитання для повторення: '+(miss.length?miss.join(', '):'немає')+'.</p><p><b>Зробіть скриншот результату й надішліть учителю.</b></p><button id="printResult" class="action secondary" type="button">Роздрукувати картку</button>';
 el('printResult').addEventListener('click',()=>window.print());out.scrollIntoView({behavior:'smooth',block:'center'});
});
el('restartMission').addEventListener('click',()=>{
 if(!confirm('Очистити печатки та нотатки місії й почати заново?'))return;
 try{localStorage.removeItem(store)}catch(e){}
 state.badges=[false,false,false,false];state.cases={};
 inputs.forEach(id=>{state[id]='';if(el(id))el(id).value=''});
 all('[data-pick]').forEach(b=>b.setAttribute('aria-pressed','false'));
 all('[data-trap]').forEach(b=>b.setAttribute('aria-pressed','false'));
 all('.feedback').forEach(n=>{n.textContent='';n.classList.remove('error')});
 el('quizResult').hidden=true;update();window.scrollTo({top:0,behavior:'smooth'});
});
})();
