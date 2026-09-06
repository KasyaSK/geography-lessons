const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
function show(el,msg,type='mid'){el.textContent=msg;el.className=`feedback show ${type}`}

// Hypothesis
$('#saveHyp').addEventListener('click',()=>{const v=$('#hyp').value.trim();show($('#hypFb'),v.length>25?'Гіпотезу зафіксовано. Не виправляйте її зараз — повернемося до неї після карт і розрахунків.':'Спробуйте дати повнішу гіпотезу: назвіть хоча б один процес і один можливий чинник.',v.length>25?'good':'mid')});

// Demographic quick decisions
const quickAnswers={a:'natural-plus',b:'natural-minus',c:'migration'};
$$('.decision').forEach(card=>{card.querySelectorAll('.choice').forEach(btn=>btn.addEventListener('click',()=>{card.querySelectorAll('.choice').forEach(b=>b.classList.remove('selected','correct','wrong'));btn.classList.add('selected');const ok=btn.dataset.answer===quickAnswers[card.dataset.case];btn.classList.add(ok?'correct':'wrong');const fb=card.querySelector('.feedback');show(fb,ok?card.dataset.good:card.dataset.bad,ok?'good':'bad')}))});

// Calculator
$('#calcBtn').addEventListener('click',()=>{
  const pop=+$('#pop').value,births=+$('#births').value,deaths=+$('#deaths').value,mig=+$('#migration').value;
  if(!(pop>0)||births<0||deaths<0||Number.isNaN(mig)){show($('#calcFb'),'Перевірте дані: населення має бути > 0, народжені й померлі — не від’ємні.','bad');return}
  const cb=(births/pop*1000),cd=(deaths/pop*1000),ni=cb-cd,total=(births-deaths+mig);
  $('#mBirth').textContent=cb.toFixed(1)+'‰';$('#mDeath').textContent=cd.toFixed(1)+'‰';$('#mNatural').textContent=(ni>=0?'+':'')+ni.toFixed(1)+'‰';$('#mTotal').textContent=(total>=0?'+':'')+Math.round(total).toLocaleString('uk-UA');
  show($('#calcFb'),`Природна зміна = ${(births-deaths).toLocaleString('uk-UA')} осіб. Загальна зміна з урахуванням міграції = ${Math.round(total).toLocaleString('uk-UA')} осіб. Це різні показники.`, 'good');
});

// Factor classifier cycles neutral -> birth -> death -> both
$$('.factor').forEach(b=>b.addEventListener('click',()=>{const states=['none','birth','death','both'];let i=states.indexOf(b.dataset.state||'none');i=(i+1)%states.length;b.dataset.state=states[i];b.querySelector('span').textContent={none:'не визначено',birth:'переважно народжуваність',death:'переважно смертність',both:'обидва'}[states[i]]}));
$('#checkFactors').addEventListener('click',()=>{const key={f1:'death',f2:'birth',f3:'both',f4:'both',f5:'birth',f6:'death'};let correct=0;Object.entries(key).forEach(([id,v])=>{if($('#'+id).dataset.state===v)correct++});show($('#factorFb'),correct===6?'6/6. Важливо: чинники часто діють опосередковано й можуть впливати на обидва процеси, але тут ми обрали домінантний канал.':`${correct}/6. Перегляньте логіку: вікова структура впливає і на народжуваність, і на смертність; доступність контрацепції — передусім на народжуваність; епідемії — передусім на смертність.`,correct>=5?'good':'mid')});

// Map evidence check
$('#mapCheck').addEventListener('click',()=>{const a=$('#mapQ1').value,b=$('#mapQ2').value,c=$('#mapQ3').value;let n=(a==='age')+(b==='natural')+(c==='no');show($('#mapFb'),n===3?'3/3. Ви відокремили показник від його можливих причин і не переплутали природний рух із повною зміною чисельності.':`${n}/3. Підказка: сирі коефіцієнти залежать від вікової структури; природний приріст = народжуваність − смертність; міграція до нього не входить.`,n===3?'good':'mid')});

// Mission tabs
$$('.level-tabs button').forEach(btn=>btn.addEventListener('click',()=>{$$('.level-tabs button').forEach(x=>x.classList.remove('active'));$$('.level-panel').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('#'+btn.dataset.target).classList.add('active')}));

// Logical duel
$$('[data-duel]').forEach(btn=>btn.addEventListener('click',()=>{const ok=btn.dataset.duel==='c';$$('[data-duel]').forEach(b=>b.classList.remove('correct','wrong'));btn.classList.add(ok?'correct':'wrong');show($('#duelFb'),ok?'Так. Сирий коефіцієнт смертності залежить від вікової структури. Для оцінки ризику смерті або якості системи охорони здоров’я потрібні віково-стандартизовані показники та інші дані.':'Ні. Карта сирої смертності сама по собі не доводить ні якість медицини, ні «здоров’я нації»: старше населення може мати вищий грубий коефіцієнт смертності навіть за кращих вікових ризиків.','good') }));

// CER save
$('#cerSave').addEventListener('click',()=>{const vals=['cerC','cerE','cerR'].map(id=>$('#'+id).value.trim());const ok=vals.every(v=>v.length>=25);show($('#cerFb'),ok?'CER готовий: у Вас є твердження, конкретний доказ і причинне пояснення. Тепер перевірте, чи не переплутали природний приріст із загальним приростом населення.':'Заповніть усі три частини. Доказ має містити конкретний показник/карту/розрахунок, а пояснення — показувати зв’язок доказу з твердженням.',ok?'good':'mid')});

// Quiz gate
function validFullName(v){const parts=v.trim().replace(/\s+/g,' ').split(' ');return parts.length>=2&&parts.every(p=>/^[А-ЯІЇЄҐа-яіїєґ'’\-]+$/.test(p))}
$('#startQuiz').addEventListener('click',()=>{const name=$('#fullName').value,cl=$('#studentClass').value.trim();if(!validFullName(name)||!cl){show($('#gateFb'),'Введіть ім’я та прізвище (щонайменше два слова, без цифр) і клас.','bad');return}$('#identityGate').style.display='none';$('#quizWrap').classList.add('open');$('#quizWrap').scrollIntoView({behavior:'smooth',block:'start'})});
function radio(name){const x=$(`input[name="${name}"]:checked`);return x?x.value:''}function checks(name){return $$(`input[name="${name}"]:checked`).map(x=>x.value).sort().join(',')}
$('#submitQuiz').addEventListener('click',()=>{
  let s=0;
  if(radio('q1')==='b')s++;if(radio('q2')==='c')s++;if(radio('q3')==='b')s++;if(radio('q4')==='c')s++;
  if(checks('q5')==='a,c,d')s++;if(checks('q6')==='a,b,d')s++;
  if($('#q7a').value==='birth'&&$('#q7b').value==='death'&&$('#q7c').value==='natural')s++;
  if($('#q8a').value==='rates'&&$('#q8b').value==='compare'&&$('#q8c').value==='age'&&$('#q8d').value==='limits')s++;
  if(radio('q9')==='d')s++;if(radio('q10')==='b')s++;
  const pct=s*10;$('#scoreText').textContent=`${s}/10 • ${pct}%`;$('#resName').textContent=$('#fullName').value.trim().replace(/\s+/g,' ');$('#resClass').textContent=$('#studentClass').value.trim();$('#resDate').textContent=new Date().toLocaleString('uk-UA');
  $('#levelComment').textContent=s<=4?'Потрібно повторити: природний рух, коефіцієнти та різницю між природною і загальною зміною населення.':s<=7?'Достатній рівень: формули засвоєні, але варто допрацювати інтерпретацію карт і роль вікової структури.':s<=9?'Добре: Ви відокремлюєте показники від причин і бачите обмеження сирих коефіцієнтів.':'Відмінно: Ви коректно працюєте з природним рухом, просторовими відмінностями та межами висновку.';
  $('#resultCard').style.display='block';$('#resultCard').scrollIntoView({behavior:'smooth',block:'center'});
});
$('#retryQuiz').addEventListener('click',()=>{if(confirm('Очистити відповіді тесту? ПІБ і клас залишаться.')){$('#quizForm').reset();$('#resultCard').style.display='none';$('#quizWrap').scrollIntoView({behavior:'smooth'})}});$('#printResult').addEventListener('click',()=>window.print());
$('#textSize').addEventListener('click',()=>document.body.classList.toggle('large-text'));$('#toTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
